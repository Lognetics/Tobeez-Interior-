"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DayStatus = "available" | "busy" | "booked" | "unavailable" | "past";

const STATUS_STYLES: Record<DayStatus, string> = {
  available: "bg-success/15 text-foreground hover:bg-success/25",
  busy: "bg-warning/15 text-foreground hover:bg-warning/25",
  booked: "bg-destructive/10 text-muted-foreground cursor-not-allowed line-through",
  unavailable: "bg-muted text-muted-foreground/50 cursor-not-allowed",
  past: "text-muted-foreground/30 cursor-not-allowed",
};

/**
 * Deterministic availability so the calendar is stable across renders
 * (no Math.random). Weekends busier, some days fully booked. Keyed off
 * the consultant id + date so different consultants differ.
 */
function statusFor(date: Date, today: Date, seed: number): DayStatus {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (d < t) return "past";
  const dow = date.getDay();
  const n = (date.getDate() * 7 + seed * 13 + dow * 3) % 10;
  if (dow === 0) return "unavailable"; // Sundays off
  if (n === 0 || n === 5) return "booked";
  if (n === 1 || dow === 6) return "busy";
  return "available";
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function AvailabilityCalendar({
  seed,
  selected,
  onSelect,
}: {
  seed: number;
  selected: string | null;
  onSelect: (iso: string, label: string) => void;
}) {
  const today = React.useMemo(() => new Date(), []);
  const [view, setView] = React.useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const canGoBack = view > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => canGoBack && setView(new Date(year, month - 1, 1))}
          disabled={!canGoBack}
          className="grid size-8 place-items-center rounded-lg hover:bg-muted disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-display text-sm font-semibold">{monthLabel}</p>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="grid size-8 place-items-center rounded-lg hover:bg-muted"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const status = statusFor(date, today, seed);
          const iso = date.toISOString().slice(0, 10);
          const isSelected = selected === iso;
          const disabled = status === "booked" || status === "unavailable" || status === "past";
          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() =>
                onSelect(iso, date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }))
              }
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
        <Legend className="bg-warning/40" label="Busy" />
        <Legend className="bg-destructive/40" label="Booked" />
        <Legend className="bg-muted-foreground/30" label="Unavailable" />
      </div>
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
