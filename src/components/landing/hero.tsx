"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HERO_SLIDES } from "@/lib/gallery";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

export function Hero() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = HERO_SLIDES.length;

  const go = React.useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + count) % count), [count]);
  const goTo = React.useCallback((i: number) => setIndex(i), []);

  React.useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  const slide = HERO_SLIDES[index];

  return (
    <section
      className="relative min-h-[92vh] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides (crossfade + slow zoom) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: AUTOPLAY_MS / 1000 + 1, ease: "linear" }}
          >
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          {/* Legibility overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <Container className="relative flex min-h-[92vh] flex-col justify-center py-32 text-white">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
                <Sparkles className="size-4 text-primary" />
                {slide.eyebrow}
              </span>

              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                {slide.title}{" "}
                <span className="bg-gradient-to-r from-primary to-amber-300 bg-clip-text text-transparent">
                  {slide.highlight}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-lg text-white/80 text-pretty">{slide.subtitle}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/estimator">
                Start AI Estimate <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/5 text-white backdrop-blur-md hover:bg-white/15">
              <Link href="/consultation">
                <PlayCircle /> Book a Consultation
              </Link>
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-14 flex items-center gap-4">
          <div className="flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group h-1.5 overflow-hidden rounded-full bg-white/30 transition-all"
                style={{ width: i === index ? 44 : 20 }}
              >
                {i === index && !paused && (
                  <motion.span
                    key={index}
                    className="block h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                  />
                )}
                {i === index && paused && <span className="block h-full w-full rounded-full bg-primary" />}
              </button>
            ))}
          </div>

          <div className="ml-2 flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous slide" className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next slide" className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20">
              <ChevronRight className="size-5" />
            </button>
          </div>

          <span className="ml-auto hidden font-display text-sm tabular-nums text-white/70 sm:block">
            <span className="text-white">{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
          </span>
        </div>
      </Container>
    </section>
  );
}
