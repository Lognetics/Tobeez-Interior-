"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEstimator } from "@/lib/estimator/store";
import { useAppData } from "@/lib/store/app-data";
import { estimate } from "@/lib/estimator/engine";
import { PROPERTY_CATEGORIES, DESIGN_STYLES } from "@/lib/estimator/constants";
import { formatCurrency } from "@/lib/utils";

const OLD_PRICE = 53000;
const TODAY_PRICE = 7000;

const UNLOCKS = [
  "Complete AI estimate with min / max range",
  "Room-by-room cost breakdown",
  "Material & furniture recommendations",
  "Labour & timeline estimate",
  "Budget optimization suggestions",
  "Downloadable PDF & Excel export",
  "Shareable report link",
];

export function EstimatorUnlock({ teaser }: { teaser: React.ReactNode }) {
  const unlock = useEstimator((s) => s.unlock);
  const data = useEstimator((s) => s.data);
  const { addNotification, addEstimate, addInvoice, addProject } = useAppData();
  const [paying, setPaying] = React.useState(false);

  async function pay() {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1100)); // stubbed payment

    // Persist the estimate, an invoice, and a project so it shows up across the
    // dashboard (Saved Estimates, Invoices, My Projects, Activity, Notifications).
    const result = estimate(data);
    const categoryLabel = PROPERTY_CATEGORIES.find((c) => c.id === data.category)?.label;
    const styleLabel = DESIGN_STYLES.find((s) => s.id === data.style)?.label;

    const est = addEstimate({
      category: categoryLabel, style: styleLabel, area: data.floorAreaSqm,
      currency: result.currency, recommended: result.recommended, min: result.min, max: result.max, input: data,
    });
    addInvoice({ kind: "estimate", description: `AI Estimate unlock · ${categoryLabel ?? "Project"}`, amount: TODAY_PRICE, ref: est.id });
    addProject({ name: `${categoryLabel ?? "New"} furnishing`, category: data.category, budget: result.recommended, estimateId: est.id });

    addNotification({
      title: "Estimate unlocked", kind: "payment", href: "/dashboard/estimates",
      body: "Your full itemised AI estimate is ready, and saved to your projects.",
    });
    unlock();
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Blurred teaser behind the paywall */}
      <div className="relative overflow-hidden rounded-3xl border border-border">
        <div className="pointer-events-none max-h-[320px] select-none overflow-hidden opacity-40 blur-[14px]">{teaser}</div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto -mt-24 max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-glow"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="size-7" />
        </span>
        <Badge className="mt-4"><Sparkles className="size-3" /> Launch Offer for Early Users</Badge>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">Your estimate is ready</h2>
        <p className="mt-1 text-muted-foreground">Unlock the complete, itemised breakdown for your project.</p>

        <div className="mt-6 flex items-end justify-center gap-3">
          <span className="font-display text-5xl font-bold text-gradient">{formatCurrency(TODAY_PRICE)}</span>
          <span className="mb-2 text-lg text-muted-foreground line-through">{formatCurrency(OLD_PRICE)}</span>
        </div>
        <p className="mt-1 text-sm text-success">You save {formatCurrency(OLD_PRICE - TODAY_PRICE)} today</p>

        <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
          {UNLOCKS.map((u) => (
            <li key={u} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" /> {u}
            </li>
          ))}
        </ul>

        <Button className="mt-7 w-full" size="lg" onClick={pay} disabled={paying}>
          {paying ? <Loader2 className="animate-spin" /> : <Lock />}
          {paying ? "Processing…" : `Unlock for ${formatCurrency(TODAY_PRICE)}`}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Your answers are saved, you can come back and unlock any time. Payment is stubbed in this demo build.
        </p>
      </motion.div>
    </div>
  );
}
