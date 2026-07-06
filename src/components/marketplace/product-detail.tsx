"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Heart, Minus, Plus, ShieldCheck, Star, Truck, Package, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Product } from "@/lib/data/products";
import { PRODUCT_IMAGES } from "@/lib/gallery";
import { useCart } from "@/lib/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";

const GALLERY_POOL = [
  "/gallery/img-8115.jpg", "/gallery/img-8143.jpg", "/gallery/img-8126.jpg", "/gallery/img-8149.jpg",
];

function Perk({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border p-3 text-center">
      {icon}
      <p className="mt-1.5 text-xs font-medium">{title}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const addToCart = useCart((s) => s.addToCart);
  const wishlist = useCart((s) => s.wishlist);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const [mounted, setMounted] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const main = PRODUCT_IMAGES[product.id];
  const gallery = [main, ...GALLERY_POOL.filter((g) => g !== main)].filter(Boolean).slice(0, 4) as string[];
  const [activeImg, setActiveImg] = React.useState(gallery[0]);
  const wished = mounted && wishlist.includes(product.id);

  const specs = [
    ["Brand", product.brand],
    ["Category", product.category],
    ["Material", "Premium engineered composite"],
    ["Warranty", "2 years manufacturer warranty"],
    ["Availability", "In stock · ships in 3–5 days"],
  ];

  function add() {
    addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }
  function buyNow() {
    addToCart(product.id, qty);
    router.push("/checkout");
  }

  return (
    <div className="space-y-14">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className={cn("relative aspect-square overflow-hidden rounded-3xl border border-border bg-gradient-to-br", product.gradient)}>
            {activeImg && <Image src={activeImg} alt={product.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />}
            {product.tag && <Badge className="absolute left-4 top-4" variant={product.tag === "Luxury" ? "default" : "secondary"}>{product.tag}</Badge>}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((g) => (
              <button key={g} onClick={() => setActiveImg(g)} className={cn("relative aspect-square overflow-hidden rounded-xl border-2 transition-colors", activeImg === g ? "border-primary" : "border-border")}>
                <Image src={g} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-primary text-primary" /> <b>{product.rating}</b>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </span>
            <span className="text-success">● In stock</span>
          </div>

          <p className="mt-5 font-display text-3xl font-bold">{formatCurrency(product.price)}</p>
          <p className="mt-3 text-muted-foreground">
            A designer-grade {product.category.toLowerCase()} piece from {product.brand}, crafted for durability and
            everyday luxury. Pairs beautifully with warm-modern and contemporary interiors.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-10 place-items-center hover:bg-muted" aria-label="Decrease"><Minus className="size-4" /></button>
              <span className="w-10 text-center font-medium tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid size-10 place-items-center hover:bg-muted" aria-label="Increase"><Plus className="size-4" /></button>
            </div>
            <Button size="lg" onClick={add} className="flex-1 sm:flex-none">{added ? <><Check /> Added to cart</> : "Add to cart"}</Button>
            <Button size="lg" variant="secondary" onClick={buyNow}>Buy now</Button>
            <Button size="lg" variant="outline" onClick={() => toggleWishlist(product.id)} aria-label="Wishlist" className="px-4">
              <Heart className={cn("size-5", wished ? "fill-primary text-primary" : "")} />
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Perk icon={<Truck className="mx-auto size-5 text-primary" />} title="Free delivery" sub="Over ₦2M" />
            <Perk icon={<ShieldCheck className="mx-auto size-5 text-primary" />} title="2-yr warranty" sub="Included" />
            <Perk icon={<RotateCcw className="mx-auto size-5 text-primary" />} title="30-day returns" sub="Hassle-free" />
          </div>

          <Card className="mt-6">
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><Package className="size-4" /> Specifications</h3>
              <dl className="divide-y divide-border text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="mb-5 font-display text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} href={`/marketplace/${p.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className={cn("relative aspect-[4/3] overflow-hidden bg-gradient-to-br", p.gradient)}>
                  {PRODUCT_IMAGES[p.id] && <Image src={PRODUCT_IMAGES[p.id]} alt={p.name} fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="font-display text-sm font-semibold">{formatCurrency(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
