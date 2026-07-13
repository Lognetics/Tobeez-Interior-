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

const gradients = [
  "from-amber-200 to-orange-300",
  "from-stone-200 to-stone-400",
  "from-rose-200 to-amber-200",
  "from-emerald-200 to-teal-300",
  "from-indigo-200 to-purple-300",
  "from-neutral-200 to-neutral-400",
];

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Milano Modular Sofa", brand: "Casa Nova", category: "Furniture", price: 1850000, rating: 4.8, reviews: 214, tag: "Bestseller", gradient: gradients[0] },
  { id: "p2", name: "Arc Floor Lamp", brand: "Lumen", category: "Lighting", price: 285000, rating: 4.6, reviews: 98, tag: "New", gradient: gradients[4] },
  { id: "p3", name: "Oakline Dining Table", brand: "Timberworks", category: "Furniture", price: 940000, rating: 4.7, reviews: 156, gradient: gradients[1] },
  { id: "p4", name: "Marble Kitchen Island", brand: "Stonecraft", category: "Kitchen", price: 2400000, rating: 4.9, reviews: 72, tag: "Luxury", gradient: gradients[5] },
  { id: "p5", name: "Velvet Accent Chair", brand: "Casa Nova", category: "Furniture", price: 420000, rating: 4.5, reviews: 189, gradient: gradients[2] },
  { id: "p6", name: "Rainfall Shower Set", brand: "AquaLux", category: "Bathroom", price: 360000, rating: 4.7, reviews: 64, gradient: gradients[3] },
  { id: "p7", name: "Linen Blackout Curtains", brand: "DrapeCo", category: "Curtains", price: 145000, rating: 4.4, reviews: 233, tag: "Bestseller", gradient: gradients[1] },
  { id: "p8", name: "Pendant Cluster Light", brand: "Lumen", category: "Lighting", price: 510000, rating: 4.8, reviews: 41, tag: "New", gradient: gradients[4] },
  { id: "p9", name: "Terracotta Vase Set", brand: "Earthen", category: "Décor", price: 78000, rating: 4.6, reviews: 127, gradient: gradients[0] },
  { id: "p10", name: "Ergo Executive Desk", brand: "WorkForm", category: "Office", price: 680000, rating: 4.7, reviews: 88, gradient: gradients[5] },
  { id: "p11", name: "Rattan Lounge Set", brand: "Outdora", category: "Outdoor", price: 1250000, rating: 4.5, reviews: 53, tag: "Luxury", gradient: gradients[3] },
  { id: "p12", name: "Boucle Ottoman", brand: "Casa Nova", category: "Furniture", price: 210000, rating: 4.6, reviews: 174, gradient: gradients[2] },
];
