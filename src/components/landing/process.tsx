"use client";

import { motion } from "framer-motion";
import { Container, Section, SectionHeading } from "@/components/ui/container";

const steps = [
  { n: "01", title: "Describe your space", body: "Answer a guided 15-step wizard about your property, rooms, style and budget." },
  { n: "02", title: "AI estimates cost", body: "Our engine itemises furniture, finishes, labour, tax and contingency instantly." },
  { n: "03", title: "Refine with an expert", body: "Book a consultation, generate moodboards and adjust your plan with a designer." },
  { n: "04", title: "Source & manage", body: "Order products, track invoices and manage the whole project to completion." },
];

export function Process() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From idea to furnished in four steps"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="mb-4 font-display text-5xl font-bold text-primary/25">{s.n}</div>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-1/2 bg-gradient-to-r from-border to-transparent md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
