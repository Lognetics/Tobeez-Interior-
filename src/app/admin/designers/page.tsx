import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Designers" };

export default function DesignersPage() {
  return (
    <>
      <DashHeader title="Designers" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Palette"
        title="Nothing here yet"
        description="Designers content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
