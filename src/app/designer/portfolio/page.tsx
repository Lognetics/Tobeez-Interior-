import { DashHeader, EmptyState } from "@/components/dashboard/widgets";

export const metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return (
    <>
      <DashHeader title="Portfolio" subtitle="On the TOBEEZ roadmap." />
      <EmptyState
        icon="Images"
        title="Your portfolio manager is coming soon"
        description="You'll publish project photos and 3D renders here, and they'll appear on your public consultant profile. For now, send new work to the TOBEEZ team to feature on the site."
      />
    </>
  );
}
