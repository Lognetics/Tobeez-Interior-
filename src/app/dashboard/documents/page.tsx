import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <>
      <DashHeader title="Documents" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="FileText"
        title="Nothing here yet"
        description="Documents content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
