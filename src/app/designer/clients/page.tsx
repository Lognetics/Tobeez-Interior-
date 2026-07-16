"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DashHeader, EmptyState, StatCard } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listConsultantLeads } from "@/lib/consultations/client";
import type { ConsultationBooking } from "@/lib/consultations/types";
import { formatCurrency } from "@/lib/utils";

type ClientRow = {
  key: string;
  name: string;
  email: string;
  sessions: number;
  paidValue: number;
  lastSession: string;
  lastStatus: ConsultationBooking["status"];
};

export default function ClientsPage() {
  const [bookings, setBookings] = React.useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    listConsultantLeads()
      .then((result) => setBookings(result.bookings))
      .finally(() => setLoading(false));
  }, []);

  // One row per client, aggregated across every booking they've made with you.
  const clients = React.useMemo(() => {
    const map = new Map<string, ClientRow>();
    for (const booking of [...bookings].sort((a, b) => a.createdAt - b.createdAt)) {
      const key = booking.clientEmail || booking.clientUserId || booking.clientName;
      const row = map.get(key) ?? {
        key,
        name: booking.clientName,
        email: booking.clientEmail,
        sessions: 0,
        paidValue: 0,
        lastSession: "",
        lastStatus: booking.status,
      };
      row.sessions += 1;
      if (booking.status === "confirmed" || booking.status === "completed") row.paidValue += booking.amount;
      row.lastSession = `${booking.dateLabel} · ${booking.time}`;
      row.lastStatus = booking.status;
      map.set(key, row);
    }
    return [...map.values()].reverse();
  }, [bookings]);

  const repeatClients = clients.filter((client) => client.sessions > 1).length;

  return (
    <>
      <DashHeader title="Clients" subtitle="Everyone who has booked a consultation with you." />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading live records…</div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No clients yet"
          description="When someone books and pays for a consultation with you, they appear here with their booking history."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total clients" value={String(clients.length)} icon="Users" />
            <StatCard label="Repeat clients" value={String(repeatClients)} icon="Repeat" />
            <StatCard label="Sessions booked" value={String(bookings.length)} icon="CalendarClock" href="/designer/consultations" />
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full min-w-full text-sm">
                  <thead className="bg-muted/50 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Sessions</th>
                      <th className="px-4 py-3 font-medium">Paid value</th>
                      <th className="px-4 py-3 font-medium">Latest session</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {clients.map((client) => (
                      <tr key={client.key}>
                        <td className="px-4 py-3 font-medium">{client.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{client.email || "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{client.sessions}</td>
                        <td className="px-4 py-3 tabular-nums">{formatCurrency(client.paidValue)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{client.lastSession}</td>
                        <td className="px-4 py-3"><Badge className="capitalize">{client.lastStatus}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
