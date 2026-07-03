import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "AI Engine" };

export default function AIEnginePage() {
  return (
    <>
      <DashHeader title="AI Engine" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Bot"
        title="Nothing here yet"
        description="AI Engine content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
