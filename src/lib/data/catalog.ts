import { supabase } from "@/lib/supabase/client";
import { PRODUCTS, type Product } from "./products";
import { DESIGNERS, type Designer } from "./designers";

/**
 * Catalog access layer. Reads from Supabase when the tables exist and return
 * rows; otherwise falls back to the bundled seed data so the site NEVER errors
 * (e.g. before the migration runs, or if the network is unavailable).
 */

type ProductRow = {
  id: string; name: string; brand: string; category: string; price: number;
  rating: number; reviews: number; tag: string | null; gradient: string;
};

function mapProduct(r: ProductRow): Product {
  return { ...r, tag: (r.tag as Product["tag"]) ?? undefined };
}

export async function getProducts(): Promise<{ products: Product[]; source: "supabase" | "fallback" }> {
  try {
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error || !data || data.length === 0) return { products: PRODUCTS, source: "fallback" };
    return { products: (data as ProductRow[]).map(mapProduct), source: "supabase" };
  } catch {
    return { products: PRODUCTS, source: "fallback" };
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error || !data) return PRODUCTS.find((p) => p.id === id) ?? null;
    return mapProduct(data as ProductRow);
  } catch {
    return PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

export async function getConsultants(): Promise<Designer[]> {
  try {
    const { data, error } = await supabase.from("consultants").select("*").order("id");
    if (error || !data || data.length === 0) return DESIGNERS;
    // DB rows mirror the Designer shape (arrays stored as jsonb).
    return data as unknown as Designer[];
  } catch {
    return DESIGNERS;
  }
}
