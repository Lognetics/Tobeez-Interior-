import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <>
      <DashHeader title="Reviews" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Star"
        title="Nothing here yet"
        description="Reviews content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
