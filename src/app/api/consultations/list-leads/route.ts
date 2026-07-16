import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import {
  authenticatedDatabase,
  consultantFor,
  consultationErrorResponse,
  isMissingConsultationsSchema,
  mapBooking,
} from "@/lib/consultations/server";

export async function GET(request: Request) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();

  try {
    const consultant = await consultantFor(identity);
    const database = authenticatedDatabase(identity.accessToken);
    const { data, error } = await database
      .from("bookings")
      .select("*")
      .eq("consultant_id", consultant.consultantId)
      .order("date_iso", { ascending: true })
      .order("time", { ascending: true });
    if (error) {
      if (isMissingConsultationsSchema(error)) {
        return Response.json({ bookings: [], consultant, source: "fallback" });
      }
      throw error;
    }
    return Response.json({ bookings: (data ?? []).map(mapBooking), consultant, source: "database" });
  } catch (error) {
    return consultationErrorResponse(error);
  }
}
