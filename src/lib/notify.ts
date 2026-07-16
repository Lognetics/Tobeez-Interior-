import "server-only";

export type ConsultationEmail = {
  event: "created" | "accepted" | "declined" | "cancelled";
  bookingId: string;
  recipient: string;
};

/**
 * Email delivery hook for consultation lifecycle events.
 *
 * Intentionally a no-op until the client configures an SMTP/transactional-email
 * provider. In-app notifications remain active and no delivery is claimed.
 */
export async function sendConsultationEmail(email: ConsultationEmail) {
  void email;
  return { sent: false as const, reason: "SMTP_NOT_CONFIGURED" as const };
}
