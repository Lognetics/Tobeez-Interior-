"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Heart, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUCTS, PRODUCT_CATEGORIES, type Product } from "@/lib/data/products";
import { PRODUCT_IMAGES } from "@/lib/gallery";
import { useCart } from "@/lib/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";

export function MarketplaceGrid() {
  const [category, setCategory] = React.useState<string>("All");
  const [query, setQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const wishlist = useCart((s) => s.wishlist);
  const toggleWishlist = useCart((s) => s.toggleWishlist);

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products or brands…" className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                category === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
          No products match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} wished={mounted && wishlist.includes(p.id)} onWish={() => toggleWishlist(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, index, wished, onWish }: { product: Product; index: number; wished: boolean; onWish: () => void }) {
  const addToCart = useCart((s) => s.addToCart);
  const [added, setAdded] = React.useState(false);

  function add(e: React.MouseEvent) {
    e.preventDefault();
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 8) * 0.04 }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
    >
      <Link href={`/marketplace/${product.id}`} className="block">
        <div className={cn("relative aspect-[4/3] overflow-hidden bg-gradient-to-br", product.gradient)}>
          {PRODUCT_IMAGES[product.id] && (
            <Image
              src={PRODUCT_IMAGES[product.id]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          {product.tag && (
            <Badge variant={product.tag === "Luxury" ? "default" : "secondary"} className="absolute left-3 top-3">
              {product.tag}
            </Badge>
          )}
          <button
            onClick={(e) => { e.preventDefault(); onWish(); }}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full glass transition-transform hover:scale-110"
          >
            <Heart className={cn("size-4", wished ? "fill-primary text-primary" : "text-foreground")} />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <Link href={`/marketplace/${product.id}`}><h3 className="mt-0.5 truncate font-medium hover:text-primary">{product.name}</h3></Link>
        <div className="mt-1.5 flex items-center gap-1 text-sm">
          <Star className="size-3.5 fill-primary text-primary" />
          <span className="font-medium">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display font-semibold">{formatCurrency(product.price)}</span>
          <Button size="sm" variant={added ? "default" : "outline"} onClick={add}>
            {added ? <><Check className="size-4" /> Added</> : "Add"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
