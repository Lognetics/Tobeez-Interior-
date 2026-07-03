import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <>
      <DashHeader title="Calendar" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Calendar"
        title="Nothing here yet"
        description="Calendar content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
