"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DESIGNERS, CONSULTATION_MODES } from "@/lib/data/designers";
import { cn, formatCurrency } from "@/lib/utils";

const TIMES = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

function nextDays(count: number) {
  const base = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i + 1);
    return d;
  });
}

export function ConsultationBooking() {
  const [mode, setMode] = React.useState<string>("virtual");
  const [designer, setDesigner] = React.useState<string>(DESIGNERS[0].id);
  const [day, setDay] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const [done, setDone] = React.useState(false);

  const days = React.useMemo(() => nextDays(6), []);
  const selectedDesigner = DESIGNERS.find((d) => d.id === designer)!;
  const canBook = mode && designer && day && time;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center shadow-soft"
      >
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Consultation booked!</h2>
        <p className="mt-2 text-muted-foreground">
          Your {CONSULTATION_MODES.find((m) => m.id === mode)?.label} with{" "}
          <span className="font-medium text-foreground">{selectedDesigner.name}</span> is confirmed for{" "}
          {day} at {time}. A calendar invite and meeting link have been sent to your email.
        </p>
        <Button className="mt-6" onClick={() => setDone(false)}>Book another</Button>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Mode */}
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">1 · Session type</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CONSULTATION_MODES.map((m) => {
              const Icon = (Icons[m.icon as keyof typeof Icons] ?? Icons.Video) as Icons.LucideIcon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "rounded-2xl border p-5 text-left transition-all",
                    mode === m.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <Icon className={cn("size-6", mode === m.id ? "text-primary" : "text-muted-foreground")} />
                  <p className="mt-3 font-medium">{m.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.blurb}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Designer */}
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">2 · Choose your designer</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {DESIGNERS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDesigner(d.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                  designer === d.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br font-semibold text-white", d.gradient)}>
                  {d.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.name}</span>
                  <span className="block text-xs text-muted-foreground">{d.title}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs">
                    <Star className="size-3 fill-primary text-primary" /> {d.rating} · {d.projects} projects
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Date & time */}
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">3 · Pick a date & time</h2>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => {
              const label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
              return (
                <button
                  key={label}
                  onClick={() => setDay(label)}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm transition-all",
                    day === label ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {day && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 flex flex-wrap gap-2">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm transition-all",
                      time === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Details */}
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">4 · Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" placeholder="Jane Doe" /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@email.com" /></div>
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit lg:sticky lg:top-24">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-display font-semibold">Booking summary</h3>
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <span className={cn("grid size-11 place-items-center rounded-xl bg-gradient-to-br font-semibold text-white", selectedDesigner.gradient)}>
                {selectedDesigner.initials}
              </span>
              <div>
                <p className="text-sm font-medium">{selectedDesigner.name}</p>
                <p className="text-xs text-muted-foreground">{selectedDesigner.title}</p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Session" value={CONSULTATION_MODES.find((m) => m.id === mode)?.label} />
              <Row label="Date" value={day || "-"} />
              <Row label="Time" value={time || "-"} />
            </dl>
            <div className="flex flex-wrap gap-1.5">
              {selectedDesigner.specialties.map((s) => <Badge key={s} variant="muted">{s}</Badge>)}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Session fee</span>
              <span className="font-display text-lg font-semibold">{formatCurrency(selectedDesigner.rate)}</span>
            </div>
            <Button className="w-full" disabled={!canBook} onClick={() => setDone(true)}>
              {canBook ? "Confirm & pay" : "Complete your selection"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Payment is stubbed in this demo build.</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
