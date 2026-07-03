/**
 * Central image manifest.
 *
 * ⭐️ TO USE YOUR OWN PHOTOS (e.g. from @tobeezinteriors on Instagram):
 *    1. Download the photos you want from Instagram.
 *    2. Drop them into `public/gallery/` (keep the same file names to
 *       auto-replace, or add new names and update the arrays below).
 *    3. Put your logo at `public/brand/logo.png` (or .svg) — the Logo
 *       component picks it up automatically.
 * Nothing else needs to change. All imagery on the site flows from here.
 */

export type GalleryItem = {
  src: string;
  title: string;
  category: string;
  span?: "tall" | "wide" | "normal";
};

/** Big hero image on the landing page. */
export const HERO_IMAGE = "/gallery/hero-1.jpg";

/** Secondary hero accents (small framed shots that float in the hero). */
export const HERO_ACCENTS = ["/gallery/living-2.jpg", "/gallery/kitchen-2.jpg"];

/** Portfolio / project showcase — masonry grid with a lightbox. */
export const PORTFOLIO: GalleryItem[] = [
  { src: "/gallery/living-5.jpg", title: "Warm Modern Living Room", category: "Residential", span: "tall" },
  { src: "/gallery/kitchen-1.jpg", title: "Bright Family Kitchen", category: "Kitchen" },
  { src: "/gallery/bedroom-1.jpg", title: "Serene Master Suite", category: "Bedroom" },
  { src: "/gallery/luxury-1.jpg", title: "Luxury Lounge", category: "Luxury", span: "wide" },
  { src: "/gallery/dining-1.jpg", title: "Elegant Dining", category: "Dining" },
  { src: "/gallery/living-3.jpg", title: "Minimalist Retreat", category: "Minimalist", span: "tall" },
  { src: "/gallery/bath-1.jpg", title: "Spa Bathroom", category: "Bathroom" },
  { src: "/gallery/office-1.jpg", title: "Executive Workspace", category: "Commercial" },
  { src: "/gallery/living-1.jpg", title: "Contemporary Comfort", category: "Residential", span: "wide" },
  { src: "/gallery/bedroom-2.jpg", title: "Boutique Bedroom", category: "Bedroom" },
];

/** Collage shown in the About page. */
export const ABOUT_COLLAGE = [
  "/gallery/living-4.jpg",
  "/gallery/interior-1.jpg",
  "/gallery/house-1.jpg",
  "/gallery/lounge-1.jpg",
];

/** Product id → image. Falls back to a gradient if missing. */
export const PRODUCT_IMAGES: Record<string, string> = {
  p1: "/gallery/sofa-1.jpg",
  p2: "/gallery/lounge-1.jpg",
  p3: "/gallery/dining-1.jpg",
  p4: "/gallery/kitchen-2.jpg",
  p5: "/gallery/living-6.jpg",
  p6: "/gallery/bath-1.jpg",
  p7: "/gallery/living-7.jpg",
  p8: "/gallery/interior-1.jpg",
  p9: "/gallery/living-4.jpg",
  p10: "/gallery/office-1.jpg",
  p11: "/gallery/house-1.jpg",
  p12: "/gallery/living-1.jpg",
};
