"use client";

import { Download, Receipt } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppData, type Invoice } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

const KIND_LABEL: Record<Invoice["kind"], string> = { consultation: "Consultation", order: "Order", estimate: "AI Estimate" };

export default function InvoicesPage() {
  const invoices = useAppData((s) => s.invoices);
  const total = invoices.reduce((s, i) => s + i.amount, 0);

  function download(inv: Invoice) {
    const body = `TOBEEZ INTERIORS\nInvoice ${inv.number}\n\n${inv.description}\nType: ${KIND_LABEL[inv.kind]}\nAmount: ${formatCurrency(inv.amount)}\nStatus: ${inv.status.toUpperCase()}\nDate: ${new Date(inv.createdAt).toLocaleString()}\n`;
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${inv.number}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <DashHeader title="Invoices" subtitle="Receipts for consultations, orders and estimates." />
      {invoices.length === 0 ? (
        <EmptyState icon="Receipt" title="No invoices yet"
          description="Invoices are generated automatically when you book a consultation, place an order or unlock an estimate." />
      ) : (
        <>
          <Card className="mb-4">
            <CardContent className="flex items-center justify-between p-5">
              <span className="text-sm text-muted-foreground">Total billed ({invoices.length})</span>
              <span className="font-display text-xl font-bold">{formatCurrency(total)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Receipt className="size-5" /></span>
                      <div>
                        <p className="text-sm font-medium">{inv.number}</p>
                        <p className="text-xs text-muted-foreground">{inv.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="muted">{KIND_LABEL[inv.kind]}</Badge>
                      <Badge variant={inv.status === "paid" ? "success" : "default"} className="capitalize">{inv.status}</Badge>
                      <span className="font-medium tabular-nums">{formatCurrency(inv.amount)}</span>
                      <Button variant="ghost" size="icon" onClick={() => download(inv)} aria-label="Download"><Download className="size-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
