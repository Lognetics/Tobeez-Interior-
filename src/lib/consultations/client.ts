"use client";

import { supabase } from "@/lib/supabase/client";
import type { AvailabilityEntry, ConsultantIdentity, ConsultationBooking } from "./types";

export class ConsultationApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "CONSULTATION_REQUEST_FAILED", status = 500) {
    super(message);
    this.name = "ConsultationApiError";
    this.code = code;
    this.status = status;
  }
}

async function accessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiRequest<T>(path: string, init?: RequestInit, authenticated = true): Promise<T> {
  const token = authenticated ? await accessToken() : null;
  if (authenticated && !token) {
    throw new ConsultationApiError("Sign in to continue.", "AUTH_REQUIRED", 401);
  }

  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new ConsultationApiError(
      typeof payload.error === "string" ? payload.error : "The consultation service is unavailable.",
      typeof payload.code === "string" ? payload.code : "CONSULTATION_REQUEST_FAILED",
      response.status,
    );
  }
  return payload as T;
}

export function createConsultation(input: {
  reference: string;
  consultantId: string;
  type: string;
  mode: string;
  dateIso: string;
  time: string;
  clientName: string;
  notes: string;
}) {
  return apiRequest<{ booking: ConsultationBooking }>("/api/consultations/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listMyConsultations() {
  return apiRequest<{ bookings: ConsultationBooking[]; source: "database" | "fallback" }>(
    "/api/consultations/list-mine",
  );
}

export function listConsultantLeads() {
  return apiRequest<{ bookings: ConsultationBooking[]; consultant: ConsultantIdentity; source: "database" | "fallback" }>(
    "/api/consultations/list-leads",
  );
}

export function getConsultantIdentity() {
  return apiRequest<{ consultant: ConsultantIdentity }>("/api/consultations/consultant-me");
}

export function transitionConsultation(action: "accept" | "decline" | "cancel", bookingId: string) {
  return apiRequest<{ booking: ConsultationBooking; refundRequired: boolean }>(`/api/consultations/${action}`, {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export function getPublicAvailability(consultantId: string, from: string, to: string) {
  const query = new URLSearchParams({ consultantId, from, to });
  return apiRequest<{ source: "database" | "fallback"; availability: AvailabilityEntry[] }>(
    `/api/consultations/availability?${query}`,
    undefined,
    false,
  );
}

export function getManagedAvailability() {
  return apiRequest<{ source: "database" | "fallback"; availability: AvailabilityEntry[] }>(
    "/api/consultations/availability",
  );
}

export function saveManagedAvailability(weekly: Array<{ weekday: number; slots: string[] }>) {
  return apiRequest<{ availability: AvailabilityEntry[] }>("/api/consultations/availability", {
    method: "PUT",
    body: JSON.stringify({ weekly }),
  });
}
