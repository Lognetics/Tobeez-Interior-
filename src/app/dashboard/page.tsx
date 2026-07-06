"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Plus, Sparkles, Calculator, CalendarClock, ShoppingBag } from "lucide-react";
import { DashHeader, StatCard } from "@/components/dashboard/widgets";
import { DashboardGreeting } from "@/components/dashboard/greeting";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppData, selectActivity } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = { planning: "Planning", in_progress: "In Progress", completed: "Completed", on_hold: "On Hold" };

const QUICK = [
  { label: "Open AI Design Studio", href: "/studio", icon: Sparkles },
  { label: "Start AI Estimate", href: "/estimator", icon: Calculator },
  { label: "Book Consultation", href: "/consultation", icon: CalendarClock },
  { label: "Browse Marketplace", href: "/marketplace", icon: ShoppingBag },
];

export default function ClientOverview() {
  const projects = useAppData((s) => s.projects);
  const estimates = useAppData((s) => s.estimates);
  const bookings = useAppData((s) => s.bookings);
  const orders = useAppData((s) => s.orders);
  const savedDesigns = useAppData((s) => s.savedDesigns);
  const activity = React.useMemo(
    () => selectActivity({ projects, estimates, bookings, orders, savedDesigns }),
    [projects, estimates, bookings, orders, savedDesigns],
  );
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);

  return (
    <>
      <DashHeader
        title={<DashboardGreeting />}
        subtitle="Here's everything happening across your account."
        action={<Button asChild><Link href="/estimator"><Plus /> New Estimate</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={String(projects.length)} icon="FolderKanban" />
        <StatCard label="Saved Estimates" value={String(estimates.length)} icon="Calculator" />
        <StatCard label="Total Budgeted" value={formatCurrency(totalBudget)} icon="Wallet" />
        <StatCard label="Consultations" value={String(bookings.length)} icon="CalendarClock" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display font-semibold">Your projects</h2>
              <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight className="size-3.5" /></Link>
            </div>
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                No projects yet. Generate an estimate or start a design to create one.
                <div className="mt-4"><Button asChild size="sm"><Link href="/estimator">Start AI Estimate</Link></Button></div>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <div key={p.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{p.name}</p>
                      <Badge variant={p.status === "completed" ? "success" : p.status === "planning" ? "muted" : "default"}>{STATUS_LABEL[p.status]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(p.budget)}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display font-semibold">Quick actions</h2>
            <div className="space-y-2">
              {QUICK.map((a) => (
                <Button key={a.label} asChild variant="outline" className="w-full justify-between">
                  <Link href={a.href}><span className="flex items-center gap-2"><a.icon className="size-4" /> {a.label}</span> <ArrowRight className="size-4" /></Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display font-semibold">Activity timeline</h2>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Your activity across estimates, bookings, orders and designs will appear here.</p>
          ) : (
            <div className="space-y-1">
              {activity.slice(0, 8).map((a) => (
                <Link key={a.id} href={a.href ?? "#"} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{a.kind.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{orders.length + estimates.length + bookings.length ? relTime(a.at) : ""}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function relTime(at: number) {
  const diff = Date.now() - at;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
