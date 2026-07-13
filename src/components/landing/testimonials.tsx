"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/container";

const reviews = [
  { name: "Michael Curtis", role: "Homeowner", quote: "The estimator gave me a clear, itemised budget before I spent a naira. It took the guesswork out of furnishing.", initials: "MC" },
  { name: "Orobosa O. Matthew", role: "Property Developer", quote: "A clean process from estimate to consultation. The breakdown made it easy to plan and prioritise each phase.", initials: "OM" },
  { name: "Success Wordu", role: "Homeowner", quote: "I uploaded a photo of my living room and got a redesign direction I genuinely loved. The consultation sealed it.", initials: "SW" },
  { name: "Praise Ebere", role: "Client", quote: "Booking a designer was straightforward, and the expert advice saved me from expensive mistakes.", initials: "PE" },
  { name: "Obonganwan John", role: "Homeowner", quote: "My estimate, designs and consultations all in one place. TOBEEZ made the whole journey simple.", initials: "OJ" },
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
