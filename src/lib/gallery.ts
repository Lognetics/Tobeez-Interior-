/**
 * Central image manifest, all real TOBEEZ INTERIORS project photography.
 * Photos live in `public/gallery/`. To add or replace, drop files there and
 * update the arrays below. The brand logo lives in `public/brand/`.
 */

export type GalleryItem = {
  src: string;
  title: string;
  category: string;
  span?: "tall" | "wide" | "normal";
};

/** Founder / CEO portrait. */
export const FOUNDER_IMAGE = "/gallery/founder.jpg";

/** Landing-page hero slider: full-bleed image + headline per slide. */
export type HeroSlide = {
  src: string;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/gallery/hero-image.jpg",
    eyebrow: "Luxury Residential",
    title: "Furnish any space with",
    highlight: "intelligent precision",
    subtitle:
      "Estimate the true cost of furnishing your home, get a designer-grade plan, and bring it to life, all in one platform.",
  },
  {
    src: "/gallery/img-8149.jpg",
    eyebrow: "Kitchens",
    title: "Kitchens crafted",
    highlight: "to perfection",
    subtitle:
      "From marble islands to smart appliances, plan a kitchen that blends beauty, function and budget.",
  },
  {
    src: "/gallery/img-8156.jpg",
    eyebrow: "Dining",
    title: "Dining in",
    highlight: "timeless style",
    subtitle:
      "Curated dining spaces designed around how you gather, entertain and live.",
  },
  {
    src: "/gallery/img-8148.jpg",
    eyebrow: "Commercial",
    title: "Workspaces that",
    highlight: "elevate every day",
    subtitle:
      "Offices, lounges and hospitality interiors engineered for people and performance.",
  },
  {
    src: "/gallery/img-8146.jpg",
    eyebrow: "Bedrooms",
    title: "Retreats made for",
    highlight: "deep rest",
    subtitle:
      "Serene, layered bedrooms with bespoke lighting, texture and warmth.",
  },
];

/** Portfolio / project showcase, masonry grid with a lightbox. */
export const PORTFOLIO: GalleryItem[] = [
  { src: "/gallery/img-8146.jpg", title: "Luxury Master Bedroom", category: "Bedroom", span: "tall" },
  { src: "/gallery/img-8149.jpg", title: "Marble Island Kitchen", category: "Kitchen" },
  { src: "/gallery/img-8126.jpg", title: "Contemporary Living Room", category: "Living" },
  { src: "/gallery/img-8156.jpg", title: "Emerald Dining", category: "Dining", span: "wide" },
  { src: "/gallery/img-8134.jpg", title: "Dressing & Vanity Suite", category: "Bedroom" },
  { src: "/gallery/img-8140.jpg", title: "Sculptural Bathroom", category: "Bathroom", span: "tall" },
  { src: "/gallery/img-8116.jpg", title: "Warm Minimalist Lounge", category: "Living" },
  { src: "/gallery/img-8148.jpg", title: "Executive Boardroom", category: "Commercial" },
  { src: "/gallery/img-8143.jpg", title: "Media & Feature Wall", category: "Living", span: "wide" },
  { src: "/gallery/img-8135.jpg", title: "Salon & Studio Fit-out", category: "Commercial" },
  { src: "/gallery/img-8130.jpg", title: "Wood-Panelled Foyer", category: "Detail" },
  { src: "/gallery/img-8125.jpg", title: "Breakfast Bar", category: "Kitchen" },
];

/** Collage shown on the About page. */
export const ABOUT_COLLAGE = [
  "/gallery/img-8115.jpg",
  "/gallery/img-8146.jpg",
  "/gallery/img-8156.jpg",
  "/gallery/img-8140.jpg",
];

/** Product id -> image (marketplace). */
export const PRODUCT_IMAGES: Record<string, string> = {
  p1: "/gallery/img-8115.jpg",
  p2: "/gallery/img-8143.jpg",
  p3: "/gallery/img-8162.jpg",
  p4: "/gallery/img-8125.jpg",
  p5: "/gallery/img-8122.jpg",
  p6: "/gallery/img-8141.jpg",
  p7: "/gallery/img-8126.jpg",
  p8: "/gallery/img-8131.jpg",
  p9: "/gallery/img-8129.jpg",
  p10: "/gallery/img-8148.jpg",
  p11: "/gallery/img-8151.jpg",
  p12: "/gallery/img-8110.jpg",
};
