import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <>
      <DashHeader title="Wishlist" subtitle="This section is scaffolded and ready for its features." />
      <EmptyState
        icon="Heart"
        title="Nothing here yet"
        description="Wishlist content will appear here. This is a working shell wired into navigation, auth and the design system."
        action={<Button variant="outline">Learn more</Button>}
      />
    </>
  );
}
