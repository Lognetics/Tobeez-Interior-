"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, ArrowLeft, ArrowRight, Award, BadgeCheck, CheckCircle2, Globe,
  MessageSquare, Search, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvailabilityCalendar } from "./availability-calendar";
import { DESIGNERS, CONSULTATION_MODES, CONSULTATION_TYPES, CONSULTATION_PRICING } from "@/lib/data/designers";
import { ConsultationApiError, createConsultation } from "@/lib/consultations/client";
import { useAppData } from "@/lib/store/app-data";
import { useSession } from "@/lib/session";
import { payWithPaystack } from "@/lib/paystack";
import { cn, formatCurrency } from "@/lib/utils";

const STEPS = ["Type", "Consultant", "Schedule", "Payment"] as const;

export function ConsultationBooking() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState("");
  const [typeQuery, setTypeQuery] = React.useState("");
  const [mode, setMode] = React.useState("virtual");
  const [consultantId, setConsultantId] = React.useState<string | null>(null);
  const [dateIso, setDateIso] = React.useState<string | null>(null);
  const [dateLabel, setDateLabel] = React.useState("");
  const [time, setTime] = React.useState("");
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([]);
  const [availabilitySource, setAvailabilitySource] = React.useState<"database" | "fallback">("fallback");
  const [clientName, setClientName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const [error, setError] = React.useState("");

  const upsertBooking = useAppData((s) => s.upsertBooking);
  const addNotification = useAppData((s) => s.addNotification);
  const addConversation = useAppData((s) => s.addConversation);
  const addInvoice = useAppData((s) => s.addInvoice);
  const user = useSession((s) => s.user);
  const authReady = useSession((s) => s.authReady);
  const userEmail = user?.email ?? "";

  const consultant = DESIGNERS.find((d) => d.id === consultantId) ?? null;
  const { oldPrice, currentPrice, currency, discountLabel, offerLabel } = CONSULTATION_PRICING;
  // In-person sessions carry a site-visit premium; virtual/phone use the promo price.
  const sessionPrice = CONSULTATION_MODES.find((m) => m.id === mode)?.price ?? currentPrice;

  const filteredTypes = CONSULTATION_TYPES.filter((t) => t.toLowerCase().includes(typeQuery.toLowerCase()));

  const canContinue =
    (step === 0 && !!type) ||
    (step === 1 && !!consultantId) ||
    (step === 2 && !!dateIso && !!time) ||
    step === 3;

  function confirmBooking(booking: Awaited<ReturnType<typeof createConsultation>>["booking"]) {
    if (!consultant || !dateIso) return;
    upsertBooking(booking);
    addConversation({
      bookingId: booking.id, consultantId: consultant.id, consultantName: consultant.name,
      subject: type, unlockDateIso: dateIso, unlockAtIso: `${dateIso}T${time}:00`, bookingStatus: "pending",
    });
    addInvoice({ kind: "consultation", description: `${type} · ${consultant.name}`, amount: sessionPrice, ref: booking.id });
    addNotification({
      title: "Consultation request sent", kind: "booking", href: "/dashboard/consultations",
      body: `Your paid ${type} request for ${dateLabel} at ${time} is awaiting ${consultant.name}'s response.`,
    });
    addNotification({
      title: "AI assistant is ready", kind: "ai", href: "/dashboard/messages",
      body: `Chat with TOBEEZ AI now. ${consultant.name.split(" ")[0]} unlocks at ${time} on ${dateLabel} once the booking is accepted.`,
    });
    setDone(true);
  }

  async function handlePay() {
    if (!consultant || !dateIso) return;
    setError("");
    if (!user) {
      router.push("/login?next=%2Fconsultation");
      return;
    }
    const resolvedClientName = clientName.trim() || user.name.trim();
    if (resolvedClientName.length < 2) {
      setError("Enter your full name before continuing.");
      return;
    }
    if (availabilitySource !== "database") {
      setError("Live consultant availability is not active yet, so payment has not been opened.");
      return;
    }
    setPaying(true);
    await payWithPaystack({
      email: userEmail,
      amount: sessionPrice,
      metadata: {
        purpose: "consultation", type, consultantId: consultant.id,
        consultant: consultant.name, mode, dateIso, time,
      },
      onSuccess: async (reference) => {
        try {
          const result = await createConsultation({
            reference, consultantId: consultant.id, type, mode, dateIso, time,
            clientName: resolvedClientName, notes: notes.trim(),
          });
          confirmBooking(result.booking);
        } catch (requestError) {
          setError(requestError instanceof ConsultationApiError
            ? requestError.message
            : "Payment completed, but the booking could not be saved. Keep your Paystack reference and contact TOBEEZ.");
        } finally {
          setPaying(false);
        }
      },
      onCancel: () => setPaying(false),
      onError: (message) => { setError(message); setPaying(false); },
    });
  }

  if (done && consultant) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Consultation request sent!</h2>
        <p className="mt-2 text-muted-foreground">
          Your <b className="text-foreground">{type}</b> with{" "}
          <b className="text-foreground">{consultant.name}</b> is requested for {dateLabel} at {time}.
          You will see the response in your dashboard.
        </p>
        <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-left text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="size-4 text-primary" />
            Chat with <b className="text-foreground">TOBEEZ AI</b> right away. Consultant chat unlocks
            at the scheduled time after the request is accepted.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1"><Link href="/dashboard/messages">Open Messages</Link></Button>
          <Button asChild variant="outline" className="flex-1"><Link href="/dashboard/consultations">View Booking</Link></Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        {/* Stepper */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < step && setStep(i)}
                className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}
              >
                <span className={cn("grid size-5 place-items-center rounded-full text-xs",
                  i <= step ? "bg-white/20" : "bg-background")}>
                  {i < step ? <Icons.Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Choose your consultation type</h2>
                <p className="mb-4 text-sm text-muted-foreground">Pick the focus that best matches your project.</p>
                <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={typeQuery} onChange={(e) => setTypeQuery(e.target.value)} placeholder="Search 30+ consultation types…" className="pl-10" />
                </div>
                <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {filteredTypes.map((t) => (
                    <button key={t} onClick={() => setType(t)}
                      className={cn("flex items-center justify-between rounded-xl border p-3 text-left text-sm transition-all",
                        type === t ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40")}>
                      <span>{t}</span>
                      {type === t && <Icons.Check className="size-4 shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 1 && (
              <section>
                <h2 className="font-display text-lg font-semibold">Choose your consultant</h2>
                <p className="mb-4 text-sm text-muted-foreground">Choose Victory or Joy for your session.</p>
                <div className="space-y-3">
                  {DESIGNERS.map((d) => (
                    <button key={d.id} onClick={() => setConsultantId(d.id)}
                      className={cn("flex w-full gap-4 rounded-2xl border p-4 text-left transition-all",
                        consultantId === d.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40")}>
                      <div className="relative shrink-0">
                        {d.photo ? (
                          <span className="relative block size-16 overflow-hidden rounded-2xl">
                            <Image src={d.photo} alt={d.name} fill sizes="64px" className="object-cover" />
                          </span>
                        ) : (
                          <span className={cn("grid size-16 place-items-center rounded-2xl bg-gradient-to-br font-semibold text-white", d.gradient)}>{d.initials}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{d.name}</p>
                          <BadgeCheck className="size-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">{d.title}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{d.bio}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Award className="size-3" />{d.experienceYears} yrs</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {consultant && <ConsultantProfile consultant={consultant} />}
              </section>
            )}

            {step === 2 && consultant && (
              <section className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Session format</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {CONSULTATION_MODES.map((m) => {
                      const Icon = (Icons[m.icon as keyof typeof Icons] ?? Icons.Video) as Icons.LucideIcon;
                      return (
                        <button key={m.id} onClick={() => setMode(m.id)}
                          className={cn("rounded-2xl border p-4 text-left transition-all", mode === m.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40")}>
                          <Icon className={cn("size-5", mode === m.id ? "text-primary" : "text-muted-foreground")} />
                          <p className="mt-2 text-sm font-medium">{m.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{formatCurrency(m.price, currency)}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <h2 className="mb-3 font-display text-lg font-semibold">Pick a date</h2>
                    <AvailabilityCalendar key={consultant.id} consultantId={consultant.id} seed={Number(consultant.id.replace(/\D/g, "")) || 1} selected={dateIso}
                      onSourceChange={setAvailabilitySource}
                      onSelect={(iso, label, slots) => { setDateIso(iso); setDateLabel(label); setAvailableTimes(slots); setTime(""); }} />
                  </div>
                  <div>
                    <h2 className="mb-3 font-display text-lg font-semibold">Pick a time</h2>
                    {dateIso ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimes.map((t) => (
                          <button key={t} onClick={() => setTime(t)}
                            className={cn("rounded-xl border px-4 py-3 text-sm transition-all", time === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40")}>{t}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Select an available date first.</p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">Times shown in your local timezone.</p>
                  </div>
                </div>
              </section>
            )}

            {step === 3 && consultant && (
              <section>
                <h2 className="font-display text-lg font-semibold">Complete your booking</h2>
                <p className="mb-4 text-sm text-muted-foreground">Secure checkout powered by Paystack.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" value={clientName || user?.name || ""} onChange={(event) => setClientName(event.target.value)} placeholder="Jane Doe" /></div>
                  <div className="space-y-2"><Label htmlFor="email">Account email</Label><Input id="email" type="email" value={userEmail} placeholder="Sign in to continue" disabled /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="notes">Anything we should know? (optional)</Label><Input id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Share your goals, style or budget" /></div>
                </div>
                {!user && authReady && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p><button type="button" className="font-medium text-primary hover:underline" onClick={() => router.push("/login?next=%2Fconsultation")}>Sign in</button> before payment so the server can attach this booking to your account.</p>
                  </div>
                )}
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          {error && <p role="alert" className="w-full text-sm text-destructive">{error}</p>}
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft /> Back</Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>Continue <ArrowRight /></Button>
          ) : (
            <Button onClick={handlePay} disabled={paying || !authReady}>
              {paying ? <Icons.Loader2 className="animate-spin" /> : null}
              {paying ? "Processing…" : `Pay ${formatCurrency(sessionPrice, currency)} & confirm`}
            </Button>
          )}
        </div>
      </div>

      {/* Pricing / summary sidebar */}
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <Card className="overflow-hidden">
          <div className="bg-primary p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <Badge className="border-white/20 bg-white/15 text-primary-foreground">{offerLabel}</Badge>
              <Badge className="border-white/20 bg-white/15 text-primary-foreground">{discountLabel}</Badge>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-3xl font-bold">{formatCurrency(sessionPrice, currency)}</span>
              <span className="mb-1 text-primary-foreground/70 line-through">{formatCurrency(oldPrice, currency)}</span>
            </div>
            <p className="mt-1 text-sm text-primary-foreground/80">per consultation session</p>
          </div>
          <CardContent className="space-y-3 p-5 text-sm">
            <SummaryRow label="Type" value={type} />
            <SummaryRow label="Consultant" value={consultant?.name} />
            <SummaryRow label="Format" value={CONSULTATION_MODES.find((m) => m.id === mode)?.label} />
            <SummaryRow label="Date" value={dateLabel} />
            <SummaryRow label="Time" value={time} />
            <div className="space-y-2 border-t border-border pt-3">
              {["Live expert session", "Tailored design plan", "Moodboard review", "Chat access + AI assistant"].map((f) => (
                <p key={f} className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="size-4 text-success" /> {f}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "Not set"}</span>
    </div>
  );
}

function ConsultantProfile({ consultant }: { consultant: (typeof DESIGNERS)[number] }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      className="mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <p className="text-sm text-foreground">{consultant.bio}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ProfileItem icon={<Globe className="size-4" />} label="Languages" value={consultant.languages.join(", ")} />
        <ProfileItem icon={<Award className="size-4" />} label="Certifications" value={consultant.certifications.join(", ")} />
        <ProfileItem icon={<Star className="size-4" />} label="Specialties" value={consultant.specialties.join(", ")} />
      </div>
    </motion.div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
