"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SelectableCard, Chip } from "./selectable";
import { useEstimator, TOTAL_STEPS } from "@/lib/estimator/store";
import {
  PROPERTY_CATEGORIES, BUILDING_TYPES, PROJECT_STAGES, REGIONS, ROOMS,
  DESIGN_STYLES, MATERIALS, FURNITURE_QUALITY, TIMELINES, SPECIAL_FEATURES,
} from "@/lib/estimator/constants";
import { cn, formatCurrency } from "@/lib/utils";

const STEP_META = [
  { title: "Property Category", subtitle: "What type of property are you furnishing?" },
  { title: "Building Type", subtitle: "Pick the closest match to your building." },
  { title: "Project Stage", subtitle: "What stage is the project at?" },
  { title: "Location", subtitle: "We adjust pricing to your region." },
  { title: "Floor Area", subtitle: "Approximate total area to furnish." },
  { title: "Rooms & Spaces", subtitle: "Select every space that needs furnishing." },
  { title: "Design Style", subtitle: "Choose the aesthetic direction." },
  { title: "Material Preferences", subtitle: "Select the materials you love." },
  { title: "Furniture Quality", subtitle: "How premium should it feel?" },
  { title: "Budget & Timeline", subtitle: "Optional — helps us tailor the plan." },
  { title: "Special Requirements", subtitle: "Add any smart or luxury features." },
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
      case 3: return !!data.region;
      case 4: return !!data.floorAreaSqm && data.floorAreaSqm > 0;
      case 5: return (data.rooms?.length ?? 0) > 0;
      case 6: return !!data.style;
      case 7: return (data.materials?.length ?? 0) > 0;
      case 8: return !!data.quality;
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
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <button
              onClick={() => { if (confirm("Reset your estimate?")) reset(); }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="mt-1 text-muted-foreground">{meta.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <StepContent step={step} data={data} setData={setData} toggle={toggleInArray} />
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            <ArrowLeft /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {step === TOTAL_STEPS - 1 ? (
              <>Generate Estimate <Sparkles /></>
            ) : (
              <>Continue <ArrowRight /></>
            )}
          </Button>
        </div>
      </div>

      {/* Live summary */}
      <aside className="hidden h-fit rounded-3xl border border-border bg-card p-6 shadow-soft lg:block lg:sticky lg:top-24">
        <h3 className="font-display font-semibold">Your selection</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <SummaryRow label="Category" value={PROPERTY_CATEGORIES.find(c => c.id === data.category)?.label} onClick={() => goTo(0)} />
          <SummaryRow label="Building" value={data.buildingType} onClick={() => goTo(1)} />
          <SummaryRow label="Stage" value={PROJECT_STAGES.find(s => s.id === data.stage)?.label} onClick={() => goTo(2)} />
          <SummaryRow label="Region" value={REGIONS.find(r => r.id === data.region)?.label} onClick={() => goTo(3)} />
          <SummaryRow label="Area" value={data.floorAreaSqm ? `${data.floorAreaSqm} sqm` : undefined} onClick={() => goTo(4)} />
          <SummaryRow label="Rooms" value={data.rooms?.length ? `${data.rooms.length} selected` : undefined} onClick={() => goTo(5)} />
          <SummaryRow label="Style" value={DESIGN_STYLES.find(s => s.id === data.style)?.label} onClick={() => goTo(6)} />
          <SummaryRow label="Quality" value={FURNITURE_QUALITY.find(q => q.id === data.quality)?.label} onClick={() => goTo(8)} />
          {(data.budgetMax ?? 0) > 0 && (
            <SummaryRow label="Budget" value={formatCurrency(data.budgetMax!)} onClick={() => goTo(9)} />
          )}
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
        {value ? (
          <button onClick={onClick} className="font-medium text-foreground hover:text-primary hover:underline">
            {value}
          </button>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </dd>
    </div>
  );
}

type StepProps = {
  step: number;
  data: ReturnType<typeof useEstimator.getState>["data"];
  setData: (patch: Partial<StepProps["data"]>) => void;
  toggle: (key: "rooms" | "materials" | "features", value: string) => void;
};

function StepContent({ step, data, setData, toggle }: StepProps) {
  switch (step) {
    case 0:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {PROPERTY_CATEGORIES.map((c) => {
            const Icon = (Icons[c.icon as keyof typeof Icons] ?? Icons.Home) as Icons.LucideIcon;
            return (
              <SelectableCard
                key={c.id}
                selected={data.category === c.id}
                onClick={() => setData({ category: c.id })}
                title={c.label}
                subtitle={c.blurb}
                icon={<Icon className="size-5" />}
              />
            );
          })}
        </div>
      );
    case 1:
      return (
        <div className="flex flex-wrap gap-2.5">
          {BUILDING_TYPES.map((b) => (
            <Chip key={b} selected={data.buildingType === b} onClick={() => setData({ buildingType: b })}>{b}</Chip>
          ))}
        </div>
      );
    case 2:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {PROJECT_STAGES.map((s) => (
            <SelectableCard key={s.id} selected={data.stage === s.id} onClick={() => setData({ stage: s.id })} title={s.label} />
          ))}
        </div>
      );
    case 3:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {REGIONS.map((r) => (
            <SelectableCard key={r.id} selected={data.region === r.id} onClick={() => setData({ region: r.id })} title={r.label} icon={<Icons.MapPin className="size-5" />} />
          ))}
        </div>
      );
    case 4:
      return (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="area">Total floor area (square metres)</Label>
            <Input
              id="area"
              type="number"
              min={10}
              placeholder="e.g. 120"
              value={data.floorAreaSqm ?? ""}
              onChange={(e) => setData({ floorAreaSqm: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[45, 80, 120, 200, 350, 600].map((v) => (
              <Chip key={v} selected={data.floorAreaSqm === v} onClick={() => setData({ floorAreaSqm: v })}>{v} sqm</Chip>
            ))}
          </div>
        </div>
      );
    case 5:
      return (
        <div className="flex flex-wrap gap-2.5">
          {ROOMS.map((r) => (
            <Chip key={r} selected={data.rooms?.includes(r) ?? false} onClick={() => toggle("rooms", r)}>{r}</Chip>
          ))}
        </div>
      );
    case 6:
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DESIGN_STYLES.map((s) => (
            <SelectableCard key={s.id} selected={data.style === s.id} onClick={() => setData({ style: s.id })} title={s.label} />
          ))}
        </div>
      );
    case 7:
      return (
        <div className="flex flex-wrap gap-2.5">
          {MATERIALS.map((m) => (
            <Chip key={m} selected={data.materials?.includes(m) ?? false} onClick={() => toggle("materials", m)}>{m}</Chip>
          ))}
        </div>
      );
    case 8:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {FURNITURE_QUALITY.map((q) => (
            <SelectableCard key={q.id} selected={data.quality === q.id} onClick={() => setData({ quality: q.id })} title={q.label} subtitle={`×${q.multiplier} cost factor`} />
          ))}
        </div>
      );
    case 9:
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min">Minimum budget (optional)</Label>
              <Input id="min" type="number" placeholder="0" value={data.budgetMin ?? ""} onChange={(e) => setData({ budgetMin: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Maximum budget (optional)</Label>
              <Input id="max" type="number" placeholder="0" value={data.budgetMax ?? ""} onChange={(e) => setData({ budgetMax: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preferred timeline</Label>
            <div className="flex flex-wrap gap-2">
              {TIMELINES.map((t) => (
                <Chip key={t} selected={data.timeline === t} onClick={() => setData({ timeline: t })}>{t}</Chip>
              ))}
            </div>
          </div>
        </div>
      );
    case 10:
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {SPECIAL_FEATURES.map((f) => (
            <SelectableCard
              key={f.id}
              selected={data.features?.includes(f.id) ?? false}
              onClick={() => toggle("features", f.id)}
              title={f.label}
              subtitle={`+ ${formatCurrency(f.cost)}`}
              icon={<Icons.Zap className="size-5" />}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
}
