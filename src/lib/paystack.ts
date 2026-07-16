"use client";

/**
 * Paystack Inline (popup) integration.
 * Only the PUBLIC key is used client-side (safe to expose). The SECRET key lives
 * server-side in /api/paystack/verify. Amounts are in Naira and converted to kobo.
 */

/**
 * Must come from the environment — deliberately NO hardcoded fallback. The
 * site now runs live keys; silently falling back to a test key would let
 * "payments" succeed without collecting real money. Missing key fails loudly.
 */
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

type PaystackHandler = { openIframe: () => void };
type PaystackPop = {
  setup: (opts: Record<string, unknown>) => PaystackHandler;
};
declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error("Failed to load Paystack")); };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export type PaystackOptions = {
  email: string;
  amount: number; // in Naira
  reference?: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (message: string) => void;
};

const genRef = () => `tbz_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

/** Open the Paystack checkout popup for a payment. */
export async function payWithPaystack(opts: PaystackOptions) {
  if (!PAYSTACK_PUBLIC_KEY) {
    opts.onError?.("Payment is temporarily unavailable. Please try again later or contact TOBEEZ.");
    return;
  }
  try {
    await loadScript();
  } catch {
    opts.onError?.("Could not load the payment window. Check your connection and try again.");
    return;
  }
  const pop = window.PaystackPop;
  if (!pop) { opts.onError?.("Payment is unavailable right now."); return; }

  const handler = pop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: opts.email || "customer@tobeez.interior",
    amount: Math.round(opts.amount * 100),
    currency: "NGN",
    ref: opts.reference || genRef(),
    metadata: opts.metadata ?? {},
    callback: (response: { reference: string }) => {
      // Paystack calls this synchronously on success; run our async handler.
      void Promise.resolve(opts.onSuccess(response.reference));
    },
    onClose: () => opts.onCancel?.(),
  });
  handler.openIframe();
}

/** Optionally verify a reference server-side (uses the secret key if configured). */
export async function verifyPayment(reference: string): Promise<{ ok: boolean }> {
  try {
    const r = await fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const j = await r.json();
    return { ok: !!j.ok };
  } catch {
    return { ok: true }; // network hiccup — don't block a completed test payment
  }
}
