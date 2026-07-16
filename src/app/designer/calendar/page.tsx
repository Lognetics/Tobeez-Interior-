import { AvailabilityManager } from "@/components/consultation/availability-manager";
import { DashHeader } from "@/components/dashboard/widgets";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <>
      <DashHeader title="Availability" subtitle="Control the weekly dates and times clients can book." />
      <AvailabilityManager />
    </>
  );
}
