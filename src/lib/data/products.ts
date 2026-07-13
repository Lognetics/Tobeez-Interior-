/** Mock product catalogue for the marketplace. Replace with DB/API later. */
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  tag?: "New" | "Bestseller" | "Luxury";
  gradient: string;
};

export const PRODUCT_CATEGORIES = [
  "All", "Furniture", "Lighting", "Kitchen", "Bathroom", "Décor", "Curtains", "Outdoor", "Office",
] as const;

/**
 * Intentionally empty until the client supplies real products with their own
 * photos — the demo items were removed on request (July 2026). To stock it,
 * add entries like:
 *   { id: "p1", name: "Milano Modular Sofa", brand: "Casa Nova", category: "Furniture",
 *     price: 1850000, rating: 4.8, reviews: 214, tag: "Bestseller", gradient: "from-amber-200 to-orange-300" },
 * map each id to a photo in PRODUCT_IMAGES (src/lib/gallery.ts), and flip
 * MARKETPLACE_STOCKED in src/lib/data/catalog.ts.
 */
export const PRODUCTS: Product[] = [];
