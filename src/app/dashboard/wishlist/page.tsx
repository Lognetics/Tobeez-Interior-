"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart-store";
import { PRODUCTS } from "@/lib/data/products";
import { PRODUCT_IMAGES } from "@/lib/gallery";
import { cn, formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const wishlist = useCart((s) => s.wishlist);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const addToCart = useCart((s) => s.addToCart);
  const products = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <DashHeader title="Wishlist" subtitle="Products you've saved for later." />
      {products.length === 0 ? (
        <EmptyState
          icon="Heart"
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here."
          action={<Button asChild><Link href="/marketplace">Browse marketplace</Link></Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <Link href={`/marketplace/${p.id}`} className="block">
                <div className={cn("relative aspect-[4/3] overflow-hidden bg-gradient-to-br", p.gradient)}>
                  {PRODUCT_IMAGES[p.id] && <Image src={PRODUCT_IMAGES[p.id]} alt={p.name} fill sizes="25vw" className="object-cover" />}
                </div>
              </Link>
              <CardContent className="p-3">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="font-display text-sm font-semibold">{formatCurrency(p.price)}</p>
                <div className="mt-2 flex gap-1.5">
                  <Button size="sm" className="flex-1" onClick={() => addToCart(p.id)}><Plus className="size-4" /> Cart</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleWishlist(p.id)} aria-label="Remove"><Heart className="size-4 fill-primary text-primary" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
