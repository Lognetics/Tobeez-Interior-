"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getPublicAvailability } from "@/lib/consultations/client";
import { CONSULTATION_TIMES } from "@/lib/consultations/types";
import { cn } from "@/lib/utils";

export type DayStatus = "available" | "busy" | "booked" | "unavailable" | "past";

const STATUS_STYLES: Record<DayStatus, string> = {
  available: "bg-success/15 text-foreground hover:bg-success/25",
  busy: "bg-warning/15 text-foreground hover:bg-warning/25",
  booked: "bg-destructive/10 text-muted-foreground cursor-not-allowed line-through",
  unavailable: "bg-muted text-muted-foreground/50 cursor-not-allowed",
  past: "text-muted-foreground/30 cursor-not-allowed",
};

function fallbackStatus(date: Date, today: Date, seed: number): DayStatus {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (day < current) return "past";
  const dow = date.getDay();
  const n = (date.getDate() * 7 + seed * 13 + dow * 3) % 10;
  if (dow === 0) return "unavailable";
  if (n === 0 || n === 5) return "booked";
  if (n === 1 || dow === 6) return "busy";
  return "available";
}

function localIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function AvailabilityCalendar({
  consultantId,
  seed,
  selected,
  onSelect,
  onSourceChange,
}: {
  consultantId: string;
  seed: number;
  selected: string | null;
  onSelect: (iso: string, label: string, slots: string[]) => void;
  onSourceChange?: (source: "database" | "fallback") => void;
}) {
  const today = React.useMemo(() => new Date(), []);
  const [view, setView] = React.useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [source, setSource] = React.useState<"database" | "fallback">("fallback");
  const [availability, setAvailability] = React.useState<Record<string, string[]>>({});
  const [loading, setLoading] = React.useState(true);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const canGoBack = view > new Date(today.getFullYear(), today.getMonth(), 1);

  React.useEffect(() => {
    let active = true;
    getPublicAvailability(
      consultantId,
      localIso(new Date(year, month, 1)),
      localIso(new Date(year, month + 1, 0)),
    )
      .then((result) => {
        if (!active) return;
        setSource(result.source);
        onSourceChange?.(result.source);
        setAvailability(Object.fromEntries(
          result.availability
            .filter((entry) => entry.dateIso)
            .map((entry) => [entry.dateIso as string, entry.slots]),
        ));
      })
      .catch(() => {
        if (active) {
          setSource("fallback");
          onSourceChange?.("fallback");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [consultantId, month, onSourceChange, year]);

  function dayState(date: Date) {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (day < current) return { status: "past" as const, slots: [] as string[] };
    if (source === "fallback") {
      const status = fallbackStatus(date, today, seed);
      return {
        status,
        slots: status === "available" || status === "busy" ? [...CONSULTATION_TIMES] : [],
      };
    }
    const slots = availability[localIso(date)] ?? [];
    return {
      status: slots.length === 0 ? "unavailable" as const : slots.length <= 2 ? "busy" as const : "available" as const,
      slots,
    };
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => { if (canGoBack) { setLoading(true); setView(new Date(year, month - 1, 1)); } }}
          disabled={!canGoBack}
          className="grid size-8 place-items-center rounded-lg hover:bg-muted disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="font-display text-sm font-semibold">{monthLabel}</p>
          <p className="text-[10px] text-muted-foreground">
            {loading ? <span className="inline-flex items-center gap-1"><Loader2 className="size-2.5 animate-spin" /> Loading</span> : source === "database" ? "Live consultant schedule" : "Preview schedule"}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); setView(new Date(year, month + 1, 1)); }}
          className="grid size-8 place-items-center rounded-lg hover:bg-muted"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, index) => <span key={`empty-${index}`} />)}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const { status, slots } = dayState(date);
          const iso = localIso(date);
          const isSelected = selected === iso;
          const disabled = loading || slots.length === 0 || status === "past";
          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelect(
                iso,
                date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }),
                slots,
              )}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-colors",
                STATUS_STYLES[status],
                isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-card",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <Legend className="bg-success/40" label="Available" />
        <Legend className="bg-warning/40" label="Limited" />
        <Legend className="bg-muted-foreground/30" label="Unavailable" />
      </div>
      {source === "fallback" && !loading && (
        <p className="mt-3 text-xs text-muted-foreground">
          Preview availability is shown until the consultation migration and consultant schedule are active. Payment is blocked unless the server confirms a live slot.
        </p>
      )}
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-full", className)} /> {label}
    </span>
  );
}
