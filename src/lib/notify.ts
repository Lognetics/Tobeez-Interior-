import "server-only";

import type { ConsultationBooking } from "@/lib/consultations/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Transactional email for consultation lifecycle events, delivered via
 * Resend's REST API. Fully optional: without RESEND_API_KEY every send is a
 * silent no-op, and delivery failures NEVER fail the booking flow — in-app
 * notifications remain the source of truth.
 *
 * Env:
 *  - RESEND_API_KEY               enables delivery
 *  - EMAIL_FROM                   verified sender, e.g. "TOBEEZ <bookings@tobeezinteriors.com>"
 *  - ADMIN_NOTIFICATIONS_EMAIL    optional copy of every new paid lead + refund notices
 *  - CONSULTANT_LEAD_EMAILS       optional "d1:victory@x.com,d2:joy@y.com" lead alerts
 */

export type ConsultationEmail = {
  event: "created" | "accepted" | "declined" | "cancelled";
  booking: ConsultationBooking;
  recipient: string; // client email
};

const EMAIL_FROM = process.env.EMAIL_FROM || "TOBEEZ Interiors <bookings@tobeezinteriors.com>";

const MODE_LABELS: Record<string, string> = {
  virtual: "Video Call",
  phone: "Phone Call",
  physical: "In-Person",
};

function consultantLeadEmail(consultantId: string) {
  const map = process.env.CONSULTANT_LEAD_EMAILS || "";
  for (const pair of map.split(",")) {
    const [id, address] = pair.split(":").map((part) => part.trim());
    if (id === consultantId && address) return address;
  }
  return "";
}

async function deliver(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return { sent: false as const };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
    });
    return { sent: response.ok };
  } catch {
    return { sent: false as const };
  }
}

function layout(title: string, lines: string[], booking: ConsultationBooking) {
  const rows = [
    ["Session", booking.type],
    ["Consultant", booking.consultantName],
    ["Date", `${booking.dateLabel} · ${booking.time}`],
    ["Format", MODE_LABELS[booking.mode] ?? booking.mode],
    ["Amount", formatCurrency(booking.amount)],
    ["Reference", booking.paystackRef],
  ]
    .map(([label, value]) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#8a8178;font-size:13px;">${label}</td>` +
      `<td style="padding:6px 0;color:#26201b;font-size:13px;font-weight:600;">${value}</td></tr>`)
    .join("");

  return `
  <div style="background:#f7f3ef;padding:32px 16px;font-family:Segoe UI,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <p style="margin:0 0 20px;font-size:13px;font-weight:700;letter-spacing:0.12em;color:#e2762c;">TOBEEZ INTERIORS</p>
      <h1 style="margin:0 0 12px;font-size:20px;color:#26201b;">${title}</h1>
      ${lines.map((line) => `<p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#4d453e;">${line}</p>`).join("")}
      <table style="margin-top:18px;border-top:1px solid #eee7df;padding-top:12px;">${rows}</table>
      <p style="margin:24px 0 0;font-size:12px;color:#8a8178;">TOBEEZ Interiors · www.tobeezinteriors.com</p>
    </div>
  </div>`;
}

export async function sendConsultationEmail({ event, booking, recipient }: ConsultationEmail) {
  const sends: Promise<{ sent: boolean }>[] = [];
  const admin = process.env.ADMIN_NOTIFICATIONS_EMAIL || "";

  if (event === "created") {
    sends.push(deliver(
      recipient,
      `Your TOBEEZ consultation request — ${booking.dateLabel} · ${booking.time}`,
      layout("Payment received — request sent", [
        `Hi ${booking.clientName}, your payment is confirmed and your consultation request has been sent to ${booking.consultantName}.`,
        "You'll hear from us as soon as it's accepted. Track it anytime from your TOBEEZ dashboard.",
      ], booking),
    ));
    const lead = `New paid lead: respond in your TOBEEZ consultant portal (Leads).`;
    sends.push(deliver(
      consultantLeadEmail(booking.consultantId),
      `New paid lead — ${booking.dateLabel} · ${booking.time}`,
      layout("You have a new paid lead", [
        `${booking.clientName} booked and paid for a session with you.`, lead,
      ], booking),
    ));
    sends.push(deliver(
      admin,
      `New consultation booking — ${booking.consultantName} · ${booking.dateLabel}`,
      layout("New paid consultation booking", [
        `${booking.clientName} booked ${booking.consultantName}. The lead is pending the consultant's response.`,
      ], booking),
    ));
  } else if (event === "accepted") {
    sends.push(deliver(
      recipient,
      `Confirmed: your TOBEEZ consultation on ${booking.dateLabel}`,
      layout("Your consultation is confirmed", [
        `Hi ${booking.clientName}, ${booking.consultantName} has accepted your session. See you on ${booking.dateLabel} at ${booking.time}.`,
        "Your consultant chat opens in the TOBEEZ dashboard at the session time.",
      ], booking),
    ));
  } else if (event === "declined") {
    sends.push(deliver(
      recipient,
      "About your TOBEEZ consultation request",
      layout("Your consultation request was declined", [
        `Hi ${booking.clientName}, unfortunately ${booking.consultantName} couldn't take this session.`,
        "A full refund of your payment is being processed to your original payment method. You can also rebook a different time or consultant anytime.",
      ], booking),
    ));
    sends.push(deliver(
      admin,
      `Refund needed — declined booking ${booking.paystackRef}`,
      layout("Manual refund required", [
        `${booking.consultantName} declined ${booking.clientName}'s paid booking. Process the refund in the Paystack dashboard using the reference below.`,
      ], booking),
    ));
  } else if (event === "cancelled") {
    sends.push(deliver(
      recipient,
      "Your TOBEEZ consultation was cancelled",
      layout("Booking cancelled", [
        `Hi ${booking.clientName}, your consultation has been cancelled as requested.`,
        "If a refund applies, it will be processed to your original payment method.",
      ], booking),
    ));
    sends.push(deliver(
      admin,
      `Cancellation — booking ${booking.paystackRef}`,
      layout("Booking cancelled by client", [
        `${booking.clientName} cancelled their session with ${booking.consultantName}. Review whether a refund applies.`,
      ], booking),
    ));
  }

  const results = await Promise.allSettled(sends);
  const sent = results.some((result) => result.status === "fulfilled" && result.value.sent);
  return { sent, reason: process.env.RESEND_API_KEY ? undefined : ("EMAIL_NOT_CONFIGURED" as const) };
}
