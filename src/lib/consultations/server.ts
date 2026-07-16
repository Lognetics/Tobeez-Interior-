import "server-only";

import { createClient } from "@supabase/supabase-js";
import { DESIGNERS } from "@/lib/data/designers";
import type { ApiIdentity } from "@/lib/auth/api-auth";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import type { ConsultantIdentity, ConsultationBooking } from "./types";

type UnknownRecord = Record<string, unknown>;

export class ConsultationServerError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ConsultationServerError";
    this.code = code;
    this.status = status;
  }
}

export function authenticatedDatabase(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export function publicDatabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export function isMissingConsultationsSchema(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as UnknownRecord;
  const code = typeof record.code === "string" ? record.code : "";
  const message = typeof record.message === "string" ? record.message.toLowerCase() : "";
  return (
    code === "42P01" ||
    code === "42883" ||
    code === "PGRST202" ||
    code === "PGRST205" ||
    message.includes("could not find the table") ||
    message.includes("could not find the function") ||
    message.includes("does not exist")
  );
}

export function consultantIdentity(consultantId: string): ConsultantIdentity {
  const consultant = DESIGNERS.find((designer) => designer.id === consultantId);
  return {
    consultantId,
    consultantName: consultant?.name ?? "TOBEEZ consultant",
  };
}

export async function consultantFor(identity: ApiIdentity) {
  const database = authenticatedDatabase(identity.accessToken);
  const { data, error } = await database
    .from("consultant_users")
    .select("consultant_id")
    .eq("user_id", identity.id)
    .maybeSingle();

  if (error) {
    if (isMissingConsultationsSchema(error)) {
      throw new ConsultationServerError(
        "The consultation database has not been activated yet.",
        "CONSULTATIONS_NOT_CONFIGURED",
        503,
      );
    }
    throw new ConsultationServerError("Could not verify consultant access.", "CONSULTANT_LOOKUP_FAILED", 503);
  }
  const consultantId = typeof data?.consultant_id === "string" ? data.consultant_id : "";
  if (!consultantId) {
    throw new ConsultationServerError(
      "This account is not linked to a TOBEEZ consultant profile.",
      "CONSULTANT_REQUIRED",
      403,
    );
  }
  return consultantIdentity(consultantId);
}

function stringValue(record: UnknownRecord, key: string) {
  return typeof record[key] === "string" ? record[key] as string : "";
}

export function mapBooking(value: unknown): ConsultationBooking {
  const record = (value && typeof value === "object" ? value : {}) as UnknownRecord;
  const consultantId = stringValue(record, "consultant_id");
  const dateIso = stringValue(record, "date_iso");
  const createdAtIso = stringValue(record, "created_at");
  const date = new Date(`${dateIso}T12:00:00`);
  return {
    id: stringValue(record, "id"),
    clientUserId: stringValue(record, "client_user_id"),
    consultantId,
    consultantName: consultantIdentity(consultantId).consultantName,
    clientName: stringValue(record, "client_name") || "Client",
    clientEmail: stringValue(record, "client_email"),
    type: stringValue(record, "type"),
    mode: stringValue(record, "mode") as ConsultationBooking["mode"],
    dateIso,
    dateLabel: Number.isNaN(date.getTime())
      ? dateIso
      : date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
    time: stringValue(record, "time"),
    amount: typeof record.amount === "number" ? record.amount : Number(record.amount) || 0,
    paystackRef: stringValue(record, "paystack_ref"),
    status: stringValue(record, "status") as ConsultationBooking["status"],
    notes: stringValue(record, "notes"),
    createdAt: createdAtIso ? new Date(createdAtIso).getTime() : Date.now(),
  };
}

export async function verifyPaystackConsultation(input: {
  reference: string;
  expectedAmount: number;
  expectedEmail: string | null;
  expectedMetadata: { consultantId: string; dateIso: string; time: string; mode: string };
}) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new ConsultationServerError(
      "Payment verification is temporarily unavailable.",
      "PAYMENT_VERIFICATION_UNAVAILABLE",
      503,
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(input.reference)}`,
      { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" },
    );
  } catch {
    throw new ConsultationServerError("Paystack could not be reached.", "PAYMENT_VERIFICATION_FAILED", 502);
  }

  const payload = await response.json().catch(() => null) as UnknownRecord | null;
  const data = payload?.data && typeof payload.data === "object" ? payload.data as UnknownRecord : null;
  if (!response.ok || payload?.status !== true || !data || data.status !== "success") {
    throw new ConsultationServerError("Payment has not been confirmed by Paystack.", "PAYMENT_NOT_CONFIRMED", 402);
  }
  if (data.reference !== input.reference) {
    throw new ConsultationServerError("Payment reference mismatch.", "PAYMENT_REFERENCE_MISMATCH", 400);
  }
  if (data.currency !== "NGN" || Number(data.amount) !== Math.round(input.expectedAmount * 100)) {
    throw new ConsultationServerError("Payment amount does not match this consultation.", "PAYMENT_AMOUNT_MISMATCH", 400);
  }

  const metadata = data.metadata && typeof data.metadata === "object" ? data.metadata as UnknownRecord : null;
  if (
    !metadata ||
    metadata.purpose !== "consultation" ||
    metadata.consultantId !== input.expectedMetadata.consultantId ||
    metadata.dateIso !== input.expectedMetadata.dateIso ||
    metadata.time !== input.expectedMetadata.time ||
    metadata.mode !== input.expectedMetadata.mode
  ) {
    throw new ConsultationServerError("Payment metadata does not match this consultation.", "PAYMENT_METADATA_MISMATCH", 400);
  }

  const customer = data.customer && typeof data.customer === "object" ? data.customer as UnknownRecord : null;
  const paidEmail = customer && typeof customer.email === "string" ? customer.email.toLowerCase() : "";
  if (input.expectedEmail && paidEmail && paidEmail !== input.expectedEmail.toLowerCase()) {
    throw new ConsultationServerError("Payment email does not match the signed-in account.", "PAYMENT_EMAIL_MISMATCH", 400);
  }
}

export function consultationErrorResponse(error: unknown) {
  if (error instanceof ConsultationServerError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  return Response.json(
    { error: "The consultation service could not complete this request.", code: "CONSULTATION_REQUEST_FAILED" },
    { status: 500 },
  );
}
