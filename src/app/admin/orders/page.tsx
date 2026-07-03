import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <>
      <DashHeader title="Orders" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="ShoppingBag"
        title="Nothing here yet"
        description="Orders content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
