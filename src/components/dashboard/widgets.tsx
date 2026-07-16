import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, delta, icon, href,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: string;
  href?: string;
}) {
  const Icon = (Icons[icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon;
  const up = (delta ?? 0) >= 0;
  const card = (
    <Card className={cn(href && "transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          {delta !== undefined && (
            <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", up ? "text-success" : "text-destructive")}>
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
        <p className="mt-4 font-display text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{card}</Link> : card;
}

export function EmptyState({ icon = "Inbox", title, description, action }: { icon?: string; title: string; description?: string; action?: React.ReactNode }) {
  const Icon = (Icons[icon as keyof typeof Icons] ?? Icons.Inbox) as Icons.LucideIcon;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-7" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
