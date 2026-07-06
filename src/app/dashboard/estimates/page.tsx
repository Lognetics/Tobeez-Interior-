"use client";

import Link from "next/link";
import { Calculator, Download, Plus } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

export default function SavedEstimatesPage() {
  const estimates = useAppData((s) => s.estimates);

  function download(e: (typeof estimates)[number]) {
    const blob = new Blob([JSON.stringify(e, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `tobeez-estimate-${e.id}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <DashHeader title="Saved Estimates" subtitle="Your unlocked AI estimates."
        action={<Button asChild><Link href="/estimator"><Plus /> New Estimate</Link></Button>} />

      {estimates.length === 0 ? (
        <EmptyState icon="Calculator" title="No saved estimates"
          description="Complete the AI Cost Estimator and unlock it to save the full itemised report here."
          action={<Button asChild><Link href="/estimator">Start AI Estimate</Link></Button>} />
      ) : (
        <div className="space-y-4">
          {estimates.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Calculator className="size-6" /></span>
                  <div>
                    <p className="font-medium">{e.category ?? "Furnishing estimate"}{e.style ? ` · ${e.style}` : ""}</p>
                    <p className="text-sm text-muted-foreground">{e.area ? `${e.area} sqm · ` : ""}Range {formatCurrency(e.min, e.currency)} – {formatCurrency(e.max, e.currency)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-display text-lg font-bold">{formatCurrency(e.recommended, e.currency)}</p>
                    <p className="text-xs text-muted-foreground">recommended</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => download(e)}><Download className="size-4" /> Export</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
