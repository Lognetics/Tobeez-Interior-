"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EstimatorInput } from "./engine";

export type EstimatorState = {
  step: number;
  data: EstimatorInput;
  /** Whether the full itemised estimate has been unlocked (paid). */
  unlocked: boolean;
  setData: (patch: Partial<EstimatorInput>) => void;
  toggleInArray: (key: "rooms" | "materials" | "features" | "priorityRooms", value: string) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  unlock: () => void;
  reset: () => void;
};

export const TOTAL_STEPS = 15;

const initialData: EstimatorInput = {
  rooms: [],
  materials: [],
  features: [],
  priorityRooms: [],
};

export const useEstimator = create<EstimatorState>()(
  persist(
    (set) => ({
      step: 0,
      data: initialData,
      unlocked: false,
      setData: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
      toggleInArray: (key, value) =>
        set((s) => {
          const arr = new Set(s.data[key] ?? []);
          arr.has(value) ? arr.delete(value) : arr.add(value);
          return { data: { ...s.data, [key]: [...arr] } };
        }),
      next: () => set((s) => ({ step: Math.min(s.step + 1, TOTAL_STEPS - 1) })),
      prev: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
      goTo: (step) => set({ step }),
      unlock: () => set({ unlocked: true }),
      reset: () => set({ step: 0, data: initialData, unlocked: false }),
    }),
    { name: "tobeez-estimator" },
  ),
);
