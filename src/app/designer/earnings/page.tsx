"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DashHeader, EmptyState, StatCard } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listConsultantLeads } from "@/lib/consultations/client";
import type { ConsultationBooking } from "@/lib/consultations/types";
import { formatCurrency } from "@/lib/utils";

export default function EarningsPage() {
  const [bookings, setBookings] = React.useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    listConsultantLeads()
      .then((result) => setBookings(result.bookings))
      .finally(() => setLoading(false));
  }, []);

  const earned = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "completed");
  const pending = bookings.filter((booking) => booking.status === "pending");
  const totalEarned = earned.reduce((total, booking) => total + booking.amount, 0);
  const pendingValue = pending.reduce((total, booking) => total + booking.amount, 0);

  const monthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonth = earned
    .filter((booking) => booking.dateIso.startsWith(monthPrefix))
    .reduce((total, booking) => total + booking.amount, 0);

  const rows = [...bookings]
    .filter((booking) => booking.status !== "cancelled")
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <DashHeader title="Earnings" subtitle="Paystack-verified consultation revenue, live from your bookings." />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading live records…</div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="Wallet"
          title="No earnings yet"
          description="Accepted consultation bookings appear here with their verified payment amounts."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total confirmed earnings" value={formatCurrency(totalEarned)} icon="Wallet" />
            <StatCard label="Sessions this month" value={formatCurrency(thisMonth)} icon="CalendarClock" />
            <StatCard label="Awaiting your response" value={formatCurrency(pendingValue)} icon="Target" href="/designer/leads" />
            <StatCard label="Paid sessions" value={String(earned.length)} icon="ListChecks" href="/designer/consultations" />
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="mb-4 font-display font-semibold">Transactions</h2>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full min-w-full text-sm">
                  <thead className="bg-muted/50 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Session</th>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-3 text-muted-foreground">{booking.dateLabel} · {booking.time}</td>
                        <td className="px-4 py-3 font-medium">{booking.clientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{booking.type}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums">{formatCurrency(booking.amount)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{booking.paystackRef}</td>
                        <td className="px-4 py-3"><Badge className="capitalize">{booking.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Amounts are what clients paid TOBEEZ via Paystack for your sessions. Payouts to consultants are settled off-platform for now.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
