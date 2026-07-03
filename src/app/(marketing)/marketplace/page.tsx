import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { MarketplaceGrid } from "@/components/marketplace/grid";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Source furniture, lighting, décor and more from curated brands.",
};

export default function MarketplacePage() {
  return (
    <>
      <PageHero
        eyebrow="Marketplace"
        title="Curated products for every space"
        description="Furniture, lighting, kitchen, décor and more, from vetted brands, with wishlists, comparison and delivery."
      />
      <Container className="py-14">
        <MarketplaceGrid />
      </Container>
    </>
  );
}
