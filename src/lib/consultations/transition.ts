import "server-only";

import { z } from "zod";
import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { sendConsultationEmail } from "@/lib/notify";
import {
  authenticatedDatabase,
  consultantFor,
  ConsultationServerError,
  consultationErrorResponse,
  isMissingConsultationsSchema,
  mapBooking,
} from "./server";

const requestSchema = z.object({ bookingId: z.string().uuid() });

export async function handleConsultationTransition(
  request: Request,
  action: "accept" | "decline" | "cancel",
) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();

  let bookingId: string;
  try {
    bookingId = requestSchema.parse(await request.json()).bookingId;
  } catch {
    return Response.json({ error: "Invalid booking request", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    if (action !== "cancel") await consultantFor(identity);
    const database = authenticatedDatabase(identity.accessToken);
    const { data, error } = await database.rpc("transition_consultation_booking", {
      p_booking_id: bookingId,
      p_action: action,
    });
    if (error || !Array.isArray(data) || !data[0]) {
      if (isMissingConsultationsSchema(error)) {
        throw new ConsultationServerError(
          "The consultation database has not been activated yet.",
          "CONSULTATIONS_NOT_CONFIGURED",
          503,
        );
      }
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code === "P0002") throw new ConsultationServerError("Booking not found.", "BOOKING_NOT_FOUND", 404);
      if (code === "42501") throw new ConsultationServerError("You cannot update this booking.", "BOOKING_FORBIDDEN", 403);
      if (code === "55000") throw new ConsultationServerError("This booking can no longer be updated.", "INVALID_STATUS", 409);
      throw new ConsultationServerError("The booking status could not be updated.", "BOOKING_UPDATE_FAILED", 503);
    }

    const booking = mapBooking(data[0]);
    await sendConsultationEmail({
      event: action === "accept" ? "accepted" : action === "decline" ? "declined" : "cancelled",
      booking,
      recipient: booking.clientEmail,
    });
    return Response.json({
      booking,
      refundRequired: action === "decline" || action === "cancel",
    });
  } catch (error) {
    return consultationErrorResponse(error);
  }
}
