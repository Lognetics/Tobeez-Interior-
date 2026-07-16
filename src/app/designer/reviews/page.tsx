import { DashHeader, EmptyState } from "@/components/dashboard/widgets";

export const metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <>
      <DashHeader title="Reviews" subtitle="On the TOBEEZ roadmap." />
      <EmptyState
        icon="Star"
        title="Client reviews are coming soon"
        description="After a completed session, clients will be invited to leave a rating and review, and they'll collect here and on your public profile."
      />
    </>
  );
}
