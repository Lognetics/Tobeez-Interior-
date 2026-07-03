import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <DashHeader title="Analytics" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="BarChart3"
        title="Nothing here yet"
        description="Analytics content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
