import { DashHeader, StatCard } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const leads = [
  { client: "Chidi N.", project: "4-Bed Villa · Luxury", value: 42000000, status: "New" },
  { client: "Grace A.", project: "Boutique Café", value: 12500000, status: "Contacted" },
  { client: "Bola T.", project: "Penthouse Upgrade", value: 28000000, status: "Proposal" },
];

export default function DesignerOverview() {
  return (
    <>
      <DashHeader title="Studio overview" subtitle="Your leads, consultations and earnings at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value="8" delta={15} icon="FolderKanban" />
        <StatCard label="New Leads" value="12" delta={22} icon="Target" />
        <StatCard label="This Month" value={formatCurrency(3200000)} delta={9} icon="Wallet" />
        <StatCard label="Avg Rating" value="4.9" delta={2} icon="Star" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="mb-4 font-display font-semibold">Incoming leads</h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((l) => (
                    <tr key={l.client}>
                      <td className="px-4 py-3 font-medium">{l.client}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.project}</td>
                      <td className="px-4 py-3 tabular-nums">{formatCurrency(l.value)}</td>
                      <td className="px-4 py-3"><Badge variant={l.status === "New" ? "default" : "muted"}>{l.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display font-semibold">Today's schedule</h2>
            <div className="space-y-3">
              {[
                { time: "10:30", label: "Video · Grace A.", tone: "default" },
                { time: "13:00", label: "Site visit · Lekki", tone: "muted" },
                { time: "16:00", label: "Call · Bola T.", tone: "muted" },
              ].map((s) => (
                <div key={s.time} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="font-display text-sm font-semibold text-primary">{s.time}</span>
                  <span className="text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
