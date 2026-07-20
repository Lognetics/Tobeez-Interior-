"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SelectableCard, Chip } from "./selectable";
import { useEstimator, TOTAL_STEPS } from "@/lib/estimator/store";
import { estimate } from "@/lib/estimator/engine";
import {
  PROPERTY_CATEGORIES, BUILDING_TYPES, PROJECT_STAGES, REGIONS, ROOMS,
  DESIGN_STYLES, MATERIALS, FURNITURE_QUALITY, TIMELINES, SPECIAL_FEATURES,
  OWNERSHIP, PURPOSE, OCCUPANCY, CEILING_HEIGHTS, COLOR_PALETTES, DURABILITY,
  LUXURY_LEVELS, MAINTENANCE, FINANCING,
} from "@/lib/estimator/constants";
import { cn, formatCurrency } from "@/lib/utils";

const STEP_META = [
  { title: "Property Category", subtitle: "What type of property are you furnishing?" },
  { title: "Building Type", subtitle: "Pick the closest match to your building." },
  { title: "Project Stage", subtitle: "What stage is the project at?" },
  { title: "Property Context", subtitle: "A little context helps the AI tailor your plan." },
  { title: "Location", subtitle: "We adjust pricing to your region." },
  { title: "Floor Area", subtitle: "Approximate total area to furnish." },
  { title: "Rooms & Spaces", subtitle: "Select every space that needs furnishing." },
  { title: "Room Details", subtitle: "Fine-tune requirements for your spaces." },
  { title: "Design Style", subtitle: "Choose the aesthetic direction." },
  { title: "Material Preferences", subtitle: "Select the materials you love." },
  { title: "Finish Preferences", subtitle: "Colour, durability and lifestyle needs." },
  { title: "Furniture Quality", subtitle: "How premium should it feel?" },
  { title: "Budget & Timeline", subtitle: "Helps us tailor and phase the plan." },
  { title: "Special Requirements", subtitle: "Add any smart or luxury features." },
  { title: "AI Review", subtitle: "TOBEEZ AI checks your answers before estimating." },
];

export function EstimatorWizard() {
  const router = useRouter();
  const { step, data, setData, toggleInArray, next, prev, goTo, reset } = useEstimator();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const meta = STEP_META[step];
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const canProceed = React.useMemo(() => {
    switch (step) {
      case 0: return !!data.category;
      case 1: return !!data.buildingType;
      case 2: return !!data.stage;
      case 4: return !!data.region;
      case 5: return !!data.floorAreaSqm && data.floorAreaSqm > 0;
      case 6: return (data.rooms?.length ?? 0) > 0;
      case 8: return !!data.style;
      case 9: return (data.materials?.length ?? 0) > 0;
      case 11: return !!data.quality;
      // Budget is required — it anchors the AI to the client's real range.
      case 12: return !!data.budgetMin && !!data.budgetMax && data.budgetMax >= data.budgetMin;
      default: return true;
    }
  }, [step, data]);

  function handleNext() {
    if (step === TOTAL_STEPS - 1) {
      router.push("/estimator/results");
      return;
    }
    next();
  }

  if (!hydrated) {
    return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-muted" />;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Step {step + 1} of {TOTAL_STEPS}</span>
            <button onClick={() => { if (confirm("Reset your estimate?")) reset(); }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="mt-1 text-muted-foreground">{meta.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <StepContent step={step} data={data} setData={setData} toggle={toggleInArray} />
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" onClick={prev} disabled={step === 0}><ArrowLeft /> Back</Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {step === TOTAL_STEPS - 1 ? (<>Generate Estimate <Sparkles /></>) : (<>Continue <ArrowRight /></>)}
          </Button>
        </div>
      </div>

      <aside className="hidden h-fit rounded-3xl border border-border bg-card p-6 shadow-soft lg:block lg:sticky lg:top-24">
        <h3 className="font-display font-semibold">Your selection</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <SummaryRow label="Category" value={PROPERTY_CATEGORIES.find(c => c.id === data.category)?.label} onClick={() => goTo(0)} />
          <SummaryRow label="Building" value={data.buildingType} onClick={() => goTo(1)} />
          <SummaryRow label="Purpose" value={data.purpose} onClick={() => goTo(3)} />
          <SummaryRow label="Region" value={REGIONS.find(r => r.id === data.region)?.label} onClick={() => goTo(4)} />
          <SummaryRow label="Area" value={data.floorAreaSqm ? `${data.floorAreaSqm} sqm` : undefined} onClick={() => goTo(5)} />
          <SummaryRow label="Rooms" value={data.rooms?.length ? `${data.rooms.length} selected` : undefined} onClick={() => goTo(6)} />
          <SummaryRow label="Style" value={DESIGN_STYLES.find(s => s.id === data.style)?.label} onClick={() => goTo(8)} />
          <SummaryRow label="Luxury" value={data.luxuryLevel} onClick={() => goTo(10)} />
          <SummaryRow label="Quality" value={FURNITURE_QUALITY.find(q => q.id === data.quality)?.label} onClick={() => goTo(11)} />
          {(data.budgetMax ?? 0) > 0 && <SummaryRow label="Budget" value={formatCurrency(data.budgetMax!)} onClick={() => goTo(12)} />}
        </dl>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, onClick }: { label: string; value?: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>
        {value ? <button onClick={onClick} className="font-medium text-foreground hover:text-primary hover:underline">{value}</button> : <span className="text-muted-foreground/50">-</span>}
      </dd>
    </div>
  );
}

type StepProps = {
  step: number;
  data: ReturnType<typeof useEstimator.getState>["data"];
  setData: (patch: Partial<StepProps["data"]>) => void;
  toggle: (key: "rooms" | "materials" | "features" | "priorityRooms", value: string) => void;
};

/** Two-option boolean chooser. */
function BoolChips({ value, onChange, yes = "Yes", no = "No" }: { value?: boolean; onChange: (v: boolean) => void; yes?: string; no?: string }) {
  return (
    <div className="flex gap-2">
      <Chip selected={value === true} onClick={() => onChange(true)}>{yes}</Chip>
      <Chip selected={value === false} onClick={() => onChange(false)}>{no}</Chip>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StepContent({ step, data, setData, toggle }: StepProps) {
  switch (step) {
    case 0:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {PROPERTY_CATEGORIES.map((c) => {
            const Icon = (Icons[c.icon as keyof typeof Icons] ?? Icons.Home) as Icons.LucideIcon;
            return <SelectableCard key={c.id} selected={data.category === c.id} onClick={() => setData({ category: c.id })} title={c.label} subtitle={c.blurb} icon={<Icon className="size-5" />} />;
          })}
        </div>
      );
    case 1:
      return <div className="flex flex-wrap gap-2.5">{BUILDING_TYPES.map((b) => <Chip key={b} selected={data.buildingType === b} onClick={() => setData({ buildingType: b })}>{b}</Chip>)}</div>;
    case 2:
      return <div className="grid gap-3 sm:grid-cols-2">{PROJECT_STAGES.map((s) => <SelectableCard key={s.id} selected={data.stage === s.id} onClick={() => setData({ stage: s.id })} title={s.label} />)}</div>;
    case 3: // Property Context
      return (
        <div className="space-y-6">
          <Field label="Do you own or rent this property?"><div className="flex flex-wrap gap-2">{OWNERSHIP.map((o) => <Chip key={o} selected={data.ownership === o} onClick={() => setData({ ownership: o })}>{o}</Chip>)}</div></Field>
          <Field label="What's the purpose?"><div className="flex flex-wrap gap-2">{PURPOSE.map((o) => <Chip key={o} selected={data.purpose === o} onClick={() => setData({ purpose: o })}>{o}</Chip>)}</div></Field>
          <Field label="When do you need it ready?"><div className="flex flex-wrap gap-2">{OCCUPANCY.map((o) => <Chip key={o} selected={data.occupancy === o} onClick={() => setData({ occupancy: o })}>{o}</Chip>)}</div></Field>
          <Field label="Reuse any existing furniture?"><BoolChips value={data.reuseExisting} onChange={(v) => setData({ reuseExisting: v })} yes="Yes, reuse some" no="No, all new" /></Field>
        </div>
      );
    case 4:
      return <div className="grid gap-3 sm:grid-cols-2">{REGIONS.map((r) => <SelectableCard key={r.id} selected={data.region === r.id} onClick={() => setData({ region: r.id })} title={r.label} icon={<Icons.MapPin className="size-5" />} />)}</div>;
    case 5:
      return (
        <div className="space-y-5">
          <Field label="Total floor area (square metres)">
            <Input type="number" min={10} placeholder="e.g. 120" value={data.floorAreaSqm ?? ""} onChange={(e) => setData({ floorAreaSqm: e.target.value ? Number(e.target.value) : undefined })} />
          </Field>
          <div className="flex flex-wrap gap-2">{[45, 80, 120, 200, 350, 600].map((v) => <Chip key={v} selected={data.floorAreaSqm === v} onClick={() => setData({ floorAreaSqm: v })}>{v} sqm</Chip>)}</div>
        </div>
      );
    case 6:
      return <div className="flex flex-wrap gap-2.5">{ROOMS.map((r) => <Chip key={r} selected={data.rooms?.includes(r) ?? false} onClick={() => toggle("rooms", r)}>{r}</Chip>)}</div>;
    case 7: { // Room Details
      const selectedRooms = data.rooms ?? [];
      return (
        <div className="space-y-6">
          <Field label="Ceiling height"><div className="flex flex-wrap gap-2">{CEILING_HEIGHTS.map((c) => <Chip key={c} selected={data.ceilingHeight === c} onClick={() => setData({ ceilingHeight: c })}>{c}</Chip>)}</div></Field>
          {selectedRooms.length > 0 && (
            <Field label="Which rooms are the priority? (optional)">
              <div className="flex flex-wrap gap-2">{selectedRooms.map((r) => <Chip key={r} selected={data.priorityRooms?.includes(r) ?? false} onClick={() => toggle("priorityRooms", r)}>{r}</Chip>)}</div>
            </Field>
          )}
          <Field label="Smart-home integration?"><BoolChips value={data.smartRooms} onChange={(v) => setData({ smartRooms: v })} /></Field>
          <Field label="Extra storage & wardrobes needed?"><BoolChips value={data.storageNeeds} onChange={(v) => setData({ storageNeeds: v })} /></Field>
          <Field label="Any accessibility requirements?"><BoolChips value={data.accessibility} onChange={(v) => setData({ accessibility: v })} /></Field>
        </div>
      );
    }
    case 8:
      return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{DESIGN_STYLES.map((s) => <SelectableCard key={s.id} selected={data.style === s.id} onClick={() => setData({ style: s.id })} title={s.label} />)}</div>;
    case 9:
      return <div className="flex flex-wrap gap-2.5">{MATERIALS.map((m) => <Chip key={m} selected={data.materials?.includes(m) ?? false} onClick={() => toggle("materials", m)}>{m}</Chip>)}</div>;
    case 10: // Finish Preferences
      return (
        <div className="space-y-6">
          <Field label="Colour palette">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COLOR_PALETTES.map((p) => (
                <button key={p.id} onClick={() => setData({ colorPalette: p.id })}
                  className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left transition-all", data.colorPalette === p.id ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40")}>
                  <span className="flex gap-1">{p.colors.map((c) => <span key={c} className="size-5 rounded-full border border-border" style={{ background: c }} />)}</span>
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Material durability"><div className="flex flex-wrap gap-2">{DURABILITY.map((d) => <Chip key={d} selected={data.durability === d} onClick={() => setData({ durability: d })}>{d}</Chip>)}</div></Field>
          <Field label="Luxury level"><div className="flex flex-wrap gap-2">{LUXURY_LEVELS.map((l) => <Chip key={l} selected={data.luxuryLevel === l} onClick={() => setData({ luxuryLevel: l })}>{l}</Chip>)}</div></Field>
          <Field label="Maintenance expectation"><div className="flex flex-wrap gap-2">{MAINTENANCE.map((m) => <Chip key={m} selected={data.maintenance === m} onClick={() => setData({ maintenance: m })}>{m}</Chip>)}</div></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Prefer imported or local?"><BoolChips value={data.importedPreferred} onChange={(v) => setData({ importedPreferred: v })} yes="Imported" no="Local" /></Field>
            <Field label="Sustainability a priority?"><BoolChips value={data.sustainability} onChange={(v) => setData({ sustainability: v })} /></Field>
            <Field label="Child-friendly design?"><BoolChips value={data.childFriendly} onChange={(v) => setData({ childFriendly: v })} /></Field>
            <Field label="Pet-friendly design?"><BoolChips value={data.petFriendly} onChange={(v) => setData({ petFriendly: v })} /></Field>
          </div>
        </div>
      );
    case 11:
      return <div className="grid gap-3 sm:grid-cols-2">{FURNITURE_QUALITY.map((q) => <SelectableCard key={q.id} selected={data.quality === q.id} onClick={() => setData({ quality: q.id })} title={q.label} subtitle={`×${q.multiplier} cost factor`} />)}</div>;
    case 12: // Budget & Timeline
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minimum budget (₦)"><Input type="number" placeholder="e.g. 5,000,000" value={data.budgetMin ?? ""} onChange={(e) => setData({ budgetMin: e.target.value ? Number(e.target.value) : undefined })} /></Field>
            <Field label="Maximum budget (₦)"><Input type="number" placeholder="e.g. 12,000,000" value={data.budgetMax ?? ""} onChange={(e) => setData({ budgetMax: e.target.value ? Number(e.target.value) : undefined })} /></Field>
          </div>
          <Field label="How will you fund it?"><div className="flex flex-wrap gap-2">{FINANCING.map((f) => <Chip key={f} selected={data.financing === f} onClick={() => setData({ financing: f })}>{f}</Chip>)}</div></Field>
          <Field label="Phase the project over time?"><BoolChips value={data.phased} onChange={(v) => setData({ phased: v })} yes="Yes, phase it" no="No, all at once" /></Field>
          <Field label="Preferred timeline"><div className="flex flex-wrap gap-2">{TIMELINES.map((t) => <Chip key={t} selected={data.timeline === t} onClick={() => setData({ timeline: t })}>{t}</Chip>)}</div></Field>
        </div>
      );
    case 13:
      return <div className="grid gap-3 sm:grid-cols-2">{SPECIAL_FEATURES.map((f) => <SelectableCard key={f.id} selected={data.features?.includes(f.id) ?? false} onClick={() => toggle("features", f.id)} title={f.label} subtitle={`+ ${formatCurrency(f.costMin)} – ${formatCurrency(f.costMax)}`} icon={<Icons.Zap className="size-5" />} />)}</div>;
    case 14:
      return <AIReview data={data} />;
    default:
      return null;
  }
}

/**
 * AI recommendation layer: flags conflicts and suggests optimizations.
 * IMPORTANT: does NOT reveal any cost figures, the estimate stays hidden until
 * after checkout on the results screen.
 */
function AIReview({ data }: { data: StepProps["data"] }) {
  // Computed only for internal conflict logic (budget-vs-scope), never displayed.
  const result = React.useMemo(() => estimate(data), [data]);

  const flags: { kind: "warning" | "tip"; text: string }[] = [];

  if (data.budgetMax && data.budgetMax > 0 && data.budgetMax < result.min) {
    flags.push({ kind: "warning", text: "Your maximum budget may be tight for a project of this scope. Consider phasing the work or a more economical furniture tier." });
  }
  if ((data.style === "ultra-luxury" || data.luxuryLevel === "Ultra luxury") && (data.quality === "economy" || data.quality === "standard")) {
    flags.push({ kind: "warning", text: "An ultra-luxury look with an economy/standard furniture tier may not fully achieve the intended finish. Consider Premium or above for key rooms." });
  }
  if (!data.priorityRooms?.length && data.phased) {
    flags.push({ kind: "tip", text: "You chose to phase the project, select your priority rooms so we can sequence spend where it matters most." });
  }
  if (!data.reuseExisting) {
    flags.push({ kind: "tip", text: "Reusing a few existing pieces could reduce your budget without compromising the design." });
  }
  if (data.importedPreferred) {
    flags.push({ kind: "tip", text: "Imported materials cost more, comparable local alternatives can protect the look while lowering cost." });
  }
  if ((data.rooms?.length ?? 0) > 8 && data.quality === "ultra") {
    flags.push({ kind: "tip", text: "With many rooms at ultra-luxury tier, a mixed strategy (luxury in living/master, premium elsewhere) balances impact and budget." });
  }
  if (flags.length === 0) {
    flags.push({ kind: "tip", text: "Your selections look well-balanced. No conflicts detected, you're ready for a precise estimate." });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-primary" /> TOBEEZ AI reviewed your answers</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything checks out. Here are a few notes to get the best value. Continue to generate your full
          itemised estimate.
        </p>
      </div>

      <div className="space-y-3">
        {flags.map((f, i) => (
          <div key={i} className={cn("flex gap-3 rounded-2xl border p-4", f.kind === "warning" ? "border-warning/40 bg-warning/5" : "border-border bg-card")}>
            <span className={cn("mt-0.5 shrink-0", f.kind === "warning" ? "text-warning" : "text-primary")}>
              {f.kind === "warning" ? <AlertTriangle className="size-5" /> : <Lightbulb className="size-5" />}
            </span>
            <p className="text-sm">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
