import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return (
    <>
      <DashHeader title="Portfolio" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Images"
        title="Nothing here yet"
        description="Portfolio content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
