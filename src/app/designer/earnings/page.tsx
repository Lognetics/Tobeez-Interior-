import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Earnings" };

export default function EarningsPage() {
  return (
    <>
      <DashHeader title="Earnings" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Wallet"
        title="Nothing here yet"
        description="Earnings content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
