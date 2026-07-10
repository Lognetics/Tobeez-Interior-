import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { formatCurrency } from "@/lib/utils";

type UnknownRecord = Record<string, unknown>;

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is UnknownRecord => Boolean(item) && typeof item === "object")
    : [];
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function money(value: unknown, currency = "NGN") {
  const amount = number(value);
  return amount === null ? "not set" : formatCurrency(amount, currency);
}

/**
 * Reads only the authenticated user's RLS-protected platform row and turns it
 * into a compact context block for chat and visual-generation grounding.
 */
export async function getAuthenticatedUserContext(
  userId: string,
  accessToken: string,
): Promise<string> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data?.data || typeof data.data !== "object") return "";

    const snapshot = data.data as UnknownRecord;
    const lines: string[] = [];

    for (const project of records(snapshot.projects).slice(0, 5)) {
      lines.push(
        `Project: ${text(project.name, "Untitled project")}; category ${text(project.category, "not set")}; ` +
        `budget ${money(project.budget)}; status ${text(project.status, "planning")}; ` +
        `progress ${number(project.progress) ?? 0}%.`,
      );
    }

    for (const estimate of records(snapshot.estimates).slice(0, 4)) {
      const currency = text(estimate.currency, "NGN");
      lines.push(
        `Saved estimate: ${text(estimate.category, "Furnishing")}; style ${text(estimate.style, "not set")}; ` +
        `area ${number(estimate.area) ?? "not set"} sqm; recommended ${money(estimate.recommended, currency)}; ` +
        `range ${money(estimate.min, currency)} to ${money(estimate.max, currency)}.`,
      );
    }

    for (const booking of records(snapshot.bookings).slice(0, 3)) {
      lines.push(
        `Consultation: ${text(booking.type, "Interior design")}; consultant ` +
        `${text(booking.consultantName, "not selected")}; mode ${text(booking.mode, "not set")}; ` +
        `date ${text(booking.dateLabel, text(booking.dateIso, "not set"))}.`,
      );
    }

    for (const order of records(snapshot.orders).slice(0, 3)) {
      const items = records(order.items)
        .slice(0, 6)
        .map((item) => `${text(item.name, "Product")} x${number(item.qty) ?? 1}`)
        .join(", ");
      lines.push(`Marketplace order: ${items || "items unavailable"}; total ${money(order.total)}.`);
    }

    for (const design of records(snapshot.savedDesigns).slice(0, 4)) {
      const prompt = text(design.prompt).slice(0, 240);
      if (prompt) lines.push(`Saved design brief: ${prompt}.`);
    }

    return lines.join("\n").slice(0, 6_000);
  } catch {
    return "";
  }
}
