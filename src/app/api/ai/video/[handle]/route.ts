import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { getVideoPrediction, verifyVideoJob } from "@/lib/ai/visual";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();
  const { handle } = await context.params;
  const job = verifyVideoJob(handle, identity.id);
  if (!job) return Response.json({ error: "Invalid video job", code: "INVALID_JOB" }, { status: 403 });

  try {
    const prediction = await getVideoPrediction(job.id);
    return Response.json({ status: prediction.status, error: prediction.error });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to read video status", code: "VIDEO_STATUS_FAILED" },
      { status: 503 },
    );
  }
}
