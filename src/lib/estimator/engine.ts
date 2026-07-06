/**
 * Stubbed AI cost engine. Produces a deterministic, itemised furnishing
 * estimate from wizard inputs. In production this would be backed by a
 * live price index + ML model; the shape of the output stays identical.
 */
import {
  DESIGN_STYLES,
  FURNITURE_QUALITY,
  PROJECT_STAGES,
  REGIONS,
  SPECIAL_FEATURES,
} from "./constants";

export type EstimatorInput = {
  category?: string;
  buildingType?: string;
  stage?: string;
  region?: string;
  floorAreaSqm?: number;
  rooms?: string[];
  style?: string;
  materials?: string[];
  quality?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  features?: string[];
  // --- Expanded questionnaire ---
  ownership?: string;
  purpose?: string;
  occupancy?: string;
  reuseExisting?: boolean;
  ceilingHeight?: string;
  priorityRooms?: string[];
  smartRooms?: boolean;
  storageNeeds?: boolean;
  accessibility?: boolean;
  colorPalette?: string;
  durability?: string;
  sustainability?: boolean;
  importedPreferred?: boolean;
  childFriendly?: boolean;
  petFriendly?: boolean;
  maintenance?: string;
  luxuryLevel?: string;
  financing?: string;
  phased?: boolean;
};

/** Extra cost multiplier from the expanded questionnaire answers. */
export function refinementMultiplier(input: EstimatorInput): number {
  let m = 1;
  if (input.reuseExisting) m *= 0.92;
  if (input.importedPreferred) m *= 1.12;
  if (input.sustainability) m *= 1.05;
  if (input.durability === "Maximum durability") m *= 1.06;
  if (input.ceilingHeight === "High (3m+)") m *= 1.04;
  if (input.ceilingHeight === "Double volume") m *= 1.1;
  if (input.luxuryLevel === "High-end") m *= 1.18;
  if (input.luxuryLevel === "Ultra luxury") m *= 1.45;
  return m;
}

export type LineItem = {
  key: string;
  label: string;
  amount: number;
  category: "furnishing" | "finishes" | "services" | "extras";
};

export type EstimateResult = {
  currency: string;
  items: LineItem[];
  subtotal: number;
  min: number;
  max: number;
  recommended: number;
  perSqm: number;
  breakdownByCategory: { category: string; amount: number }[];
};

/** Base furnishing cost per square metre (NGN) at "standard" quality. */
const BASE_PER_SQM = 145_000;

/** Weight of each cost line as a fraction of the furnishing base. */
const LINE_WEIGHTS: { key: string; label: string; weight: number; category: LineItem["category"] }[] = [
  { key: "furniture", label: "Furniture", weight: 0.26, category: "furnishing" },
  { key: "lighting", label: "Lighting", weight: 0.07, category: "furnishing" },
  { key: "curtains", label: "Curtains & Blinds", weight: 0.05, category: "furnishing" },
  { key: "decor", label: "Décor & Accessories", weight: 0.06, category: "furnishing" },
  { key: "electronics", label: "Electronics", weight: 0.08, category: "furnishing" },
  { key: "kitchen", label: "Kitchen & Appliances", weight: 0.09, category: "furnishing" },
  { key: "wardrobes", label: "Wardrobes & Storage", weight: 0.06, category: "furnishing" },
  { key: "flooring", label: "Flooring", weight: 0.09, category: "finishes" },
  { key: "walls", label: "Wall Finishes & Paint", weight: 0.06, category: "finishes" },
  { key: "ceiling", label: "Ceiling & POP", weight: 0.04, category: "finishes" },
  { key: "doors", label: "Doors & Windows", weight: 0.05, category: "finishes" },
  { key: "installation", label: "Installation", weight: 0.03, category: "services" },
  { key: "transport", label: "Transportation", weight: 0.02, category: "services" },
  { key: "labour", label: "Labour", weight: 0.04, category: "services" },
];

function lookup<T extends { id: string; multiplier?: number }>(
  arr: readonly T[],
  id: string | undefined,
  fallback = 1,
): number {
  return arr.find((x) => x.id === id)?.multiplier ?? fallback;
}

export function estimate(input: EstimatorInput): EstimateResult {
  const region = REGIONS.find((r) => r.id === input.region) ?? REGIONS[REGIONS.length - 1];
  const currency = region.currency;

  const area = Math.max(input.floorAreaSqm ?? 0, 20);
  const styleMult = lookup(DESIGN_STYLES, input.style);
  const qualityMult = lookup(FURNITURE_QUALITY, input.quality);
  const stageMult = lookup(PROJECT_STAGES, input.stage);
  const regionMult = region.multiplier;

  // More rooms nudge the intensity of furnishing per sqm.
  const roomFactor = 1 + Math.min((input.rooms?.length ?? 4) - 4, 12) * 0.015;

  const furnishingBase =
    BASE_PER_SQM * area * styleMult * qualityMult * stageMult * regionMult * roomFactor * refinementMultiplier(input);

  const items: LineItem[] = LINE_WEIGHTS.map((w) => ({
    key: w.key,
    label: w.label,
    category: w.category,
    amount: Math.round((furnishingBase * w.weight) / 1000) * 1000,
  }));

  const coreSubtotal = items.reduce((s, i) => s + i.amount, 0);

  // Special features are flat add-ons, scaled by region.
  const featureCost = (input.features ?? []).reduce((sum, id) => {
    const f = SPECIAL_FEATURES.find((x) => x.id === id);
    return sum + (f ? Math.round(f.cost * regionMult) : 0);
  }, 0);
  if (featureCost > 0) {
    items.push({ key: "features", label: "Smart & Special Features", amount: featureCost, category: "extras" });
  }

  const withFeatures = coreSubtotal + featureCost;

  // Professional layers.
  const professionalFees = Math.round(withFeatures * 0.1);
  const tax = Math.round(withFeatures * 0.075);
  const contingency = Math.round(withFeatures * 0.08);
  items.push(
    { key: "fees", label: "Professional Fees", amount: professionalFees, category: "services" },
    { key: "tax", label: "Tax (VAT)", amount: tax, category: "services" },
    { key: "contingency", label: "Contingency", amount: contingency, category: "services" },
  );

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const min = Math.round((subtotal * 0.88) / 1000) * 1000;
  const max = Math.round((subtotal * 1.18) / 1000) * 1000;
  const recommended = Math.round((subtotal * 1.05) / 1000) * 1000;

  const byCat = new Map<string, number>();
  for (const i of items) byCat.set(i.category, (byCat.get(i.category) ?? 0) + i.amount);

  return {
    currency,
    items,
    subtotal,
    min,
    max,
    recommended,
    perSqm: Math.round(subtotal / area),
    breakdownByCategory: [...byCat.entries()].map(([category, amount]) => ({ category, amount })),
  };
}
