import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <>
      <DashHeader title="Leads" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Target"
        title="Nothing here yet"
        description="Leads content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
