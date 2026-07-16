"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CalendarClock, Loader2, MessageSquare, Plus, RefreshCw, X } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMyConsultations, transitionConsultation } from "@/lib/consultations/client";
import type { BookingStatus } from "@/lib/consultations/types";
import { useAppData } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

const statusVariant: Record<BookingStatus, "default" | "success" | "muted" | "outline"> = {
  pending: "default",
  confirmed: "success",
  declined: "outline",
  completed: "muted",
  cancelled: "muted",
};

const statusCopy: Record<BookingStatus, string> = {
  pending: "Awaiting consultant response",
  confirmed: "Accepted by your consultant",
  declined: "Declined — manual Paystack refund required",
  completed: "Session completed",
  cancelled: "Cancelled — manual Paystack review required",
};

export default function ConsultationsPage() {
  const bookings = useAppData((state) => state.bookings);
  const setBookings = useAppData((state) => state.setBookings);
  const updateBooking = useAppData((state) => state.updateBooking);
  const addNotification = useAppData((state) => state.addNotification);
  const updateConversationStatus = useAppData((state) => state.updateConversationBookingStatus);
  const [loading, setLoading] = React.useState(true);
  const [fallback, setFallback] = React.useState(false);
  const [error, setError] = React.useState("");
  const [cancelling, setCancelling] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const result = await listMyConsultations();
      setFallback(result.source === "fallback");
      if (result.source === "database") {
        const previous = new Map(useAppData.getState().bookings.map((booking) => [booking.id, booking.status]));
        result.bookings.forEach((booking) => {
          const oldStatus = previous.get(booking.id);
          updateConversationStatus(booking.id, booking.status);
          if (oldStatus && oldStatus !== booking.status) {
            addNotification({
              title: booking.status === "confirmed" ? "Consultation accepted" : booking.status === "declined" ? "Consultation declined" : "Consultation updated",
              body: booking.status === "declined"
                ? `${booking.consultantName} could not accept ${booking.dateLabel}. The paid booking now requires a manual Paystack refund.`
                : `${booking.type} with ${booking.consultantName} is now ${booking.status}.`,
              kind: booking.status === "declined" ? "payment" : "booking",
              href: "/dashboard/consultations",
            });
          }
        });
        setBookings(result.bookings);
      }
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Consultations could not be refreshed.");
    } finally {
      setLoading(false);
    }
  }, [addNotification, setBookings, updateConversationStatus]);

  React.useEffect(() => {
    const kickoff = window.setTimeout(() => { void load(); }, 0);
    const timer = window.setInterval(() => { void load(); }, 30_000);
    return () => { window.clearTimeout(kickoff); window.clearInterval(timer); };
  }, [load]);

  async function cancel(bookingId: string) {
    if (!window.confirm("Cancel this paid consultation? TOBEEZ will need to review the payment manually.")) return;
    setCancelling(bookingId);
    try {
      const result = await transitionConsultation("cancel", bookingId);
      updateBooking(bookingId, result.booking);
      updateConversationStatus(bookingId, "cancelled");
      addNotification({
        title: "Consultation cancelled",
        body: "The booking is cancelled and requires manual Paystack review.",
        kind: "payment",
        href: "/dashboard/consultations",
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The booking could not be cancelled.");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <>
      <DashHeader
        title="Consultations"
        subtitle="Paid requests and live status updates from your consultants."
        action={<Button asChild><Link href="/consultation"><Plus /> Book Consultation</Link></Button>}
      />

      {(fallback || error) && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
          <span className="flex items-center gap-2"><AlertCircle className="size-4 text-warning" /> {error || "The consultation migration is not active yet; showing local legacy records."}</span>
          <Button size="sm" variant="outline" onClick={() => { setLoading(true); void load(); }}><RefreshCw className="size-4" /> Refresh</Button>
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading consultations…</div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="CalendarClock"
          title="No consultations yet"
          description="Book a paid session with Victory or Joy. The consultant will accept or decline it from their portal."
          action={<Button asChild><Link href="/consultation">Book your first session</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><CalendarClock className="size-6" /></span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{booking.type}</p>
                      <Badge variant={statusVariant[booking.status]} className="capitalize">{booking.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.consultantName} · {booking.dateLabel} at {booking.time}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{statusCopy[booking.status]}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-semibold">{formatCurrency(booking.amount)}</span>
                  <Button asChild variant="outline" size="sm"><Link href="/dashboard/messages"><MessageSquare className="size-4" /> Chat</Link></Button>
                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <Button variant="outline" size="sm" onClick={() => cancel(booking.id)} disabled={cancelling === booking.id}>
                      {cancelling === booking.id ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />} Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
