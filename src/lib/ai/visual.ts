import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { RetrievalResult } from "@/lib/ai/knowledge";

export type VisualAspect = "square" | "landscape" | "portrait";
export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: unknown;
  error?: unknown;
};

function visualContext(results: RetrievalResult[]) {
  return results
    .slice(0, 4)
    .map((result) => `${result.source.title}: ${result.content}`)
    .join("\n");
}

export function buildVisualBrief({
  prompt,
  kind,
  retrieval,
  userContext,
  hasReference = false,
}: {
  prompt: string;
  kind: "image" | "video";
  retrieval: RetrievalResult[];
  userContext: string;
  hasReference?: boolean;
}) {
  const platformContext = visualContext(retrieval);
  const medium = kind === "video"
    ? (hasReference
      ? "Animate the exact space shown in the provided reference image into a coherent cinematic interior-design walkthrough. Reproduce the room's architecture, layout, furniture, materials, colours, and lighting exactly as pictured; do not invent a different room, and only apply changes the brief explicitly requests."
      : "Create a coherent cinematic interior-design walkthrough with stable geometry, realistic motion, and physically plausible lighting.")
    : (hasReference
      ? "Redesign the exact room shown in the provided reference photo. Preserve its architecture, window and door positions, camera angle, and proportions; change only the styling and furnishings the brief requests."
      : "Create an editorial-quality, photorealistic interior visualization with accurate materials, realistic proportions, and physically plausible lighting.");
  const camera = kind === "video"
    ? (hasReference
      ? "Start from the reference image's viewpoint and use one slow professional architectural camera move through this exact space, consistent furniture placement, no warping, no sudden cuts, and no people unless requested."
      : "Use a slow professional architectural camera move, consistent furniture placement, no warping, no sudden cuts, and no people unless requested.")
    : "Use professional architectural photography, a 24mm lens, balanced composition, natural depth, fine material detail, and no people unless requested.";

  return [
    medium,
    camera,
    `User brief: ${prompt}`,
    platformContext ? `Verified TOBEEZ platform context:\n${platformContext}` : "",
    userContext ? `Authenticated user's saved TOBEEZ project context:\n${userContext}` : "",
    "Use platform facts only when supplied above. Named marketplace products are conceptual unless a reference image is supplied; do not invent logos, text, dimensions, or product-specific appearance.",
    "Deliver a premium, tasteful result suitable for a high-end interior design presentation. Avoid visual clutter, distorted furniture, duplicate objects, illegible text, watermarks, and brand marks.",
  ].filter(Boolean).join("\n\n");
}

function dataUrlToBlob(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([\s\S]+)$/);
  if (!match) throw new Error("Reference image must be a PNG, JPEG, or WebP data URL.");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Reference image must be smaller than 10 MB.");
  return new Blob([bytes], { type: match[1] });
}

export async function generateImage({
  brief,
  aspect,
  referenceImage,
}: {
  brief: string;
  aspect: VisualAspect;
  referenceImage?: string;
}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    if (referenceImage) {
      throw new Error("Room-photo redesign requires an OPENAI_API_KEY with GPT Image access.");
    }
    const size = aspect === "portrait" ? { width: 1024, height: 1536 } :
      aspect === "landscape" ? { width: 1536, height: 1024 } : { width: 1024, height: 1024 };
    const seed = Math.floor(Math.random() * 1_000_000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(brief)}?width=${size.width}&height=${size.height}&nologo=true&private=true&seed=${seed}`;
    return { url, provider: "TOBEEZ open image model", model: "pollinations", fallback: true };
  }

  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const quality = process.env.OPENAI_IMAGE_QUALITY || "high";
  const size = aspect === "portrait" ? "1024x1536" : aspect === "landscape" ? "1536x1024" : "1024x1024";
  let response: Response;

  if (referenceImage) {
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", brief);
    form.append("size", size);
    form.append("quality", quality);
    form.append("output_format", "jpeg");
    form.append("image[]", dataUrlToBlob(referenceImage), "room-reference.jpg");
    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, prompt: brief, n: 1, size, quality, output_format: "jpeg" }),
    });
  }

  const payload = await response.json() as { data?: Array<{ b64_json?: string }>; error?: { message?: string } };
  if (!response.ok || !payload.data?.[0]?.b64_json) {
    throw new Error(payload.error?.message || `Image provider returned ${response.status}.`);
  }

  return {
    url: `data:image/jpeg;base64,${payload.data[0].b64_json}`,
    provider: "OpenAI GPT Image 2",
    model,
    fallback: false,
  };
}

function replicateToken() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("Video generation is not configured. Add REPLICATE_API_TOKEN to the server environment.");
  return token;
}

function replicateModel() {
  const value = process.env.REPLICATE_VIDEO_MODEL || "google/veo-3.1";
  if (!/^[a-z0-9_-]+\/[a-z0-9_.-]+$/i.test(value)) throw new Error("Invalid REPLICATE_VIDEO_MODEL.");
  return value;
}

/**
 * Replicate only accepts small inline data URIs (~256 KB); real photos and
 * generated renders must be uploaded through its Files API first.
 */
async function resolveVideoReference(referenceImage: string) {
  if (!referenceImage.startsWith("data:")) return referenceImage;
  const match = referenceImage.match(/^data:(image\/(?:png|jpeg|webp));base64,([\s\S]+)$/);
  if (!match) throw new Error("Reference image must be a PNG, JPEG, or WebP data URL.");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Reference image must be smaller than 10 MB.");
  if (bytes.byteLength <= 200 * 1024) return referenceImage;

  const form = new FormData();
  form.append("content", new Blob([bytes], { type: match[1] }), "reference-image");
  const response = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${replicateToken()}` },
    body: form,
  });
  const payload = await response.json() as { urls?: { get?: string }; detail?: string };
  if (!response.ok || !payload.urls?.get) {
    throw new Error(payload.detail || "Could not upload the reference image for video generation.");
  }
  return payload.urls.get;
}

function outputUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.find((item): item is string => typeof item === "string") ?? null;
  if (output && typeof output === "object") {
    for (const key of ["url", "video", "output"]) {
      const value = (output as Record<string, unknown>)[key];
      if (typeof value === "string") return value;
    }
  }
  return null;
}

function mapPrediction(prediction: ReplicatePrediction) {
  const status: VideoJobStatus = prediction.status === "succeeded" ? "completed" :
    prediction.status === "failed" || prediction.status === "canceled" ? "failed" :
      prediction.status === "processing" ? "processing" : "queued";
  return {
    id: prediction.id,
    status,
    outputUrl: outputUrl(prediction.output),
    error: typeof prediction.error === "string" ? prediction.error : null,
  };
}

export async function createVideoPrediction({
  brief,
  aspect,
  referenceImage,
}: {
  brief: string;
  aspect: Exclude<VisualAspect, "square">;
  referenceImage?: string;
}) {
  const token = replicateToken();
  const model = replicateModel();
  const [owner, name] = model.split("/");
  const input: Record<string, unknown> = {
    prompt: brief,
    aspect_ratio: aspect === "portrait" ? "9:16" : "16:9",
    // Veo 3.1 only accepts 4, 6, or 8 seconds — 8 is the hard maximum.
    // Longer videos require chaining clips and stitching them server-side.
    duration: 8,
    resolution: "1080p",
    generate_audio: true,
  };
  if (referenceImage) input.image = await resolveVideoReference(referenceImage);

  const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      "Cancel-After": "10m",
    },
    body: JSON.stringify({ input }),
  });
  const payload = await response.json() as ReplicatePrediction & { detail?: string };
  if (!response.ok || !payload.id) throw new Error(payload.detail || `Video provider returned ${response.status}.`);
  return { ...mapPrediction(payload), provider: "Google Veo 3.1 via Replicate", model };
}

export async function getVideoPrediction(id: string) {
  const response = await fetch(`https://api.replicate.com/v1/predictions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${replicateToken()}` },
    cache: "no-store",
  });
  const payload = await response.json() as ReplicatePrediction & { detail?: string };
  if (!response.ok) throw new Error(payload.detail || `Video status provider returned ${response.status}.`);
  return mapPrediction(payload);
}

export async function getVideoContent(id: string) {
  const prediction = await getVideoPrediction(id);
  if (prediction.status !== "completed" || !prediction.outputUrl) throw new Error("Video is not ready.");
  const response = await fetch(prediction.outputUrl, {
    cache: "no-store",
  });
  if (!response.ok || !response.body) throw new Error("Unable to download the generated video.");
  return response;
}

type JobPayload = { id: string; userId: string };

function signingSecret() {
  const secret = process.env.GENERATION_SIGNING_SECRET || process.env.REPLICATE_API_TOKEN;
  if (!secret) throw new Error("Generation job signing is not configured.");
  return secret;
}

export function signVideoJob(payload: JobPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", signingSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyVideoJob(handle: string, userId: string): JobPayload | null {
  try {
    const [encoded, supplied] = handle.split(".");
    if (!encoded || !supplied) return null;
    const expected = createHmac("sha256", signingSecret()).update(encoded).digest();
    const suppliedBuffer = Buffer.from(supplied, "base64url");
    if (expected.length !== suppliedBuffer.length || !timingSafeEqual(expected, suppliedBuffer)) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as JobPayload;
    return payload.userId === userId && typeof payload.id === "string" ? payload : null;
  } catch {
    return null;
  }
}
