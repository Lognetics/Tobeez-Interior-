"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, cartDetails } from "@/lib/store/cart-store";
import { PRODUCT_IMAGES } from "@/lib/gallery";
import { cn, formatCurrency } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeFromCart = useCart((s) => s.removeFromCart);
  React.useEffect(() => setMounted(true), []);

  const { lines, subtotal } = cartDetails(items);
  const count = mounted ? items.reduce((n, i) => n + i.qty, 0) : 0;

  return (
    <>
      <Button variant="ghost" size="icon" className={cn("relative", className)} onClick={() => setOpen(true)} aria-label="Cart">
        <ShoppingCart />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-[60] bg-black/40" />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-card shadow-glow"
            >
              <header className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><ShoppingBag className="size-5" /> Your cart</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close"><X /></Button>
              </header>

              {lines.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
                  <ShoppingCart className="size-10" />
                  <p>Your cart is empty.</p>
                  <Button onClick={() => setOpen(false)}>Continue shopping</Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {lines.map(({ product, qty, lineTotal }) => (
                      <div key={product.id} className="flex gap-3 rounded-2xl border border-border p-3">
                        <span className={cn("relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br", product.gradient)}>
                          {PRODUCT_IMAGES[product.id] && <Image src={PRODUCT_IMAGES[product.id]} alt={product.name} fill sizes="64px" className="object-cover" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-border">
                              <button onClick={() => setQty(product.id, qty - 1)} className="grid size-7 place-items-center hover:bg-muted" aria-label="Decrease"><Minus className="size-3.5" /></button>
                              <span className="w-7 text-center text-sm tabular-nums">{qty}</span>
                              <button onClick={() => setQty(product.id, qty + 1)} className="grid size-7 place-items-center hover:bg-muted" aria-label="Increase"><Plus className="size-3.5" /></button>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{formatCurrency(lineTotal)}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(product.id)} className="self-start text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="size-4" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 border-t border-border p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-display text-lg font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    <Button asChild className="w-full" size="lg" onClick={() => setOpen(false)}>
                      <Link href="/checkout">Checkout</Link>
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">Shipping & tax calculated at checkout.</p>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
