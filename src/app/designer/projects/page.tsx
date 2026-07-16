import { DashHeader, EmptyState } from "@/components/dashboard/widgets";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <DashHeader title="Projects" subtitle="On the TOBEEZ roadmap." />
      <EmptyState
        icon="FolderKanban"
        title="Project engagements are coming soon"
        description="Accepted consultations will be convertible into managed projects — timeline, milestones and payments in one place. Until then, run engagements from your Consultations schedule."
      />
    </>
  );
}
