"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/container";

const reviews = [
  { name: "Adaeze O.", role: "Homeowner · Lagos", quote: "The estimate was within 4% of what I actually spent. It made budgeting my duplex completely stress-free.", initials: "AO" },
  { name: "Marcus Bello", role: "Hotel Developer · Abuja", quote: "We planned a 40-room boutique hotel fit-out in an afternoon. The itemised breakdown impressed our investors.", initials: "MB" },
  { name: "Zara K.", role: "Interior Designer", quote: "I use the designer portal for every client pitch now. Moodboards, quotes and consultations in one flow.", initials: "ZK" },
  { name: "Tunde A.", role: "Restaurant Owner", quote: "From concept to furnished dining room, TOBEEZ kept every vendor, invoice and deadline in one dashboard.", initials: "TA" },
];

export function Testimonials() {
  return (
    <Section className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Loved by clients & designers"
          title="Results people trust"
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {reviews.map((r, i) => (
            <motion.figure
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 2) * 0.08 }}
              className="rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              <div className="mb-4 flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-pretty text-foreground">“{r.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                  {r.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
