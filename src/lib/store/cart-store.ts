"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, type Product } from "@/lib/data/products";

export type CartLine = { productId: string; qty: number };

type CartState = {
  items: CartLine[];
  wishlist: string[];
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      addToCart: (productId, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === productId);
          return existing
            ? { items: s.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i)) }
            : { items: [...s.items, { productId, qty }] };
        }),
      removeFromCart: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.productId !== productId) : s.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        })),
      clearCart: () => set({ items: [] }),
      toggleWishlist: (productId) =>
        set((s) => ({
          wishlist: s.wishlist.includes(productId) ? s.wishlist.filter((id) => id !== productId) : [...s.wishlist, productId],
        })),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
    }),
    { name: "tobeez-cart" },
  ),
);

/** Resolve cart lines to full products with line totals. */
export function cartDetails(items: CartLine[]) {
  const lines = items
    .map((i) => {
      const product = PRODUCTS.find((p) => p.id === i.productId);
      return product ? { product, qty: i.qty, lineTotal: product.price * i.qty } : null;
    })
    .filter(Boolean) as { product: Product; qty: number; lineTotal: number }[];
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return { lines, subtotal };
}

export const SHIPPING_FLAT = 25000;
export const TAX_RATE = 0.075;
