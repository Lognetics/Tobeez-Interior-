"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashHeader, StatCard } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listConsultantLeads } from "@/lib/consultations/client";
import type { ConsultationBooking } from "@/lib/consultations/types";
import { formatCurrency } from "@/lib/utils";

export default function DesignerOverview() {
  const router = useRouter();
  const [bookings, setBookings] = React.useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [now] = React.useState(() => Date.now());

  React.useEffect(() => {
    listConsultantLeads()
      .then((result) => setBookings(result.bookings))
      .finally(() => setLoading(false));
  }, []);

  const pending = bookings.filter((booking) => booking.status === "pending");
  const confirmed = bookings.filter((booking) => booking.status === "confirmed");
  const upcoming = confirmed.filter((booking) => new Date(`${booking.dateIso}T${booking.time}:00`).getTime() >= now);
  const confirmedValue = confirmed.reduce((total, booking) => total + booking.amount, 0);

  return (
    <>
      <DashHeader title="Consultant overview" subtitle="Live consultation requests and schedule totals." />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading live records…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pending paid leads" value={String(pending.length)} icon="Target" href="/designer/leads" />
            <StatCard label="Upcoming sessions" value={String(upcoming.length)} icon="CalendarClock" href="/designer/calendar" />
            <StatCard label="Confirmed booking value" value={formatCurrency(confirmedValue)} icon="Wallet" href="/designer/earnings" />
            <StatCard label="All consultation records" value={String(bookings.length)} icon="ListChecks" href="/designer/consultations" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display font-semibold">Paid leads awaiting response</h2>
                  <Button asChild size="sm" variant="outline"><Link href="/designer/leads">Open leads</Link></Button>
                </div>
                {pending.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No pending leads.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Client</th><th className="px-4 py-3 font-medium">Session</th><th className="px-4 py-3 font-medium">Value</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
                      <tbody className="divide-y divide-border">
                        {pending.slice(0, 5).map((booking) => (
                          <tr
                            key={booking.id}
                            onClick={() => router.push("/designer/leads")}
                            className="cursor-pointer transition-colors hover:bg-muted/50"
                            title="Open in Leads to accept or decline"
                          >
                            <td className="px-4 py-3 font-medium">{booking.clientName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{booking.dateLabel} · {booking.time}</td>
                            <td className="px-4 py-3 tabular-nums">{formatCurrency(booking.amount)}</td>
                            <td className="px-4 py-3"><Badge>Pending</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display font-semibold">Upcoming</h2>
                  <Button asChild size="sm" variant="outline"><Link href="/designer/consultations">Schedule</Link></Button>
                </div>
                <div className="space-y-3">
                  {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No accepted upcoming sessions.</p> : upcoming.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-border p-3">
                      <p className="font-display text-sm font-semibold text-primary">{booking.dateLabel} · {booking.time}</p>
                      <p className="mt-1 text-sm">{booking.clientName}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
