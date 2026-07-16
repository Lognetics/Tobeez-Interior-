"use client";

import * as React from "react";
import { AlertCircle, CalendarClock, Check, Loader2, RefreshCw, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listConsultantLeads, transitionConsultation } from "@/lib/consultations/client";
import type { BookingStatus, ConsultationBooking } from "@/lib/consultations/types";
import { useAppData } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

const statusVariant: Record<BookingStatus, "default" | "success" | "muted" | "outline"> = {
  pending: "default",
  confirmed: "success",
  declined: "outline",
  completed: "muted",
  cancelled: "muted",
};

export function ConsultantLeads({ scheduleOnly = false }: { scheduleOnly?: boolean }) {
  const addNotification = useAppData((state) => state.addNotification);
  const [bookings, setBookings] = React.useState<ConsultationBooking[]>([]);
  const [consultantName, setConsultantName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [now] = React.useState(() => Date.now());

  const load = React.useCallback(async (notifyNew = false) => {
    try {
      const result = await listConsultantLeads();
      setBookings(result.bookings);
      setConsultantName(result.consultant.consultantName);
      setError(result.source === "fallback" ? "Apply the consultation migrations through 0004 to activate live leads." : "");

      if (notifyNew && result.source === "database") {
        const storageKey = `tobeez-seen-leads-${result.consultant.consultantId}`;
        const seen = new Set<string>(JSON.parse(localStorage.getItem(storageKey) || "[]") as string[]);
        const newLeads = result.bookings.filter((booking) => booking.status === "pending" && !seen.has(booking.id));
        newLeads.forEach((booking) => addNotification({
          title: "New paid consultation lead",
          body: `${booking.clientName} requested ${booking.type} for ${booking.dateLabel} at ${booking.time}.`,
          kind: "booking",
          href: "/designer/leads",
        }));
        result.bookings.filter((booking) => booking.status === "pending").forEach((booking) => seen.add(booking.id));
        localStorage.setItem(storageKey, JSON.stringify([...seen].slice(-200)));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Leads could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  React.useEffect(() => {
    const kickoff = window.setTimeout(() => { void load(true); }, 0);
    const timer = window.setInterval(() => { void load(true); }, 30_000);
    return () => { window.clearTimeout(kickoff); window.clearInterval(timer); };
  }, [load]);

  async function update(action: "accept" | "decline", booking: ConsultationBooking) {
    if (action === "decline" && !window.confirm("Decline this paid lead? The booking will be marked for a manual Paystack refund.")) return;
    setUpdating(booking.id);
    setError("");
    try {
      const result = await transitionConsultation(action, booking.id);
      setBookings((items) => items.map((item) => item.id === booking.id ? result.booking : item));
      addNotification({
        title: action === "accept" ? "Consultation accepted" : "Lead declined — refund required",
        body: action === "accept"
          ? `${booking.clientName}'s ${booking.dateLabel} session is now in your schedule.`
          : `Process a manual Paystack refund for ${booking.clientName} (${booking.paystackRef}).`,
        kind: action === "accept" ? "booking" : "payment",
        href: action === "accept" ? "/designer/consultations" : "/designer/leads",
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The booking could not be updated.");
    } finally {
      setUpdating(null);
    }
  }

  const pending = bookings.filter((booking) => booking.status === "pending");
  const upcoming = bookings.filter((booking) =>
    booking.status === "confirmed" && new Date(`${booking.dateIso}T${booking.time}:00`).getTime() >= now - 3_600_000,
  );
  const history = bookings.filter((booking) => !pending.includes(booking) && !upcoming.includes(booking));

  if (loading) {
    return <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading consultation records…</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm">
          <span className="flex gap-2"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" /> {error}</span>
          <Button size="sm" variant="outline" onClick={() => { setLoading(true); void load(); }}><RefreshCw className="size-4" /> Retry</Button>
        </div>
      )}

      {!scheduleOnly && (
        <BookingSection
          title="Paid leads awaiting response"
          empty="No pending paid leads. New requests will appear here automatically."
          bookings={pending}
          actions={(booking) => (
            <>
              <Button size="sm" onClick={() => update("accept", booking)} disabled={updating === booking.id}>
                {updating === booking.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => update("decline", booking)} disabled={updating === booking.id}>
                <X className="size-4" /> Decline
              </Button>
            </>
          )}
        />
      )}

      <BookingSection
        title="Upcoming schedule"
        empty="Accepted consultations will appear here."
        bookings={upcoming}
      />

      {!scheduleOnly && history.length > 0 && (
        <BookingSection title="Recent history" empty="" bookings={history.slice(0, 12)} />
      )}

      {consultantName && (
        <p className="text-xs text-muted-foreground">
          Live consultation records for {consultantName}.
        </p>
      )}
    </div>
  );
}

function BookingSection({
  title,
  empty,
  bookings,
  actions,
}: {
  title: string;
  empty: string;
  bookings: ConsultationBooking[];
  actions?: (booking: ConsultationBooking) => React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><UserRound className="size-5" /></span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{booking.clientName}</p>
                        <Badge variant={statusVariant[booking.status]} className="capitalize">{booking.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.clientEmail}</p>
                      <p className="mt-2 font-medium">{booking.type}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarClock className="size-4" /> {booking.dateLabel} at {booking.time} · {booking.mode}</p>
                      {booking.notes && <p className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">{booking.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold">{formatCurrency(booking.amount)}</p>
                    <p className="text-xs text-muted-foreground">Paystack {booking.paystackRef}</p>
                    {booking.status === "declined" && <p className="mt-2 text-xs font-medium text-destructive">Manual refund required</p>}
                    {actions && <div className="mt-4 flex justify-end gap-2">{actions(booking)}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
