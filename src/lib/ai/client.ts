"use client";

import { supabase } from "@/lib/supabase/client";

/** Client-side helpers for the real AI. */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // data URLs (uploads) or generated image URLs
  sources?: ChatSource[];
};

export type ChatSource = {
  id: string;
  title: string;
  href: string;
  category: "platform" | "estimator" | "marketplace" | "consultation" | "account";
};

/** Marketplace product matched to a generated design, rendered as a card. */
export type RecommendedProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
};

export class AIClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AIClientError";
  }
}

async function accessToken() {
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new AIClientError("Sign in to use TOBEEZ AI.", "AUTH_REQUIRED", 401);
  return token;
}

async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await accessToken();
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

async function responseError(response: Response) {
  let payload: { error?: string; code?: string } = {};
  try {
    payload = await response.json();
  } catch {
    // The provider may return a non-JSON gateway error.
  }
  return new AIClientError(
    payload.error || "The AI request failed.",
    payload.code || (response.status === 401 ? "AUTH_REQUIRED" : "AI_REQUEST_FAILED"),
    response.status,
  );
}

/** Call the real chat completion API (text + optional vision on uploads). */
export async function sendChat(
  messages: ChatMessage[],
  options?: { mode?: "chat" | "image" | "video" },
): Promise<{
  text: string;
  keyless: boolean;
  providerLabel: string;
  sources: ChatSource[];
  grounded: boolean;
  fallback: boolean;
  products: RecommendedProduct[];
}> {
  const res = await authenticatedFetch("/api/ai/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: messages.map(({ role, content, images }) => ({ role, content, images })),
      mode: options?.mode ?? "chat",
    }),
  });
  if (!res.ok) throw await responseError(res);
  const data = await res.json();
  return {
    text: data.text ?? "",
    keyless: data.provider?.keyless ?? true,
    providerLabel: data.provider?.label ?? "TOBEEZ AI",
    sources: Array.isArray(data.sources) ? data.sources : [],
    grounded: Boolean(data.grounded),
    fallback: Boolean(data.fallback),
    products: Array.isArray(data.products) ? data.products : [],
  };
}

export type GeneratedImageAsset = {
  url: string;
  prompt: string;
  provider: string;
  model: string;
  grounded: boolean;
  fallback: boolean;
  sources: ChatSource[];
};

export async function generateImageAsset(input: {
  prompt: string;
  aspect?: "square" | "landscape" | "portrait";
  referenceImage?: string;
}): Promise<GeneratedImageAsset> {
  const response = await authenticatedFetch("/api/ai/image", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await responseError(response);
  return response.json();
}

export type GeneratedVideoJob = {
  handle: string;
  prompt: string;
  provider: string;
  model: string;
  grounded: boolean;
  status: "queued" | "processing" | "completed" | "failed";
  sources: ChatSource[];
};

export async function generateVideoJob(input: {
  prompt: string;
  aspect?: "landscape" | "portrait";
  referenceImage?: string;
}): Promise<GeneratedVideoJob> {
  const response = await authenticatedFetch("/api/ai/video", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await responseError(response);
  return response.json();
}

export async function getVideoJob(handle: string): Promise<{
  status: GeneratedVideoJob["status"];
  error?: string | null;
}> {
  const response = await authenticatedFetch(`/api/ai/video/${encodeURIComponent(handle)}`, {
    cache: "no-store",
  });
  if (!response.ok) throw await responseError(response);
  return response.json();
}

export async function getVideoObjectUrl(handle: string) {
  const response = await authenticatedFetch(`/api/ai/video/${encodeURIComponent(handle)}/content`, {
    cache: "no-store",
  });
  if (!response.ok) throw await responseError(response);
  return URL.createObjectURL(await response.blob());
}

/**
 * Build a REAL image-generation URL (keyless, via an open model). The image is
 * generated when the URL loads. Different seeds produce different variations.
 * Add a provider key later to route through a premium image model instead.
 */
export function buildImageUrl(prompt: string, opts?: { width?: number; height?: number; seed?: number }): string {
  const width = opts?.width ?? 768;
  const height = opts?.height ?? 768;
  const seed = opts?.seed ?? Math.floor(Math.random() * 1_000_000);
  const enriched = `${prompt}, interior design, photorealistic, high detail, professional architectural photography`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(enriched)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
}

/** Heuristic: does this message want an image generated? */
export function wantsImage(text: string): boolean {
  return /\b(generate|create|render|design|redesign|visuali[sz]e|show me|picture|image|photo|mockup|concept|moodboard)\b/i.test(text);
}

/**
 * Manual fallback: a library of stored interior photos, grouped by room type.
 * Used when the free image tier is busy/rate-limited so generation ALWAYS
 * returns a relevant, real image instead of failing.
 */
const FALLBACK_POOLS: Record<string, string[]> = {
  living: ["/gallery/img-8110.jpg", "/gallery/img-8115.jpg", "/gallery/img-8116.jpg", "/gallery/img-8126.jpg", "/gallery/img-8143.jpg", "/gallery/hero-image.jpg", "/gallery/img-8159.jpg"],
  kitchen: ["/gallery/img-8125.jpg", "/gallery/img-8149.jpg", "/gallery/img-8153.jpg", "/gallery/img-8121.jpg"],
  bedroom: ["/gallery/img-8146.jpg", "/gallery/img-8134.jpg", "/gallery/img-8135.jpg"],
  bathroom: ["/gallery/img-8140.jpg", "/gallery/img-8141.jpg", "/gallery/img-8152.jpg"],
  dining: ["/gallery/img-8156.jpg", "/gallery/img-8162.jpg"],
  office: ["/gallery/img-8148.jpg", "/gallery/img-8151.jpg", "/gallery/img-8157.jpg"],
  luxury: ["/gallery/hero-image.jpg", "/gallery/img-8146.jpg", "/gallery/img-8135.jpg"],
};
const DEFAULT_POOL = ["/gallery/img-8115.jpg", "/gallery/img-8126.jpg", "/gallery/img-8146.jpg", "/gallery/img-8149.jpg", "/gallery/hero-image.jpg", "/gallery/img-8156.jpg"];

export function fallbackImage(prompt: string, seed = 0): string {
  const p = prompt.toLowerCase();
  let pool = DEFAULT_POOL;
  for (const key of Object.keys(FALLBACK_POOLS)) {
    if (p.includes(key)) { pool = FALLBACK_POOLS[key]; break; }
  }
  if (/lounge|sitting|tv|media|sofa/.test(p)) pool = FALLBACK_POOLS.living;
  else if (/bath|shower|toilet|vanity/.test(p)) pool = FALLBACK_POOLS.bathroom;
  else if (/luxur|premium|walnut/.test(p)) pool = FALLBACK_POOLS.luxury;
  return pool[Math.abs(seed) % pool.length];
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Read a File into a data URL for upload/preview and vision. Images are
 * downscaled to a 1600px long edge and recompressed: a full-resolution phone
 * photo is 4–10MB as base64, which blows the ~5MB localStorage quota the chat
 * history lives in and slows generation uploads for no visual gain.
 */
export async function fileToDataUrl(file: File): Promise<string> {
  const raw = await readAsDataUrl(file);
  if (!file.type.startsWith("image/") || file.type === "image/gif") return raw;

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = raw;
    });
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    if (scale === 1 && raw.length <= 500_000) return raw;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return raw;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    // Formats the browser can't decode (e.g. HEIC) pass through untouched.
    return raw;
  }
}
