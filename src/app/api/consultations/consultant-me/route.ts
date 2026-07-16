import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { consultantFor, consultationErrorResponse } from "@/lib/consultations/server";

export async function GET(request: Request) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();
  try {
    return Response.json({ consultant: await consultantFor(identity) });
  } catch (error) {
    return consultationErrorResponse(error);
  }
}
