import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Verifies a Paystack transaction server-side using the SECRET key.
 * The secret is read from PAYSTACK_SECRET_KEY (never exposed to the client).
 * If no secret is configured, we don't block a completed test payment — we
 * return ok:true with verified:false so the flow still works in test mode.
 */
export async function POST(req: NextRequest) {
  let reference = "";
  try {
    const body = await req.json();
    reference = String(body?.reference ?? "");
  } catch {
    return Response.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  if (!reference) return Response.json({ ok: false, error: "Missing reference" }, { status: 400 });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return Response.json({ ok: true, verified: false });

  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const j = await r.json();
    const ok = j?.data?.status === "success";
    return Response.json({ ok, verified: true, status: j?.data?.status ?? "unknown" });
  } catch (err) {
    return Response.json({ ok: false, verified: true, error: String(err) }, { status: 200 });
  }
}
