import { DashboardShell } from "@/components/dashboard/shell";
import { adminNav } from "@/lib/dashboard-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={adminNav} role="Admin" user={{ name: "Tobi Ezeh", initials: "TE" }}>
      {children}
    </DashboardShell>
  );
}
