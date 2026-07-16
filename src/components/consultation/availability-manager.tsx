"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getManagedAvailability, saveManagedAvailability } from "@/lib/consultations/client";
import { CONSULTATION_TIMES } from "@/lib/consultations/types";
import { cn } from "@/lib/utils";

const DAYS = [
  { weekday: 1, label: "Monday" },
  { weekday: 2, label: "Tuesday" },
  { weekday: 3, label: "Wednesday" },
  { weekday: 4, label: "Thursday" },
  { weekday: 5, label: "Friday" },
  { weekday: 6, label: "Saturday" },
  { weekday: 0, label: "Sunday" },
] as const;

export function AvailabilityManager() {
  const [schedule, setSchedule] = React.useState<Record<number, string[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [databaseReady, setDatabaseReady] = React.useState(false);
  const [message, setMessage] = React.useState<{ tone: "error" | "success"; text: string } | null>(null);

  React.useEffect(() => {
    getManagedAvailability()
      .then((result) => {
        setDatabaseReady(result.source === "database");
        setSchedule(Object.fromEntries(
          result.availability
            .filter((entry) => typeof entry.weekday === "number")
            .map((entry) => [entry.weekday as number, entry.slots]),
        ));
        if (result.source === "fallback") {
          setMessage({ tone: "error", text: "Apply migration 0003 before setting live availability." });
        }
      })
      .catch((error) => setMessage({ tone: "error", text: error instanceof Error ? error.message : "Availability could not be loaded." }))
      .finally(() => setLoading(false));
  }, []);

  function toggle(weekday: number, slot: string) {
    setMessage(null);
    setSchedule((current) => {
      const slots = current[weekday] ?? [];
      return {
        ...current,
        [weekday]: slots.includes(slot) ? slots.filter((item) => item !== slot) : [...slots, slot].sort(),
      };
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      await saveManagedAvailability(DAYS.map(({ weekday }) => ({ weekday, slots: schedule[weekday] ?? [] })));
      setMessage({ tone: "success", text: "Live weekly availability saved." });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Availability could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading availability…</div>;
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={cn("flex items-center gap-2 rounded-xl border p-3 text-sm", message.tone === "success" ? "border-success/30 bg-success/10" : "border-destructive/30 bg-destructive/10")}>
          {message.tone === "success" ? <CheckCircle2 className="size-4 text-success" /> : <AlertCircle className="size-4 text-destructive" />}
          {message.text}
        </div>
      )}
      <p className="text-sm text-muted-foreground">Select the times clients may book each week. Existing pending and confirmed bookings are removed from the public calendar automatically.</p>
      {DAYS.map(({ weekday, label }) => (
        <Card key={weekday}>
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="w-28 shrink-0">
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{(schedule[weekday] ?? []).length} slots</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {CONSULTATION_TIMES.map((slot) => {
                  const active = (schedule[weekday] ?? []).includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!databaseReady}
                      onClick={() => toggle(weekday, slot)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm transition-colors disabled:opacity-50",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button onClick={save} disabled={!databaseReady || saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save availability
        </Button>
      </div>
    </div>
  );
}
