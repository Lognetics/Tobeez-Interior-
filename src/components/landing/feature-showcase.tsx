"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  ArrowRight, Bot, Calculator, CalendarClock, Check, ShoppingBag, Sparkles, Star, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { cn, formatCurrency } from "@/lib/utils";

type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  href: string;
  cta: string;
  visual: React.ReactNode;
};

export function FeatureShowcase() {
  const features: Feature[] = [
    {
      id: "studio",
      eyebrow: "AI Design Studio",
      title: "Design any space by chatting with AI",
      desc: "Describe a room in plain words, upload a photo to redesign, and generate real images, concepts and walkthroughs. A smart model that handles chat, image and video.",
      bullets: ["Chat, image & video modes", "Upload a room to redesign", "Save concepts to your projects"],
      href: "/studio",
      cta: "Open AI Studio",
      visual: <StudioVisual />,
    },
    {
      id: "estimator",
      eyebrow: "AI Cost Estimator",
      title: "Know the true cost before you spend",
      desc: "Answer a guided questionnaire and our AI itemises furniture, finishes, labour, tax and contingency, adjusted to your region, with a recommended budget and min/max range.",
      bullets: ["Itemised, region-adjusted", "Interactive charts & PDF export", "Min / max / recommended budget"],
      href: "/estimator",
      cta: "Start AI Estimate",
      visual: <EstimatorVisual />,
    },
    {
      id: "consultation",
      eyebrow: "Book a Consultant",
      title: "Talk to a vetted interior expert",
      desc: "Choose from 30+ consultation types, pick a consultant by rating and availability, and book a video, phone or in-person session, with AI assisting until they join.",
      bullets: ["30+ consultation types", "Real availability calendar", "Limited-time: ₦100,000 (save 60%)"],
      href: "/consultation",
      cta: "Book a Consultation",
      visual: <ConsultationVisual />,
    },
    {
      id: "marketplace",
      eyebrow: "Marketplace",
      title: "Source everything in one place",
      desc: "Shop furniture, lighting, kitchen and décor from curated brands, with wishlists, cart, secure checkout and order tracking, all connected to your projects.",
      bullets: ["Cart, checkout & order tracking", "Wishlists & product comparison", "Curated, vetted brands"],
      href: "/marketplace",
      cta: "Browse Marketplace",
      visual: <MarketplaceVisual />,
    },
  ];

  return (
    <Section id="features">
      <Container>
        <SectionHeading
          eyebrow="One platform, everything you need"
          title="Explore what TOBEEZ can do"
          description="Estimate, design, consult and shop, each tool is interactive and connected to the rest of your workflow."
        />
        <div className="mt-16 space-y-20 sm:space-y-28">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div className={cn(i % 2 === 1 && "lg:order-2")}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                  <Sparkles className="size-3" /> {f.eyebrow}
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">{f.title}</h3>
                <p className="mt-3 text-muted-foreground text-pretty">{f.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success"><Check className="size-3" /></span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7">
                  <Link href={f.href}>{f.cta} <ArrowRight /></Link>
                </Button>
              </div>
              <div className={cn(i % 2 === 1 && "lg:order-1")}>{f.visual}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function VisualFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-glow">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

function StudioVisual() {
  const imgs = ["/gallery/hero-image.jpg", "/gallery/img-8149.jpg", "/gallery/img-8146.jpg", "/gallery/img-8115.jpg"];
  return (
    <VisualFrame>
      <div className="mb-3 flex justify-end">
        <span className="rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">Design a luxury living room with walnut & warm light</span>
      </div>
      <div className="flex gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Bot className="size-4" /></span>
        <div className="flex-1">
          <p className="mb-2 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2 text-sm">Here are four concepts, warm walnut tones with layered lighting ✨</p>
          <div className="grid grid-cols-2 gap-2">
            {imgs.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={src} alt="AI concept" fill sizes="140px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground"><Bot className="size-3" /> Chat</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"><Sparkles className="size-3" /> Image</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"><Video className="size-3" /> Video</span>
      </div>
    </VisualFrame>
  );
}

function EstimatorVisual() {
  const data = [
    { name: "Furnishing", value: 55, color: "oklch(0.66 0.15 52)" },
    { name: "Finishes", value: 22, color: "oklch(0.7 0.13 200)" },
    { name: "Services", value: 15, color: "oklch(0.68 0.14 150)" },
    { name: "Extras", value: 8, color: "oklch(0.62 0.17 300)" },
  ];
  return (
    <VisualFrame>
      <div className="flex items-center gap-4">
        <div className="relative size-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={44} outerRadius={70} paddingAngle={3} stroke="none">
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Recommended</p>
              <p className="font-display text-sm font-bold">{formatCurrency(18500000)}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: d.color }} /> {d.name}</span>
              <span className="font-medium text-muted-foreground">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
        {[["Min", 16.2], ["Recommended", 18.5], ["Max", 21.8]].map(([l, v]) => (
          <div key={l as string}>
            <p className="text-[10px] text-muted-foreground">{l as string}</p>
            <p className="font-display text-sm font-bold">₦{v as number}M</p>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function ConsultationVisual() {
  const consultants = [
    { name: "Victory Asaboro", title: "Lead Designer", rating: 4.9, img: "/gallery/founder.jpg", online: true },
    { name: "Joy", title: "Interior Designer", rating: 4.9, img: "/coporate/joy.png", online: true },
  ];
  return (
    <VisualFrame>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Choose your consultant</p>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">Save 60%</span>
      </div>
      <div className="space-y-2">
        {consultants.map((c) => (
          <div key={c.name} className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
              {c.img ? <Image src={c.img} alt={c.name} fill sizes="44px" className="object-cover" /> : c.name.split(" ").map((n) => n[0]).join("")}
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.title}</p>
            </div>
            <span className="flex items-center gap-1 text-xs"><Star className="size-3 fill-primary text-primary" /> {c.rating}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-muted/50 p-3">
        <span className="flex items-center gap-2 text-sm"><CalendarClock className="size-4 text-primary" /> Next slot: Tomorrow, 10:30</span>
        <span className="font-display font-bold">{formatCurrency(100000)}</span>
      </div>
    </VisualFrame>
  );
}

function MarketplaceVisual() {
  const products = [
    { name: "Milano Sofa", price: 1850000, img: "/gallery/img-8115.jpg" },
    { name: "Marble Island", price: 2400000, img: "/gallery/img-8125.jpg" },
    { name: "Arc Lamp", price: 285000, img: "/gallery/img-8143.jpg" },
    { name: "Oak Table", price: 940000, img: "/gallery/img-8162.jpg" },
  ];
  return (
    <VisualFrame>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Featured products</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"><ShoppingBag className="size-3" /> Cart · 2</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {products.map((p) => (
          <div key={p.name} className="overflow-hidden rounded-xl border border-border">
            <div className="relative aspect-[4/3]">
              <Image src={p.img} alt={p.name} fill sizes="140px" className="object-cover" />
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium">{p.name}</p>
              <p className="text-xs font-semibold text-primary">{formatCurrency(p.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
