import { ConsultantLeads } from "@/components/consultation/consultant-leads";
import { DashHeader } from "@/components/dashboard/widgets";

export const metadata = { title: "Consultations" };

export default function ConsultationsPage() {
  return (
    <>
      <DashHeader title="Consultations" subtitle="Your accepted upcoming schedule." />
      <ConsultantLeads scheduleOnly />
    </>
  );
}
