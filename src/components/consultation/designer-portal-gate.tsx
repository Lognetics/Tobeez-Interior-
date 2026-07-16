"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Loader2, ShieldX } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { ConsultationApiError, getConsultantIdentity } from "@/lib/consultations/client";
import { designerNav } from "@/lib/dashboard-nav";
import { useSession } from "@/lib/session";

export function DesignerPortalGate({ children }: { children: React.ReactNode }) {
  const user = useSession((state) => state.user);
  const authReady = useSession((state) => state.authReady);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<{ message: string; code: string } | null>(null);

  React.useEffect(() => {
    if (!authReady || !user) return;
    let active = true;
    getConsultantIdentity()
      .then(({ consultant }) => {
        if (active) setName(consultant.consultantName);
      })
      .catch((requestError) => {
        if (!active) return;
        setError({
          message: requestError instanceof Error ? requestError.message : "Consultant access could not be verified.",
          code: requestError instanceof ConsultationApiError ? requestError.code : "CONSULTANT_LOOKUP_FAILED",
        });
      });
    return () => { active = false; };
  }, [authReady, user]);

  if (!authReady || (user && !name && !error)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Verifying consultant access…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AccessMessage
        icon={<ShieldX className="size-7" />}
        title="Sign in required"
        description="Sign in with the Supabase account linked to your consultant profile."
        action={<Button asChild><Link href="/login?next=%2Fdesigner">Sign in</Link></Button>}
      />
    );
  }

  if (error) {
    const notConfigured = error.code === "CONSULTATIONS_NOT_CONFIGURED";
    return (
      <AccessMessage
        icon={<AlertCircle className="size-7" />}
        title={notConfigured ? "Consultant portal setup is incomplete" : "This is not a consultant account"}
        description={notConfigured
          ? "Apply Supabase migrations 0002 and 0003, then link this account in consultant_users."
          : "This account is signed in, but it is not linked to Victory or Joy. Ask an administrator to add the consultant mapping."}
        action={<Button asChild variant="outline"><Link href="/dashboard">Go to client dashboard</Link></Button>}
      />
    );
  }

  const initials = name.split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <DashboardShell nav={designerNav} role="Consultant" user={{ name, initials }}>
      {children}
    </DashboardShell>
  );
}

function AccessMessage({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-muted/20 p-6">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</span>
        <h1 className="mt-4 font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6">{action}</div>
      </div>
    </div>
  );
}
