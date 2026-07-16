import { ConsultantLeads } from "@/components/consultation/consultant-leads";
import { DashHeader } from "@/components/dashboard/widgets";

export const metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <>
      <DashHeader title="Consultation leads" subtitle="Review paid requests addressed to your consultant profile." />
      <ConsultantLeads />
    </>
  );
}
