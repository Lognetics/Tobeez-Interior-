import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { getVideoContent, verifyVideoJob } from "@/lib/ai/visual";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();
  const { handle } = await context.params;
  const job = verifyVideoJob(handle, identity.id);
  if (!job) return Response.json({ error: "Invalid video job", code: "INVALID_JOB" }, { status: 403 });

  try {
    const upstream = await getVideoContent(job.id);
    return new Response(upstream.body, {
      headers: {
        "content-type": upstream.headers.get("content-type") || "video/mp4",
        "cache-control": "private, max-age=300",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to download video", code: "VIDEO_CONTENT_FAILED" },
      { status: 503 },
    );
  }
}
