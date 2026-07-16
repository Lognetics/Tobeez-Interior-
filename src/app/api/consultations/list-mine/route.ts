import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import {
  authenticatedDatabase,
  consultationErrorResponse,
  isMissingConsultationsSchema,
  mapBooking,
} from "@/lib/consultations/server";

export async function GET(request: Request) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();

  const database = authenticatedDatabase(identity.accessToken);
  const { data, error } = await database
    .from("bookings")
    .select("*")
    .eq("client_user_id", identity.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingConsultationsSchema(error)) {
      return Response.json({ bookings: [], source: "fallback" });
    }
    return consultationErrorResponse(error);
  }
  return Response.json({ bookings: (data ?? []).map(mapBooking), source: "database" });
}
