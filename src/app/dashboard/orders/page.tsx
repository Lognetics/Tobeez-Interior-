"use client";

import Link from "next/link";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppData, type OrderStatus } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

const STEPS: OrderStatus[] = ["processing", "shipped", "delivered"];

export default function OrdersPage() {
  const orders = useAppData((s) => s.orders);

  return (
    <>
      <DashHeader title="Orders" subtitle="Track your marketplace purchases." />
      {orders.length === 0 ? (
        <EmptyState
          icon="ShoppingBag"
          title="No orders yet"
          description="When you buy from the marketplace, your orders and delivery tracking appear here."
          action={<Button asChild><Link href="/marketplace">Browse marketplace</Link></Button>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const stepIndex = STEPS.indexOf(o.status === "cancelled" ? "processing" : o.status);
            return (
              <Card key={o.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">Order #{o.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{o.items.reduce((n, i) => n + i.qty, 0)} items · {o.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={o.status === "delivered" ? "success" : "default"} className="capitalize">{o.status}</Badge>
                      <span className="font-display font-semibold">{formatCurrency(o.total)}</span>
                    </div>
                  </div>

                  {/* Tracker */}
                  <div className="mt-5 flex items-center">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center">
                          <span className={`grid size-8 place-items-center rounded-full ${i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {s === "delivered" ? <CheckCircle2 className="size-4" /> : s === "shipped" ? <Truck className="size-4" /> : <Package className="size-4" />}
                          </span>
                          <span className="mt-1 text-[11px] capitalize text-muted-foreground">{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < stepIndex ? "bg-primary" : "bg-muted"}`} />}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                    {o.items.map((it) => (
                      <div key={it.productId} className="flex justify-between">
                        <span className="text-muted-foreground">{it.name} × {it.qty}</span>
                        <span>{formatCurrency(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
