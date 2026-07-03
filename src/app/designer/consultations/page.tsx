import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Consultations" };

export default function ConsultationsPage() {
  return (
    <>
      <DashHeader title="Consultations" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="CalendarClock"
        title="Nothing here yet"
        description="Consultations content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
