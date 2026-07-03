"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, Sofa, Lamp, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const floaters = [
  { Icon: Sofa, className: "left-[8%] top-[30%]", delay: 0 },
  { Icon: Lamp, className: "right-[10%] top-[24%]", delay: 1.2 },
  { Icon: Armchair, className: "left-[16%] bottom-[16%]", delay: 2.1 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.5] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -z-10 left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -z-10 right-[12%] top-[38%] h-64 w-64 rounded-full bg-accent/40 blur-[90px] animate-float-slow" />

      {floaters.map(({ Icon, className, delay }, i) => (
        <motion.div
          key={i}
          className={`pointer-events-none absolute hidden lg:block ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -14, 0] }}
          transition={{ opacity: { delay: 0.4 + i * 0.2 }, y: { duration: 6, repeat: Infinity, delay } }}
        >
          <div className="grid size-16 place-items-center rounded-2xl border border-border glass shadow-soft">
            <Icon className="size-7 text-primary" />
          </div>
        </motion.div>
      ))}

      <Container className="relative flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-sm font-medium shadow-soft"
        >
          <Sparkles className="size-4 text-primary" />
          AI-powered furnishing estimates in minutes
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl"
        >
          Furnish any space with <span className="text-gradient">intelligent precision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty"
        >
          From apartments to hotels, offices to hospitals — estimate the true cost of
          furnishing, get a designer-grade plan, source products, and manage the whole
          project in one elegant platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="/estimator">
              Start AI Estimate <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/consultation">
              <PlayCircle /> Book a Consultation
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          Trusted for 2,400+ projects across 6 countries · No card required
        </motion.p>
      </Container>
    </section>
  );
}
