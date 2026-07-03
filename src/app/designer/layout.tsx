import { DashboardShell } from "@/components/dashboard/shell";
import { designerNav } from "@/lib/dashboard-nav";

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={designerNav} role="Designer" user={{ name: "Ada Okonkwo", initials: "AO" }}>
      {children}
    </DashboardShell>
  );
}
