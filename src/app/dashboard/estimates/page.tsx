import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Saved Estimates" };

export default function SavedEstimatesPage() {
  return (
    <>
      <DashHeader title="Saved Estimates" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Calculator"
        title="Nothing here yet"
        description="Saved Estimates content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
