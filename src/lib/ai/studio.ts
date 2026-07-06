/**
 * AI Design Studio engine (stubbed).
 *
 * The real system will call interchangeable providers for text, image and
 * video generation. This module defines that provider abstraction and a
 * deterministic offline stand-in so the UI is fully functional without keys.
 * Admin "AI Engine" settings would choose the active provider per capability.
 */

export type AICapability = "text" | "image" | "video" | "vision" | "edit";

export type AIProvider = {
  id: string;
  name: string;
  capabilities: AICapability[];
  enabled: boolean;
  note: string;
};

/** Provider registry (mirrors what Admin → AI Engine would configure). */
export const AI_PROVIDERS: AIProvider[] = [
  { id: "openai", name: "OpenAI (GPT + DALL·E)", capabilities: ["text", "image", "vision"], enabled: true, note: "Primary text & vision" },
  { id: "stability", name: "Stability AI", capabilities: ["image", "edit"], enabled: true, note: "Interior renders & edits" },
  { id: "replicate", name: "Replicate (open models)", capabilities: ["image", "video", "edit"], enabled: true, note: "SDXL / video, cost-efficient" },
  { id: "runway", name: "Runway", capabilities: ["video"], enabled: false, note: "Walkthrough video (optional)" },
];

// Image pools grouped by room type, drawn from the real project gallery.
const POOLS: Record<string, string[]> = {
  living: ["/gallery/img-8110.jpg", "/gallery/img-8115.jpg", "/gallery/img-8116.jpg", "/gallery/img-8126.jpg", "/gallery/img-8143.jpg", "/gallery/hero-image.jpg"],
  kitchen: ["/gallery/img-8125.jpg", "/gallery/img-8149.jpg", "/gallery/img-8153.jpg", "/gallery/img-8121.jpg"],
  bedroom: ["/gallery/img-8146.jpg", "/gallery/img-8134.jpg"],
  bathroom: ["/gallery/img-8140.jpg", "/gallery/img-8141.jpg", "/gallery/img-8152.jpg"],
  dining: ["/gallery/img-8156.jpg", "/gallery/img-8162.jpg"],
  office: ["/gallery/img-8148.jpg", "/gallery/img-8151.jpg", "/gallery/img-8157.jpg"],
  luxury: ["/gallery/hero-image.jpg", "/gallery/img-8146.jpg", "/gallery/img-8135.jpg"],
};
const DEFAULT_POOL = ["/gallery/img-8115.jpg", "/gallery/img-8126.jpg", "/gallery/img-8146.jpg", "/gallery/img-8149.jpg"];

function poolFor(prompt: string): string[] {
  const p = prompt.toLowerCase();
  for (const key of Object.keys(POOLS)) if (p.includes(key)) return POOLS[key];
  if (/lounge|sitting|tv|media/.test(p)) return POOLS.living;
  if (/bath|shower|toilet|vanity/.test(p)) return POOLS.bathroom;
  return DEFAULT_POOL;
}

export type DesignResult = {
  explanation: string;
  palette: { name: string; hex: string }[];
  furniture: string[];
  materials: string[];
  budgetEstimate: number;
  images: string[];
};

const PALETTES: Record<string, { name: string; hex: string }[]> = {
  warm: [
    { name: "Terracotta", hex: "#c4703f" }, { name: "Warm Sand", hex: "#e4d3ba" },
    { name: "Walnut", hex: "#5a4632" }, { name: "Ivory", hex: "#f5efe6" },
  ],
  cool: [
    { name: "Slate", hex: "#5b6670" }, { name: "Sage", hex: "#a7b3a0" },
    { name: "Fog", hex: "#dfe3e6" }, { name: "Charcoal", hex: "#2f3336" },
  ],
};

/** Simulate an interior design generation from a natural-language prompt. */
export async function generateDesign(prompt: string): Promise<DesignResult> {
  await new Promise((r) => setTimeout(r, 1200));
  const warm = /warm|walnut|terracotta|cozy|luxury|wood/i.test(prompt);
  const palette = warm ? PALETTES.warm : PALETTES.cool;
  const images = poolFor(prompt).slice(0, 4);
  return {
    explanation:
      `Here's a concept for “${prompt.trim()}”. I've balanced statement pieces with calm negative space, ` +
      `layered lighting for warmth, and durable, tactile materials that photograph beautifully and age well.`,
    palette,
    furniture: [
      "Modular low-profile sofa", "Sculptural lounge chair", "Stone-top coffee table",
      "Floor-to-ceiling drapery", "Layered area rug", "Statement pendant lighting",
    ],
    materials: warm ? ["Walnut veneer", "Boucle fabric", "Brushed brass", "Natural stone"] : ["Oak veneer", "Wool weave", "Matte black steel", "Micro-cement"],
    budgetEstimate: warm ? 14500000 : 9800000,
    images,
  };
}

/** Simulate image generation / room redesign. */
export async function generateImages(prompt: string, count = 4): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 1400));
  const pool = poolFor(prompt);
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}
