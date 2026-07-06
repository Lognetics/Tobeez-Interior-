import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Checkout } from "@/components/marketplace/checkout";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="pt-28 pb-16">
      <Container>
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight">Checkout</h1>
        <Checkout />
      </Container>
    </div>
  );
}
