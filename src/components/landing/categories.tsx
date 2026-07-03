"use client";

import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { PROPERTY_CATEGORIES } from "@/lib/estimator/constants";

export function Categories() {
  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Any property, any scale"
          title="We furnish every kind of space"
          description="From a studio apartment to a 200-room resort, the AI adapts pricing, materials and layouts to your property type and region."
        />
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PROPERTY_CATEGORIES.map((c, i) => {
            const Icon = (Icons[c.icon as keyof typeof Icons] ?? Icons.Home) as Icons.LucideIcon;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 5) * 0.05 }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="size-6" />
                </span>
                <div>
                  <p className="font-medium">{c.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
