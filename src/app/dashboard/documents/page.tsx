"use client";

import Image from "next/image";
import Link from "next/link";
import { Calculator, FileText, ImageIcon, Receipt } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/store/app-data";

type Doc = { id: string; title: string; type: "Design" | "Estimate" | "Invoice"; at: number; src?: string; href?: string };

export default function DocumentsPage() {
  const { savedDesigns, estimates, invoices } = useAppData();

  const docs: Doc[] = [
    ...savedDesigns.map((d) => ({ id: d.id, title: d.prompt.slice(0, 48) || "AI design", type: "Design" as const, at: d.createdAt, src: d.src })),
    ...estimates.map((e) => ({ id: e.id, title: `${e.category ?? "Furnishing"} estimate`, type: "Estimate" as const, at: e.createdAt, href: "/dashboard/estimates" })),
    ...invoices.map((i) => ({ id: i.id, title: `Invoice ${i.number}`, type: "Invoice" as const, at: i.createdAt, href: "/dashboard/invoices" })),
  ].sort((a, b) => b.at - a.at);

  return (
    <>
      <DashHeader title="Documents" subtitle="Saved designs, estimate reports and receipts." />
      {docs.length === 0 ? (
        <EmptyState icon="FileText" title="No documents yet"
          description="Designs you save in the AI Studio, unlocked estimates and invoices all appear here." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {docs.map((d) => {
            const inner = (
              <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="relative aspect-[4/3] bg-muted">
                  {d.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.src} alt={d.title} className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-muted-foreground">
                      {d.type === "Estimate" ? <Calculator className="size-8" /> : <Receipt className="size-8" />}
                    </div>
                  )}
                  <Badge className="absolute left-2 top-2" variant="muted">
                    {d.type === "Design" ? <ImageIcon className="size-3" /> : d.type === "Estimate" ? <Calculator className="size-3" /> : <FileText className="size-3" />}
                    {d.type}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(d.at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            );
            return d.href ? <Link key={d.id} href={d.href}>{inner}</Link> : <div key={d.id}>{inner}</div>;
          })}
        </div>
      )}
    </>
  );
}
