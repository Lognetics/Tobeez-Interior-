import type { Metadata } from "next";
import { Award, Heart, Leaf, Target, Users, Zap } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Process } from "@/components/landing/process";

export const metadata: Metadata = {
  title: "About",
  description: "Our story, mission and the team behind TOBEEZ INTERIOR.",
};

const values = [
  { Icon: Target, title: "Precision", body: "Data-driven estimates you can plan and budget around with confidence." },
  { Icon: Heart, title: "Craft", body: "We treat every space — big or small — with designer-grade care." },
  { Icon: Zap, title: "Speed", body: "What took weeks of quotes now takes minutes with AI." },
  { Icon: Leaf, title: "Sustainability", body: "We surface durable, efficient choices and lifecycle costs." },
  { Icon: Users, title: "Partnership", body: "Vetted designers and suppliers working as one team for you." },
  { Icon: Award, title: "Excellence", body: "An award-worthy standard across every project we touch." },
];

const team = [
  { name: "Tobi Ezeh", role: "Founder & CEO", initials: "TE" },
  { name: "Ada Okonkwo", role: "Head of Design", initials: "AO" },
  { name: "Marcus Bello", role: "Head of Partnerships", initials: "MB" },
  { name: "Zara Khan", role: "Lead AI Engineer", initials: "ZK" },
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
              inconsistent, opaque and hard to compare. We believed technology could do better —
              giving anyone an accurate, itemised estimate in minutes, then connecting them with the
              right experts and products to bring it to life.
            </p>
            <p className="text-muted-foreground">
              Today the platform serves homeowners, developers, hospitality groups and institutions
              across multiple countries, adjusting pricing to each region and learning from every
              completed project.
            </p>
          </div>
          <div id="portfolio" className="grid grid-cols-2 gap-4">
            {["from-amber-200 to-orange-300", "from-stone-200 to-stone-400", "from-emerald-200 to-teal-300", "from-rose-200 to-amber-200"].map((g, i) => (
              <div key={i} className={`aspect-square rounded-2xl bg-gradient-to-br ${g} shadow-soft ${i % 2 ? "translate-y-6" : ""}`} />
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
                  <span className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent font-display text-xl font-bold text-primary">
                    {m.initials}
                  </span>
                  <h3 className="mt-4 font-semibold">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
