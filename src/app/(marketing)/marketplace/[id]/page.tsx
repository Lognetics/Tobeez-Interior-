import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductDetail } from "@/components/marketplace/product-detail";
import { PRODUCTS } from "@/lib/data/products";
import { getProductById, getProducts } from "@/lib/data/catalog";

export const revalidate = 60;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const { products } = await getProducts();
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const fallback = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="pt-28 pb-16">
      <Container>
        <Link href="/marketplace" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to marketplace
        </Link>
        <ProductDetail product={product} related={related.length ? related : fallback} />
      </Container>
    </div>
  );
}
