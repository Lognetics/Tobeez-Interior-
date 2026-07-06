import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { DashHeader, StatCard } from "@/components/dashboard/widgets";
import { DashboardGreeting } from "@/components/dashboard/greeting";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const projects = [
  { name: "Lekki Duplex Furnishing", stage: "In Progress", budget: 18500000, progress: 62 },
  { name: "Ikoyi Office Fit-out", stage: "Planning", budget: 9200000, progress: 20 },
  { name: "Shortlet Apartment", stage: "Completed", budget: 6400000, progress: 100 },
];

export default function ClientOverview() {
  return (
    <>
      <DashHeader
        title={<DashboardGreeting />}
        subtitle="Here's what's happening across your projects."
        action={<Button asChild><Link href="/estimator"><Plus /> New Estimate</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value="2" delta={12} icon="FolderKanban" />
        <StatCard label="Saved Estimates" value="7" delta={8} icon="Calculator" />
        <StatCard label="Total Budgeted" value={formatCurrency(34100000)} delta={5} icon="Wallet" />
        <StatCard label="Consultations" value="3" delta={-4} icon="CalendarClock" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display font-semibold">Your projects</h2>
              <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.name} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{p.name}</p>
                    <Badge variant={p.stage === "Completed" ? "success" : p.stage === "Planning" ? "muted" : "default"}>{p.stage}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(p.budget)}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display font-semibold">Quick actions</h2>
            <div className="space-y-2">
              {[
                { label: "Open AI Design Studio", href: "/studio", icon: "Sparkles" },
                { label: "Start AI Estimate", href: "/estimator", icon: "Calculator" },
                { label: "Book Consultation", href: "/consultation", icon: "CalendarClock" },
                { label: "Browse Marketplace", href: "/marketplace", icon: "ShoppingBag" },
              ].map((a) => (
                <Button key={a.label} asChild variant="outline" className="w-full justify-between">
                  <Link href={a.href}>{a.label} <ArrowRight className="size-4" /></Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
