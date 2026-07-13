import type { Metadata } from "next";
import Image from "next/image";
import { Award, Heart, Leaf, Mail, MapPin, Phone, Target, Users, Zap } from "lucide-react";
import { ABOUT_COLLAGE, FOUNDER_IMAGE } from "@/lib/gallery";
import { site } from "@/lib/site";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Process } from "@/components/landing/process";

export const metadata: Metadata = {
  title: "About",
  description: "Our story, mission and the team behind TOBEEZ INTERIOR.",
};

const values = [
  { Icon: Target, title: "Precision", body: "Data-driven estimates you can plan and budget around with confidence." },
  { Icon: Heart, title: "Craft", body: "We treat every space, big or small, with designer-grade care." },
  { Icon: Zap, title: "Speed", body: "What took weeks of quotes now takes minutes with AI." },
  { Icon: Leaf, title: "Sustainability", body: "We surface durable, efficient choices and lifecycle costs." },
  { Icon: Users, title: "Partnership", body: "Vetted designers and suppliers working as one team for you." },
  { Icon: Award, title: "Excellence", body: "An award-worthy standard across every project we touch." },
];

const team: { name: string; role: string; initials: string; image?: string }[] = [
  { name: "Founder & CEO", role: "TOBEEZ Interiors", initials: "TI", image: FOUNDER_IMAGE },
  { name: "Victory Asaboro", role: "Lead Designer · IDAN Member", initials: "VA" },
  { name: "Joy", role: "Interior Designer · MSc Interior Design", initials: "J", image: "/coporate/joy.png" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Interior planning, reinvented with AI"
        description="TOBEEZ INTERIOR blends artificial intelligence with world-class design expertise to make furnishing any space accurate, effortless and beautiful."
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <SectionHeading align="left" eyebrow="Our story" title="From frustrating quotes to instant clarity" />
            <p className="text-muted-foreground">
              We started TOBEEZ after watching clients wait weeks for furnishing quotes that were
              inconsistent, opaque and hard to compare. We believed technology could do better,
              giving anyone an accurate, itemised estimate in minutes, then connecting them with the
              right experts and products to bring it to life.
            </p>
            <p className="text-muted-foreground">
              Today the platform serves homeowners, developers, hospitality groups and institutions
              across Nigeria, adjusting pricing to each region and learning from every
              completed project.
            </p>
          </div>
          <div id="portfolio" className="grid grid-cols-2 gap-4">
            {ABOUT_COLLAGE.map((src, i) => (
              <div
                key={src}
                className={`relative aspect-square overflow-hidden rounded-2xl border border-border shadow-soft ${i % 2 ? "translate-y-6" : ""}`}
              >
                <Image src={src} alt="TOBEEZ interior project" fill sizes="(max-width: 1024px) 45vw, 25vw" className="object-cover transition-transform duration-500 hover:scale-110" />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-muted/30" id="values">
        <Container>
          <SectionHeading eyebrow="What drives us" title="Our core values" />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <Card key={v.title}>
                <CardContent className="p-6">
                  <div className="mb-4 inline-grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <v.Icon className="size-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <div id="process"><Process /></div>

      <Section className="bg-muted/30" id="team">
        <Container>
          <SectionHeading eyebrow="Meet the team" title="The people behind TOBEEZ" />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <Card key={m.name}>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  {m.image ? (
                    <span className="relative size-20 overflow-hidden rounded-2xl">
                      <Image src={m.image} alt={m.name} fill sizes="80px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="grid size-20 place-items-center rounded-2xl bg-linear-to-br from-primary/20 to-accent font-display text-xl font-bold text-primary">
                      {m.initials}
                    </span>
                  )}
                  <h3 className="mt-4 font-semibold">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="careers">
        <Container className="max-w-3xl text-center">
          <SectionHeading
            eyebrow="Careers"
            title="Help build the future of interior design"
            description="We're a small team with big ambitions across design, engineering and operations. If you care about craft, AI or beautiful spaces, we'd love to hear from you."
          />
          <Button asChild className="mt-8">
            <a href={`mailto:${site.email}?subject=Careers at TOBEEZ`}>
              <Mail /> Send us your CV
            </a>
          </Button>
        </Container>
      </Section>

      <Section className="bg-muted/30" id="contact">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="Contact" title="Talk to the TOBEEZ team" />
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { Icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
              { Icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
              { Icon: MapPin, label: "Address", value: site.address },
            ].map((c) => (
              <Card key={c.label}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <c.Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{c.label}</h3>
                  {c.href ? (
                    <a href={c.href} className="mt-1 block text-sm text-muted-foreground transition-colors hover:text-primary">{c.value}</a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{c.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
