import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pricing Database" };

export default function PricingDatabasePage() {
  return (
    <>
      <DashHeader title="Pricing Database" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="DollarSign"
        title="Nothing here yet"
        description="Pricing Database content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
