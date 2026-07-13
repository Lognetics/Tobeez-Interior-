import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TOBEEZ INTERIOR collects, uses, and protects your information.",
};

const LAST_UPDATED = "13 July 2026";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Who we are",
    body: [
      `${site.name} ("TOBEEZ", "we", "us") is an intelligent interior-planning platform operated from ${site.address}. This policy explains what information we collect when you use tobeezinteriors.com, why we collect it, and the choices you have. Questions? Contact ${site.email}.`,
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "Account information: your name, email address, and password when you create an account. If you sign in with Google or Apple, we receive the name, email, and profile photo those providers share.",
      "Workspace content: the projects, estimates, orders, consultation bookings, invoices, saved designs, and AI conversations you create while using the platform.",
      "Content you submit to AI features: prompts you type and room photos you upload for redesigns, image generation, or video walkthroughs.",
      "Payment information: payments are processed by Paystack. We never see or store your full card details — we receive only a transaction reference, the amount, and payment status.",
      "Technical data: basic request information such as IP address, used for security and rate limiting.",
    ],
  },
  {
    title: "3. How we use your information",
    body: [
      "To provide the platform: generating estimates, producing AI designs, managing your dashboard, processing consultation bookings and subscriptions.",
      "To process AI requests: your prompts and uploaded photos are sent to our AI service providers (such as OpenAI and Google, via their APIs) solely to generate your requested results. Signed-in users' private workspace records are only ever processed by our contracted, keyed AI providers — never by open, keyless services.",
      "To communicate with you: account confirmations, booking confirmations, and important service notices.",
      "We do not sell your personal information, and we do not run third-party advertising or tracking on the platform.",
    ],
  },
  {
    title: "4. Cookies and local storage",
    body: [
      "We use a small number of strictly functional cookies and browser storage: a sign-in state cookie, secure authentication tokens from our identity provider (Supabase), and local storage that keeps your chat history, preferences, and drafts on your own device. We do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    title: "5. Where your data lives",
    body: [
      "Account and workspace data is stored with Supabase, our database and authentication provider, protected by row-level security so each user can only access their own records. Some content (such as AI chat history) is kept in your browser's local storage on your device.",
    ],
  },
  {
    title: "6. Data retention and your rights",
    body: [
      "We keep your data for as long as your account is active. You may request access to, correction of, or deletion of your personal data at any time by emailing " + site.email + ". We will respond in line with the Nigeria Data Protection Act 2023 (NDPA) and other applicable law.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "We use industry-standard safeguards: encrypted connections (HTTPS) everywhere, authenticated API access, row-level database security, and secrets kept server-side. No system is perfectly secure, so please use a strong, unique password.",
    ],
  },
  {
    title: "8. Children",
    body: [
      "TOBEEZ is not directed at children under 18, and we do not knowingly collect personal information from them.",
    ],
  },
  {
    title: "9. Changes to this policy",
    body: [
      "We may update this policy as the platform evolves. Material changes will be announced on this page with a new \"last updated\" date. Continued use of the platform after changes means you accept the updated policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description={`How we collect, use, and protect your information. Last updated ${LAST_UPDATED}.`}
      />
      <Section>
        <Container className="max-w-3xl space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-xl font-semibold">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
