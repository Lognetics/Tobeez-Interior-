import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <>
      <DashHeader title="Payments" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="CreditCard"
        title="Nothing here yet"
        description="Payments content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
