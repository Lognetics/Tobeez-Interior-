import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <DashHeader title="Settings" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Settings"
        title="Nothing here yet"
        description="Settings content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
