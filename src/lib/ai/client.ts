"use client";

/** Client-side helpers for the real AI. */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // data URLs (uploads) or generated image URLs
};

/** Call the real chat completion API (text + optional vision on uploads). */
export async function sendChat(
  messages: ChatMessage[],
): Promise<{ text: string; keyless: boolean; providerLabel: string }> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json();
  return {
    text: data.text ?? "",
    keyless: data.provider?.keyless ?? true,
    providerLabel: data.provider?.label ?? "TOBEEZ AI",
  };
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

/** Read a File into a data URL for upload/preview and vision. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
