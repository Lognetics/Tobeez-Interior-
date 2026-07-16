import { z } from "zod";
import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { CONSULTATION_MODES, CONSULTATION_TYPES, DESIGNERS } from "@/lib/data/designers";
import { sendConsultationEmail } from "@/lib/notify";
import {
  authenticatedDatabase,
  ConsultationServerError,
  consultationErrorResponse,
  isMissingConsultationsSchema,
  mapBooking,
  verifyPaystackConsultation,
} from "@/lib/consultations/server";
import { CONSULTATION_TIMES } from "@/lib/consultations/types";

export const runtime = "nodejs";

const requestSchema = z.object({
  reference: z.string().trim().min(6).max(160),
  consultantId: z.string().trim().min(1).max(20),
  type: z.string().trim().min(3).max(120),
  mode: z.enum(["virtual", "phone", "physical"]),
  dateIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  clientName: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(2_000).default(""),
});

export async function POST(request: Request) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();

  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid consultation request", code: "INVALID_REQUEST" }, { status: 400 });
  }

  const consultant = DESIGNERS.find((item) => item.id === input.consultantId);
  const consultationMode = CONSULTATION_MODES.find((item) => item.id === input.mode);
  if (!consultant || !consultationMode || !CONSULTATION_TYPES.some((item) => item === input.type)) {
    return Response.json({ error: "Unknown consultation option", code: "INVALID_CONSULTATION" }, { status: 400 });
  }
  if (!CONSULTATION_TIMES.some((time) => time === input.time)) {
    return Response.json({ error: "Unknown consultation time", code: "INVALID_TIME" }, { status: 400 });
  }
  const scheduledAt = new Date(`${input.dateIso}T${input.time}:00`);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() - 60_000) {
    return Response.json({ error: "Choose a future consultation time", code: "INVALID_DATE" }, { status: 400 });
  }

  const database = authenticatedDatabase(identity.accessToken);
  try {
    const { data: existing, error: existingError } = await database
      .from("bookings")
      .select("*")
      .eq("paystack_ref", input.reference)
      .maybeSingle();
    if (existingError && isMissingConsultationsSchema(existingError)) {
      throw new ConsultationServerError(
        "The consultation database has not been activated yet.",
        "CONSULTATIONS_NOT_CONFIGURED",
        503,
      );
    }
    if (existing) return Response.json({ booking: mapBooking(existing), idempotent: true });

    await verifyPaystackConsultation({
      reference: input.reference,
      expectedAmount: consultationMode.price,
      expectedEmail: identity.email,
      expectedMetadata: {
        consultantId: input.consultantId,
        dateIso: input.dateIso,
        time: input.time,
        mode: input.mode,
      },
    });

    const { data: openDates, error: availabilityError } = await database.rpc("get_consultant_availability", {
      p_consultant_id: consultant.id,
      p_from: input.dateIso,
      p_to: input.dateIso,
    });
    if (availabilityError) {
      if (isMissingConsultationsSchema(availabilityError)) {
        throw new ConsultationServerError(
          "The consultation database has not been activated yet.",
          "CONSULTATIONS_NOT_CONFIGURED",
          503,
        );
      }
      throw new ConsultationServerError("Availability could not be confirmed.", "AVAILABILITY_CHECK_FAILED", 503);
    }
    const availableSlots = Array.isArray(openDates) && openDates[0] && Array.isArray(openDates[0].slots)
      ? openDates[0].slots as unknown[]
      : [];
    if (!availableSlots.includes(input.time)) {
      throw new ConsultationServerError(
        "Payment was received, but that slot is no longer available. Please contact TOBEEZ so the team can reschedule or refund it.",
        "SLOT_UNAVAILABLE_AFTER_PAYMENT",
        409,
      );
    }

    const { data, error } = await database.rpc("create_consultation_booking", {
      p_consultant_id: consultant.id,
      p_client_name: input.clientName,
      p_client_email: identity.email ?? "",
      p_type: input.type,
      p_mode: input.mode,
      p_date_iso: input.dateIso,
      p_time: input.time,
      p_amount: consultationMode.price,
      p_paystack_ref: input.reference,
      p_notes: input.notes,
    });
    if (error || !Array.isArray(data) || !data[0]) {
      if (isMissingConsultationsSchema(error)) {
        throw new ConsultationServerError(
          "The consultation database has not been activated yet.",
          "CONSULTATIONS_NOT_CONFIGURED",
          503,
        );
      }
      const conflict = error && typeof error === "object" && "code" in error && error.code === "23505";
      throw new ConsultationServerError(
        conflict
          ? "Payment was received, but that slot has just been taken. Please contact TOBEEZ so the team can reschedule or refund it."
          : "Payment was received, but the booking could not be saved. Please contact TOBEEZ with your Paystack reference.",
        conflict ? "SLOT_UNAVAILABLE_AFTER_PAYMENT" : "BOOKING_SAVE_FAILED_AFTER_PAYMENT",
        conflict ? 409 : 503,
      );
    }

    const booking = mapBooking(data[0]);
    await sendConsultationEmail({
      event: "created",
      booking,
      recipient: identity.email ?? "",
    });
    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    return consultationErrorResponse(error);
  }
}
