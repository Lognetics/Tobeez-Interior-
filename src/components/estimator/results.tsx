"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Download, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEstimator } from "@/lib/estimator/store";
import { estimate } from "@/lib/estimator/engine";
import { PROPERTY_CATEGORIES, DESIGN_STYLES } from "@/lib/estimator/constants";
import { cn, formatCurrency } from "@/lib/utils";

const CAT_COLORS: Record<string, string> = {
  furnishing: "oklch(0.66 0.15 52)",
  finishes: "oklch(0.7 0.13 200)",
  services: "oklch(0.68 0.14 150)",
  extras: "oklch(0.62 0.17 300)",
};
const CAT_LABELS: Record<string, string> = {
  furnishing: "Furnishing", finishes: "Finishes", services: "Services", extras: "Extras",
};

export function EstimatorResults() {
  const router = useRouter();
  const { data } = useEstimator();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const result = React.useMemo(() => estimate(data), [data]);

  if (!hydrated) {
    return <div className="mx-auto h-96 max-w-4xl animate-pulse rounded-3xl bg-muted" />;
  }

  if (!data.category || !data.floorAreaSqm) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <h2 className="font-display text-xl font-semibold">No estimate yet</h2>
        <p className="mt-2 text-muted-foreground">Complete the wizard to generate your itemised estimate.</p>
        <Button asChild className="mt-6"><Link href="/estimator">Start the estimator</Link></Button>
      </div>
    );
  }

  const category = PROPERTY_CATEGORIES.find((c) => c.id === data.category)?.label;
  const style = DESIGN_STYLES.find((s) => s.id === data.style)?.label;

  function downloadJson() {
    const blob = new Blob([JSON.stringify({ input: data, result }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tobeez-estimate.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const pieData = result.breakdownByCategory.map((b) => ({ name: CAT_LABELS[b.category] ?? b.category, key: b.category, value: b.amount }));
  const barData = result.items.filter((i) => i.category === "furnishing" || i.category === "finishes").map((i) => ({ name: i.label, amount: i.amount }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" onClick={() => router.push("/estimator")}><ArrowLeft /> Edit answers</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer /> Print / PDF</Button>
          <Button variant="outline" onClick={downloadJson}><Download /> Export</Button>
          <Button asChild><Link href="/consultation"><CalendarClock /> Book expert</Link></Button>
        </div>
      </div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-border bg-primary p-8 text-primary-foreground shadow-glow"
      >
        <Badge className="border-white/20 bg-white/15 text-primary-foreground"><Sparkles className="size-3" /> AI Estimate</Badge>
        <p className="mt-4 text-sm text-primary-foreground/80">
          {category}{style ? ` · ${style}` : ""} · {data.floorAreaSqm} sqm · {data.rooms?.length ?? 0} spaces
        </p>
        <p className="mt-2 font-display text-4xl font-bold sm:text-6xl">{formatCurrency(result.recommended, result.currency)}</p>
        <p className="mt-1 text-primary-foreground/80">Recommended budget</p>
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
          <HeadStat label="Minimum" value={formatCurrency(result.min, result.currency)} />
          <HeadStat label="Maximum" value={formatCurrency(result.max, result.currency)} />
          <HeadStat label="Per sqm" value={formatCurrency(result.perSqm, result.currency)} />
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-display font-semibold">Cost by category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                    {pieData.map((d) => <Cell key={d.key} fill={CAT_COLORS[d.key] ?? "var(--primary)"} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v), result.currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {pieData.map((d) => (
                <span key={d.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="size-3 rounded-full" style={{ background: CAT_COLORS[d.key] }} /> {d.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-display font-semibold">Furnishing & finishes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v), result.currency)} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itemised table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border p-6"><h3 className="font-display font-semibold">Itemised breakdown</h3></div>
          <div className="divide-y divide-border">
            {result.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={cn("size-2 rounded-full")} style={{ background: CAT_COLORS[item.category] }} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm font-medium tabular-nums">{formatCurrency(item.amount, result.currency)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-muted/40 px-6 py-4">
              <span className="font-semibold">Total estimate</span>
              <span className="font-display text-lg font-bold tabular-nums">{formatCurrency(result.subtotal, result.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground print:hidden">
        This is an AI-generated estimate for guidance. Book a consultation for a precise, contract-ready quotation.
      </p>
    </div>
  );
}

function HeadStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-primary-foreground/70">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
