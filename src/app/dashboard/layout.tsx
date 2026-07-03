import { DashboardShell } from "@/components/dashboard/shell";
import { clientNav } from "@/lib/dashboard-nav";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={clientNav} role="Client" user={{ name: "Jane Doe", initials: "JD" }}>
      {children}
    </DashboardShell>
  );
}
