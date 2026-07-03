import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Projects" };

export default function MyProjectsPage() {
  return (
    <>
      <DashHeader title="My Projects" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="FolderKanban"
        title="Nothing here yet"
        description="My Projects content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
