import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Invoices" };

export default function InvoicesPage() {
  return (
    <>
      <DashHeader title="Invoices" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Receipt"
        title="Nothing here yet"
        description="Invoices content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
