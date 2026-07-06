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

/** Read a File into a data URL for upload/preview and vision. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
