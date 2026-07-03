"use client";

import { motion } from "framer-motion";
import {
  Calculator, Bot, Palette, ShoppingBag, CalendarClock, LayoutDashboard,
  ScanEye, FileDown,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const features = [
  { Icon: Calculator, title: "AI Cost Estimator", body: "A 15-step wizard produces an itemised, region-adjusted furnishing estimate with min/max ranges.", span: "md:col-span-2" },
  { Icon: Bot, title: "AI Assistant", body: "A persistent assistant for budgets, styles, materials and space planning." },
  { Icon: Palette, title: "Moodboards & Styles", body: "Pinterest-style boards, colour & style extraction from your inspiration images." },
  { Icon: ScanEye, title: "AI Room Designer", body: "Vision-driven layout and furniture recommendations tailored to each room." },
  { Icon: ShoppingBag, title: "Product Marketplace", body: "Source furniture, lighting and décor with wishlists, comparison and delivery.", span: "md:col-span-2" },
  { Icon: CalendarClock, title: "Consultations", body: "Book virtual, phone or in-person sessions with vetted interior experts." },
  { Icon: LayoutDashboard, title: "Project Dashboards", body: "Track estimates, invoices, orders, documents and messages in one place." },
  { Icon: FileDown, title: "Export & Share", body: "Download polished PDF/Excel quotations and share estimates instantly." },
];

export function Features() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Everything you need"
          title="An intelligent platform, not just a website"
          description="TOBEEZ combines estimation, design, sourcing and project management into a single premium experience."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.06 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow",
                f.span,
              )}
            >
              <div className="mb-4 inline-grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.Icon className="size-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
