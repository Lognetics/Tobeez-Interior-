import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <DashHeader title="Messages" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="MessageSquare"
        title="Nothing here yet"
        description="Messages content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
