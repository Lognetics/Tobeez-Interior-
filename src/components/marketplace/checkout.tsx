"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, cartDetails, SHIPPING_FLAT, TAX_RATE } from "@/lib/store/cart-store";
import { useAppData } from "@/lib/store/app-data";
import { PRODUCT_IMAGES } from "@/lib/gallery";
import { cn, formatCurrency } from "@/lib/utils";

const PAYMENTS = ["Card", "Paystack", "Flutterwave", "Bank Transfer"];

export function Checkout() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const addOrder = useAppData((s) => s.addOrder);
  const addInvoice = useAppData((s) => s.addInvoice);
  const addNotification = useAppData((s) => s.addNotification);

  const [mounted, setMounted] = React.useState(false);
  const [placing, setPlacing] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [payment, setPayment] = React.useState("Card");
  const [address, setAddress] = React.useState("");
  React.useEffect(() => setMounted(true), []);

  const { lines, subtotal } = cartDetails(items);
  const shipping = subtotal > 2_000_000 || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1100)); // stubbed payment
    const order = addOrder({
      items: lines.map((l) => ({ productId: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty })),
      subtotal, shipping, tax, total, address: address || "Lekki Phase 1, Lagos",
    });
    addInvoice({ kind: "order", description: `Marketplace order · ${lines.length} item(s)`, amount: total, ref: order.id });
    addNotification({
      title: "Order placed", kind: "payment", href: "/dashboard/orders",
      body: `Order #${order.id.slice(-6).toUpperCase()} for ${formatCurrency(total)} is confirmed and processing.`,
    });
    clearCart();
    setOrderId(order.id);
    setPlacing(false);
  }

  if (!mounted) return <div className="mx-auto h-96 max-w-4xl animate-pulse rounded-3xl bg-muted" />;

  if (orderId) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h1 className="mt-4 font-display text-2xl font-bold">Order confirmed!</h1>
        <p className="mt-2 text-muted-foreground">
          Order <b className="text-foreground">#{orderId.slice(-6).toUpperCase()}</b> is confirmed. A receipt has been
          emailed to you and you can track delivery from your dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1"><Link href="/dashboard/orders">Track order</Link></Button>
          <Button asChild variant="outline" className="flex-1"><Link href="/marketplace">Keep shopping</Link></Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <h1 className="font-display text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products before checking out.</p>
        <Button asChild className="mt-6"><Link href="/marketplace">Browse marketplace</Link></Button>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">1 · Shipping details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" required placeholder="Jane Doe" /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required placeholder="you@email.com" /></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" required placeholder="+234…" /></div>
            <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" required placeholder="Lagos" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="addr">Delivery address</Label><Input id="addr" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, landmark" /></div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">2 · Payment method</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PAYMENTS.map((p) => (
              <button key={p} type="button" onClick={() => setPayment(p)}
                className={cn("rounded-2xl border p-4 text-center text-sm font-medium transition-all", payment === p ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40")}>
                <CreditCard className={cn("mx-auto mb-1.5 size-5", payment === p ? "text-primary" : "text-muted-foreground")} />
                {p}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" /> Payments are encrypted. This is a stubbed checkout in the demo build.</p>
        </section>
      </div>

      {/* Order summary */}
      <aside className="h-fit lg:sticky lg:top-24">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="font-display font-semibold">Order summary</h2>
            <div className="space-y-3">
              {lines.map(({ product, qty, lineTotal }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className={cn("relative size-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br", product.gradient)}>
                    {PRODUCT_IMAGES[product.id] && <Image src={PRODUCT_IMAGES[product.id]} alt={product.name} fill sizes="48px" className="object-cover" />}
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[9px] font-bold text-background">{qty}</span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{product.name}</span>
                  <span className="text-sm font-medium tabular-nums">{formatCurrency(lineTotal)}</span>
                </div>
              ))}
            </div>
            <dl className="space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatCurrency(shipping)} />
              <Row label="Tax (VAT 7.5%)" value={formatCurrency(tax)} />
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span><span className="font-display">{formatCurrency(total)}</span>
              </div>
            </dl>
            <Button type="submit" size="lg" className="w-full" disabled={placing}>
              {placing ? <Loader2 className="animate-spin" /> : <Lock />}
              {placing ? "Processing…" : `Pay ${formatCurrency(total)}`}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
