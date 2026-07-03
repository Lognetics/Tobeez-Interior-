import { DashHeader, StatCard } from "@/components/dashboard/widgets";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const recent = [
  { user: "Jane Doe", action: "Generated an estimate", time: "2m ago", tag: "Estimate" },
  { user: "Marcus Bello", action: "Booked a consultation", time: "18m ago", tag: "Booking" },
  { user: "Grace A.", action: "Placed an order", time: "1h ago", tag: "Order" },
  { user: "Chidi N.", action: "Created an account", time: "3h ago", tag: "Signup" },
];

const topStyles = [
  { name: "Modern", pct: 34 },
  { name: "Luxury", pct: 26 },
  { name: "Minimalist", pct: 18 },
  { name: "Japandi", pct: 12 },
  { name: "Contemporary", pct: 10 },
];

export default function AdminOverview() {
  return (
    <>
      <DashHeader title="Platform overview" subtitle="Key metrics across users, revenue and activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(486000000)} delta={18} icon="DollarSign" />
        <StatCard label="Active Users" value="12,480" delta={11} icon="Users" />
        <StatCard label="Estimates Run" value="38,214" delta={24} icon="Calculator" />
        <StatCard label="Consultations" value="1,905" delta={7} icon="CalendarClock" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display font-semibold">Revenue</h2>
              <Badge variant="success">+18% YoY</Badge>
            </div>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display font-semibold">Most selected styles</h2>
            <div className="space-y-4">
              {topStyles.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{s.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display font-semibold">Recent activity</h2>
          <div className="divide-y divide-border">
            {recent.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {r.user.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.user}</p>
                    <p className="text-xs text-muted-foreground">{r.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="muted">{r.tag}</Badge>
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
