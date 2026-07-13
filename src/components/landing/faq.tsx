"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/container";

const faqs = [
  { q: "How accurate are the AI estimates?", a: "Estimates are region-adjusted and itemised across furniture, finishes, labour, tax and contingency. Real projects typically land within the min–max range provided. Accuracy improves as you add detail in the wizard." },
  { q: "Do I need to pay to get an estimate?", a: "Running the estimator wizard is free. To view your total estimate and the complete itemised breakdown, you pay a small one-time unlock fee — that is what the premium plan covers." },
  { q: "What kinds of properties are supported?", a: "Everything from studios and duplexes to hotels, offices, hospitals, schools, event centres and industrial facilities." },
  { q: "Can I work with a real interior designer?", a: "Yes. Book a video or phone consultation with a vetted expert for ₦100,000, or an in-person session for ₦150,000. Share moodboards and collaborate in real time." },
  { q: "Which currencies and regions are supported?", a: "The platform is multi-currency and multi-region, with pricing adjusted by a regional cost index. More regions are added continuously." },
];

export function FAQ() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <Section>
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-5 text-sm text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
