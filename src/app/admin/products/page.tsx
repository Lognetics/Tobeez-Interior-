import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <>
      <DashHeader title="Products" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Package"
        title="Nothing here yet"
        description="Products content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
