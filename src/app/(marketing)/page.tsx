import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Categories } from "@/components/landing/categories";
import { Features } from "@/components/landing/features";
import { Process } from "@/components/landing/process";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Categories />
      <Features />
      <Process />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
