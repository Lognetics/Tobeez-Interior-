"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HERO_IMAGE } from "@/lib/gallery";
import { formatCurrency } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.5] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -z-10 left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] animate-float-slow" />

      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        {/* Copy */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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
            className="mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Furnish any space with <span className="text-gradient">intelligent precision</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty"
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {["AO", "MB", "ZK", "TA"].map((i) => (
                <span key={i} className="grid size-8 place-items-center rounded-full border-2 border-background bg-primary/15 text-[10px] font-semibold text-primary">
                  {i}
                </span>
              ))}
            </div>
            <span>Trusted for <b className="text-foreground">2,400+</b> projects across 6 countries</span>
          </motion.div>
        </div>

        {/* Image showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 90, damping: 18 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border shadow-glow">
            <Image
              src={HERO_IMAGE}
              alt="Beautifully furnished interior by TOBEEZ"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-border glass p-3 shadow-soft sm:-left-6"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <TrendingUp className="size-5" />
            </span>
            <div className="pr-1">
              <p className="font-display text-sm font-bold leading-none">{formatCurrency(18500000)}</p>
              <p className="text-[11px] text-muted-foreground">Est. in 3 mins</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 }}
            className="absolute -right-3 bottom-10 flex items-center gap-2 rounded-2xl border border-border glass p-3 shadow-soft sm:-right-6"
          >
            <div className="flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
            </div>
            <p className="text-xs font-medium">4.9 · 2.4k reviews</p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
