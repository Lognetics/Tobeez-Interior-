"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";

const stats = [
  { value: "2,400+", label: "Projects Completed" },
  { value: "6", label: "Countries Served" },
  { value: "15", label: "Design Styles" },
  { value: "12k+", label: "Furniture Items" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/30 py-14">
      <Container>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="font-display text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
