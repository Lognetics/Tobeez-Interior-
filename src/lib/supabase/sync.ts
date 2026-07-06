"use client";

import { supabase } from "./client";
import { useAppData } from "@/lib/store/app-data";

/**
 * Per-user cloud sync. Mirrors the local app-data store to a single JSONB row in
 * Supabase (`user_data`) for the signed-in user, so their projects, estimates,
 * orders, bookings, invoices, conversations and designs follow them across
 * devices. Everything is best-effort and wrapped in try/catch: if there is no
 * session or the table doesn't exist yet, it silently no-ops and the app keeps
 * working from local storage.
 */

const DATA_KEYS = ["bookings", "notifications", "conversations", "orders", "projects", "estimates", "invoices", "savedDesigns"] as const;

type Snapshot = Partial<Record<(typeof DATA_KEYS)[number], unknown>>;

export function snapshot(): Snapshot {
  const s = useAppData.getState() as unknown as Record<string, unknown>;
  const out: Snapshot = {};
  for (const k of DATA_KEYS) out[k] = s[k];
  return out;
}

function isEmpty(snap: Snapshot): boolean {
  return DATA_KEYS.every((k) => !Array.isArray(snap[k]) || (snap[k] as unknown[]).length === 0);
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Load the user's cloud data into the store, or seed the cloud from local. */
export async function pullOrSeed(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase.from("user_data").select("data").eq("user_id", userId).maybeSingle();
    if (error) return; // table missing / RLS — no-op
    const cloud = (data?.data ?? null) as Snapshot | null;
    if (cloud && !isEmpty(cloud)) {
      useAppData.setState(cloud as never);
    } else {
      // First login: push whatever is local up as the initial cloud copy.
      await push(userId);
    }
  } catch {
    /* offline — keep local */
  }
}

/** Persist the current store snapshot to the cloud for this user. */
export async function push(userId: string): Promise<void> {
  try {
    await supabase.from("user_data").upsert(
      { user_id: userId, data: snapshot() as never, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  } catch {
    /* offline — try again on next change */
  }
}
