import { z } from "zod";
import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { getAuthenticatedUserContext } from "@/lib/ai/user-context";
import { retrievePlatformKnowledge } from "@/lib/ai/knowledge";
import { buildVisualBrief, createVideoPrediction, signVideoJob } from "@/lib/ai/visual";
import { getConsultants, getProducts } from "@/lib/data/catalog";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  prompt: z.string().trim().min(3).max(3_000),
  aspect: z.enum(["landscape", "portrait"]).default("landscape"),
  referenceImage: z.string().max(14_000_000).optional(),
});

export async function POST(request: Request) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();

  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid video-generation request", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    const [{ products }, designers, userContext] = await Promise.all([
      getProducts(),
      getConsultants(),
      getAuthenticatedUserContext(identity.id, identity.accessToken),
    ]);
    const retrieval = retrievePlatformKnowledge(input.prompt, { products, designers });
    const brief = buildVisualBrief({
      prompt: input.prompt,
      kind: "video",
      retrieval: retrieval.results,
      userContext,
      hasReference: Boolean(input.referenceImage),
    });
    const prediction = await createVideoPrediction({
      brief,
      aspect: input.aspect,
      referenceImage: input.referenceImage,
    });
    return Response.json({
      handle: signVideoJob({ id: prediction.id, userId: identity.id }),
      status: prediction.status,
      provider: prediction.provider,
      model: prediction.model,
      prompt: input.prompt,
      grounded: retrieval.results.length > 0 || Boolean(userContext),
      sources: retrieval.results.map((result) => result.source),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Video generation failed", code: "VIDEO_GENERATION_FAILED" },
      { status: 503 },
    );
  }
}
