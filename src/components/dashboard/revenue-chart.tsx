"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils";

const data = [
  { m: "Jan", v: 12 }, { m: "Feb", v: 19 }, { m: "Mar", v: 15 }, { m: "Apr", v: 27 },
  { m: "May", v: 24 }, { m: "Jun", v: 38 }, { m: "Jul", v: 44 }, { m: "Aug", v: 41 },
  { m: "Sep", v: 53 }, { m: "Oct", v: 61 }, { m: "Nov", v: 58 }, { m: "Dec", v: 72 },
];

export function RevenueChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `${formatCompact(v * 1_000_000)}`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} />
          <Tooltip formatter={(v) => formatCurrency(Number(v) * 1_000_000)} labelStyle={{ color: "var(--foreground)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
          <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
