"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark, Clapperboard, Download, ImageIcon, Sparkles, Wand2, Send, Loader2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateDesign, generateImages, type DesignResult } from "@/lib/ai/studio";
import { useAppData } from "@/lib/store/app-data";
import { cn, formatCurrency } from "@/lib/utils";

type Tab = "chat" | "image" | "video";
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "AI Chat", icon: Sparkles },
  { id: "image", label: "Image Generator", icon: ImageIcon },
  { id: "video", label: "Video Generator", icon: Clapperboard },
];

const PROMPTS = [
  "A luxury Scandinavian living room with walnut wood and warm lighting",
  "Modern minimalist bedroom in soft neutral tones",
  "Bright open-plan kitchen with a marble island",
  "Cozy reading nook with layered textures",
];

export function DesignStudio() {
  const [tab, setTab] = React.useState<Tab>("chat");
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">AI Design Studio</h1>
            <Badge><Sparkles className="size-3" /> Pro</Badge>
          </div>
          <p className="text-muted-foreground">Describe a space and let AI design, render and cost it.</p>
        </div>
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          {tab === "chat" && <ChatStudio />}
          {tab === "image" && <ImageStudio />}
          {tab === "video" && <VideoStudio />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PromptBar({ value, onChange, onSubmit, loading, placeholder }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; loading: boolean; placeholder: string;
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex gap-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-12 flex-1 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <Button type="submit" size="lg" disabled={loading || !value.trim()}>
        {loading ? <Loader2 className="animate-spin" /> : <Wand2 />} Generate
      </Button>
    </form>
  );
}

function ChatStudio() {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<DesignResult | null>(null);
  const saveDesign = useAppData((s) => s.saveDesign);
  const addNotification = useAppData((s) => s.addNotification);
  const [saved, setSaved] = React.useState<string[]>([]);

  async function run(p?: string) {
    const q = (p ?? prompt).trim();
    if (!q) return;
    setPrompt(q); setLoading(true); setResult(null);
    const r = await generateDesign(q);
    setResult(r); setLoading(false);
    addNotification({ title: "Design concept ready", kind: "ai", href: "/studio", body: `Your AI concept for “${q}” is ready.` });
  }

  function save(src: string) {
    saveDesign({ prompt, src });
    setSaved((s) => [...s, src]);
  }

  return (
    <div className="space-y-5">
      <PromptBar value={prompt} onChange={setPrompt} onSubmit={run} loading={loading} placeholder="Describe your dream space…" />
      {!result && !loading && (
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => run(p)} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground hover:bg-muted">{p}</button>
          ))}
        </div>
      )}
      {loading && <div className="grid gap-4 sm:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-muted" /><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>}
      {result && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid grid-cols-2 gap-3">
            {result.images.map((src) => (
              <div key={src} className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
                <Image src={src} alt="AI concept" fill sizes="300px" className="object-cover" />
                <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => save(src)} className="grid size-9 place-items-center rounded-full glass text-white" aria-label="Save to project">
                    {saved.includes(src) ? <Check className="size-4" /> : <Bookmark className="size-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm text-foreground">{result.explanation}</p>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Colour palette</p>
                <div className="flex gap-2">
                  {result.palette.map((c) => (
                    <div key={c.hex} className="text-center">
                      <span className="block size-10 rounded-xl border border-border" style={{ background: c.hex }} />
                      <span className="mt-1 block text-[10px] text-muted-foreground">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested furniture</p>
                <div className="flex flex-wrap gap-1.5">{result.furniture.map((f) => <Badge key={f} variant="muted">{f}</Badge>)}</div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Materials</p>
                <div className="flex flex-wrap gap-1.5">{result.materials.map((m) => <Badge key={m} variant="secondary">{m}</Badge>)}</div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Est. budget</span>
                <span className="font-display font-bold">{formatCurrency(result.budgetEstimate)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ImageStudio() {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [images, setImages] = React.useState<string[]>([]);
  const saveDesign = useAppData((s) => s.saveDesign);

  async function run() {
    if (!prompt.trim()) return;
    setLoading(true); setImages([]);
    const imgs = await generateImages(prompt, 4);
    setImages(imgs); setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        Upload a room photo to redesign it, or describe a space to generate concepts. Change colours, flooring, walls, furniture and more.
      </div>
      <PromptBar value={prompt} onChange={setPrompt} onSubmit={run} loading={loading} placeholder="e.g. Redesign this living room in Japandi style…" />
      {loading && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />)}</div>}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
              <Image src={src} alt={`Variation ${i + 1}`} fill sizes="200px" className="object-cover" />
              <div className="absolute inset-0 flex items-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => saveDesign({ prompt, src })} className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Save"><Bookmark className="size-4" /></button>
                <a href={src} download className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Download"><Download className="size-4" /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoStudio() {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);

  async function run() {
    if (!prompt.trim()) return;
    setLoading(true); setDone(null);
    await new Promise((r) => setTimeout(r, 1600));
    setDone("/gallery/hero-image.jpg");
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {["Aspect 16:9", "Duration 8s", "Camera fly-through"].map((o) => (
          <div key={o} className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">{o}</div>
        ))}
      </div>
      <PromptBar value={prompt} onChange={setPrompt} onSubmit={run} loading={loading} placeholder="Describe a walkthrough, e.g. slow pan across a luxury lounge…" />
      {loading && <div className="aspect-video animate-pulse rounded-2xl bg-muted" />}
      {done && (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
          <Image src={done} alt="Generated walkthrough" fill sizes="800px" className="object-cover" />
          <div className="absolute inset-0 grid place-items-center bg-black/30">
            <span className="grid size-16 place-items-center rounded-full glass text-white"><Clapperboard className="size-7" /></span>
          </div>
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button size="sm" variant="secondary"><Download className="size-4" /> Download</Button>
          </div>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">Video generation is stubbed in this build, wired to swap in Runway / Replicate later.</p>
    </div>
  );
}
