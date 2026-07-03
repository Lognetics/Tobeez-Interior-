import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <DashHeader title="Projects" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="FolderKanban"
        title="Nothing here yet"
        description="Projects content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
