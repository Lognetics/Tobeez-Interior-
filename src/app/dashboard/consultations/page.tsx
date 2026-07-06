"use client";

import Link from "next/link";
import { CalendarClock, MessageSquare, Plus, Video } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

export default function ConsultationsPage() {
  const bookings = useAppData((s) => s.bookings);

  return (
    <>
      <DashHeader
        title="Consultations"
        subtitle="Your booked sessions with interior experts."
        action={<Button asChild><Link href="/consultation"><Plus /> Book Consultation</Link></Button>}
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon="CalendarClock"
          title="No consultations yet"
          description="Book a session with a vetted interior expert. You'll be able to chat with AI right away and your consultant joins on the date."
          action={<Button asChild><Link href="/consultation">Book your first session</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <CalendarClock className="size-6" />
                  </span>
                  <div>
                    <p className="font-medium">{b.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.consultantName} · {b.dateLabel} at {b.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={b.status === "completed" ? "success" : "default"} className="capitalize">{b.status}</Badge>
                  <span className="font-display font-semibold">{formatCurrency(b.amount)}</span>
                  <Button asChild variant="outline" size="sm"><Link href="/dashboard/messages"><MessageSquare className="size-4" /> Chat</Link></Button>
                  <Button size="sm" className="hidden sm:inline-flex"><Video className="size-4" /> Join</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
