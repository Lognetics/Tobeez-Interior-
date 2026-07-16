import { z } from "zod";
import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import {
  authenticatedDatabase,
  consultantFor,
  ConsultationServerError,
  consultationErrorResponse,
  isMissingConsultationsSchema,
  publicDatabase,
} from "@/lib/consultations/server";
import { CONSULTATION_TIMES } from "@/lib/consultations/types";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const saveSchema = z.object({
  weekly: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    slots: z.array(z.enum(CONSULTATION_TIMES)).max(CONSULTATION_TIMES.length),
  })).max(7),
});

function mapAvailability(value: unknown) {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    ...(typeof record.date_iso === "string" ? { dateIso: record.date_iso } : {}),
    ...(typeof record.weekday === "number" ? { weekday: record.weekday } : {}),
    slots: Array.isArray(record.slots) ? record.slots.filter((slot): slot is string => typeof slot === "string") : [],
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const consultantId = url.searchParams.get("consultantId");

  if (consultantId) {
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? "";
    if (!datePattern.test(from) || !datePattern.test(to) || !["d1", "d2"].includes(consultantId)) {
      return Response.json({ error: "Invalid availability range", code: "INVALID_REQUEST" }, { status: 400 });
    }
    const start = new Date(`${from}T12:00:00Z`);
    const end = new Date(`${to}T12:00:00Z`);
    const dayCount = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    if (Number.isNaN(dayCount) || dayCount < 0 || dayCount > 62) {
      return Response.json({ error: "Invalid availability range", code: "INVALID_REQUEST" }, { status: 400 });
    }

    const database = publicDatabase();
    const { data, error } = await database.rpc("get_consultant_availability", {
      p_consultant_id: consultantId,
      p_from: from,
      p_to: to,
    });
    if (error) {
      if (isMissingConsultationsSchema(error)) {
        return Response.json({ availability: [], source: "fallback" });
      }
      return Response.json({ error: "Availability could not be loaded", code: "AVAILABILITY_LOAD_FAILED" }, { status: 503 });
    }
    return Response.json({ availability: (data ?? []).map(mapAvailability), source: "database" });
  }

  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();
  try {
    const consultant = await consultantFor(identity);
    const database = authenticatedDatabase(identity.accessToken);
    const { data, error } = await database
      .from("consultant_availability")
      .select("date_iso,weekday,slots")
      .eq("consultant_id", consultant.consultantRecordId)
      .order("weekday", { ascending: true });
    if (error) {
      if (isMissingConsultationsSchema(error)) {
        return Response.json({ availability: [], source: "fallback" });
      }
      throw error;
    }
    return Response.json({ availability: (data ?? []).map(mapAvailability), source: "database" });
  } catch (error) {
    return consultationErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();

  let input: z.infer<typeof saveSchema>;
  try {
    input = saveSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid availability schedule", code: "INVALID_REQUEST" }, { status: 400 });
  }
  if (new Set(input.weekly.map((entry) => entry.weekday)).size !== input.weekly.length) {
    return Response.json({ error: "Each weekday can appear only once", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    const consultant = await consultantFor(identity);
    const database = authenticatedDatabase(identity.accessToken);
    const { error: deleteError } = await database
      .from("consultant_availability")
      .delete()
      .eq("consultant_id", consultant.consultantRecordId)
      .is("date_iso", null);
    if (deleteError) {
      if (isMissingConsultationsSchema(deleteError)) {
        throw new ConsultationServerError(
          "The consultation database has not been activated yet.",
          "CONSULTATIONS_NOT_CONFIGURED",
          503,
        );
      }
      throw new ConsultationServerError("Availability could not be saved.", "AVAILABILITY_SAVE_FAILED", 503);
    }

    const activeDays = input.weekly.filter((entry) => entry.slots.length > 0);
    if (activeDays.length) {
      const { error: insertError } = await database.from("consultant_availability").insert(
        activeDays.map((entry) => ({
          consultant_id: consultant.consultantRecordId,
          weekday: entry.weekday,
          slots: [...new Set(entry.slots)].sort(),
          updated_at: new Date().toISOString(),
        })),
      );
      if (insertError) {
        throw new ConsultationServerError("Availability could not be saved.", "AVAILABILITY_SAVE_FAILED", 503);
      }
    }

    return Response.json({
      availability: activeDays.map((entry) => ({ weekday: entry.weekday, slots: [...new Set(entry.slots)].sort() })),
    });
  } catch (error) {
    return consultationErrorResponse(error);
  }
}
