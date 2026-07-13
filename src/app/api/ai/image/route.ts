import { z } from "zod";
import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { getAuthenticatedUserContext } from "@/lib/ai/user-context";
import { retrievePlatformKnowledge } from "@/lib/ai/knowledge";
import { buildVisualBrief, generateImage } from "@/lib/ai/visual";
import { getConsultants, getProducts } from "@/lib/data/catalog";

export const runtime = "nodejs";
// GPT Image 2 at quality=high takes 60–115s in practice; leave real headroom.
export const maxDuration = 300;

const requestSchema = z.object({
  prompt: z.string().trim().min(3).max(3_000),
  aspect: z.enum(["square", "landscape", "portrait"]).default("landscape"),
  referenceImage: z.string().max(14_000_000).optional(),
});

export async function POST(request: Request) {
  const identity = await authenticateApiRequest(request);
  if (!identity) return authenticationRequired();

  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid image-generation request", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    const [{ products }, designers, userContext] = await Promise.all([
      getProducts(),
      getConsultants(),
      getAuthenticatedUserContext(identity.id, identity.accessToken),
    ]);
    const retrieval = retrievePlatformKnowledge(input.prompt, { products, designers });
    // Never place private workspace records in the public keyless fallback.
    const modelUserContext = process.env.OPENAI_API_KEY ? userContext : "";
    const brief = buildVisualBrief({
      prompt: input.prompt,
      kind: "image",
      retrieval: retrieval.results,
      userContext: modelUserContext,
      hasReference: Boolean(input.referenceImage),
    });
    const image = await generateImage({ brief, aspect: input.aspect, referenceImage: input.referenceImage });
    return Response.json({
      ...image,
      prompt: input.prompt,
      grounded: retrieval.results.length > 0 || Boolean(modelUserContext),
      sources: retrieval.results.map((result) => result.source),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Image generation failed", code: "IMAGE_GENERATION_FAILED" },
      { status: 503 },
    );
  }
}
