import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Clients" };

export default function ClientsPage() {
  return (
    <>
      <DashHeader title="Clients" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Users"
        title="Nothing here yet"
        description="Clients content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
