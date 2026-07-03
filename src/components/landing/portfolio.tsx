"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { PORTFOLIO } from "@/lib/gallery";
import { cn } from "@/lib/utils";

export function Portfolio() {
  const [active, setActive] = React.useState<number | null>(null);

  const close = React.useCallback(() => setActive(null), []);
  const go = React.useCallback(
    (dir: 1 | -1) => setActive((i) => (i === null ? null : (i + dir + PORTFOLIO.length) % PORTFOLIO.length)),
    [],
  );

  React.useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, go]);

  return (
    <Section id="portfolio" className="bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Our work"
          title="Spaces we've brought to life"
          description="A glimpse of the interiors our AI and designers have helped plan and furnish."
        />

        <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-4">
          {PORTFOLIO.map((item, i) => (
            <motion.button
              key={item.src}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 4) * 0.06 }}
              onClick={() => setActive(i)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border shadow-soft",
                item.span === "tall" && "row-span-2",
                item.span === "wide" && "col-span-2",
              )}
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs font-medium text-white/70">{item.category}</p>
                <p className="font-display text-sm font-semibold text-white">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <button className="absolute right-4 top-4 grid size-11 place-items-center rounded-full glass text-white" onClick={close} aria-label="Close">
              <X />
            </button>
            <button
              className="absolute left-3 grid size-11 place-items-center rounded-full glass text-white sm:left-6"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              aria-label="Previous"
            >
              <ArrowLeft />
            </button>
            <button
              className="absolute right-3 grid size-11 place-items-center rounded-full glass text-white sm:right-6"
              onClick={(e) => { e.stopPropagation(); go(1); }}
              aria-label="Next"
            >
              <ArrowRight />
            </button>

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10]">
                <Image src={PORTFOLIO[active].src} alt={PORTFOLIO[active].title} fill sizes="90vw" className="object-cover" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-sm text-white/70">{PORTFOLIO[active].category}</p>
                <p className="font-display text-xl font-semibold text-white">{PORTFOLIO[active].title}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
