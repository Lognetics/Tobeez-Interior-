import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { ConsultationBooking } from "@/components/consultation/booking";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description: "Book a virtual, phone or in-person session with a vetted interior expert.",
};

export default function ConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Consultation"
        title="Talk to an interior expert"
        description="Pick a session type, choose your designer and a time that works. Moodboard review and a tailored plan included."
      />
      <Container className="py-14">
        <ConsultationBooking />
      </Container>
    </>
  );
}
