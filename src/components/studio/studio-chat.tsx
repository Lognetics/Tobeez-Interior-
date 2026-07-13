"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowUp, Check, ImageIcon, ImagePlus, Maximize2, MessageSquarePlus, Paperclip, Play, Plus, Sparkles, Star, Trash2, X,
  Loader2, Video, PanelLeft, Wand2, Bot, User, MessageSquare, LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { GeneratedImage } from "./generated-image";
import { MediaLightbox, type LightboxMedia } from "./media-lightbox";
import {
  useChatStore,
  type StudioAttachment,
  type StudioGeneratedImage,
  type StudioGeneratedVideo,
  type StudioMessage,
} from "@/lib/ai/chat-store";
import {
  AIClientError,
  buildImageUrl,
  fallbackImage,
  fileToDataUrl,
  generateImageAsset,
  generateVideoJob,
  getVideoJob,
  getVideoObjectUrl,
  sendChat,
  wantsImage,
  type ChatMessage,
  type RecommendedProduct,
} from "@/lib/ai/client";
import { PRODUCT_IMAGES } from "@/lib/gallery";
import { PRODUCTS } from "@/lib/data/products";
import { payWithPaystack, verifyPayment } from "@/lib/paystack";
import { STUDIO_PRO_LIMITS, useAppData } from "@/lib/store/app-data";
import { useCart } from "@/lib/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";
import { useSession } from "@/lib/session";

type Mode = "chat" | "image" | "video";

/** Studio Pro subscription price (per 30 days) — matches the header badge. */
const STUDIO_PRO_PRICE = 43000;

/** On touch keyboards, Enter inserts a newline; on desktop, Enter sends and Shift+Enter breaks the line. */
function isTouchDevice() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

const MODES: { id: Mode; label: string; icon: React.ElementType; hint: string }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare, hint: "Ask, plan and analyse" },
  { id: "image", label: "Image", icon: ImageIcon, hint: "Generate & redesign visuals" },
  { id: "video", label: "Video", icon: Video, hint: "Walkthrough concepts" },
];

const SUGGESTIONS: Record<Mode, { icon: React.ElementType; text: string }[]> = {
  chat: [
    { icon: Sparkles, text: "Design a luxury Scandinavian living room with walnut wood and warm lighting" },
    { icon: MessageSquarePlus, text: "Suggest a colour palette and furniture for a small bedroom" },
    { icon: Wand2, text: "I'll upload my room, analyse it and suggest a redesign" },
    { icon: Sparkles, text: "Estimate a budget to furnish a 3-bedroom apartment in Lagos" },
  ],
  image: [
    { icon: ImageIcon, text: "A modern marble kitchen with brass accents, photorealistic" },
    { icon: ImageIcon, text: "Cozy Japandi bedroom with soft natural light" },
    { icon: ImageIcon, text: "Luxury hotel lobby with terracotta and travertine" },
    { icon: Wand2, text: "Upload a room and generate 4 redesign concepts" },
  ],
  video: [
    { icon: Video, text: "Slow fly-through of a minimalist open-plan living space" },
    { icon: Video, text: "Camera pan across a luxury master suite at golden hour" },
    { icon: Video, text: "Before-and-after walkthrough of a renovated kitchen" },
    { icon: Video, text: "360 concept tour of a boutique restaurant interior" },
  ],
};

export function StudioChat() {
  const store = useChatStore();
  const mounted = React.useSyncExternalStore(() => () => {}, () => true, () => false);
  const user = useSession((state) => state.user);
  const authReady = useSession((state) => state.authReady);
  const studioProExpiry = useAppData((state) => state.studioPro?.expiresAt ?? 0);
  const proActive = studioProExpiry > Date.now();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("chat");

  const active = store.conversations.find((c) => c.id === store.activeId) ?? null;

  if (!mounted || !authReady) return <div className="h-[calc(100dvh-8rem)] animate-pulse rounded-3xl bg-muted" />;
  if (!user) return <StudioAuthGate />;

  return (
    <div className="flex h-[calc(100dvh-8rem)] overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      {/* Sidebar */}
      <aside className={cn(
        "absolute z-30 h-[calc(100dvh-8rem)] w-64 shrink-0 flex-col border-r border-border bg-card transition-transform md:static md:flex md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="p-3">
          <Button className="w-full justify-start" onClick={() => { store.newChat(); setSidebarOpen(false); }}>
            <Plus /> New chat
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {store.conversations.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">Your conversations appear here.</p>
          )}
          {store.conversations.map((c) => (
            <div key={c.id} className={cn("group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
              c.id === store.activeId ? "bg-muted" : "hover:bg-muted/60")}>
              <button onClick={() => { store.setActive(c.id); setSidebarOpen(false); }} className="min-w-0 flex-1 truncate text-left">
                {c.title}
              </button>
              <button onClick={() => store.deleteChat(c.id)} className="opacity-0 transition-opacity group-hover:opacity-100" aria-label="Delete chat">
                <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-success" /> Real AI · text, image & video</span>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 sm:px-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}><PanelLeft /></Button>
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>
          <p className="hidden text-sm font-semibold sm:block">TOBEEZ AI Studio</p>

          {/* Top 3-way model toggle */}
          <div className="mx-auto inline-flex rounded-full border border-border bg-muted/50 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                title={m.hint}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                  mode === m.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === m.id && (
                  <motion.span layoutId="studio-mode" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
                <m.icon className="relative size-4" />
                <span className="relative">{m.label}</span>
              </button>
            ))}
          </div>
        </header>

        {mode !== "chat" && !proActive ? (
          <StudioProGate mode={mode} />
        ) : (
          <ChatThread key={active?.id ?? "empty"} conversationId={active?.id ?? null} mode={mode} setMode={setMode} proActive={proActive} />
        )}
      </div>
    </div>
  );
}

/** Image & video generation are part of the Studio Pro subscription. */
function StudioProGate({ mode }: { mode: Mode }) {
  const user = useSession((state) => state.user);
  const activateStudioPro = useAppData((state) => state.activateStudioPro);
  const addInvoice = useAppData((state) => state.addInvoice);
  const addNotification = useAppData((state) => state.addNotification);
  const [paying, setPaying] = React.useState(false);

  async function subscribe() {
    setPaying(true);
    await payWithPaystack({
      email: user?.email ?? "",
      amount: STUDIO_PRO_PRICE,
      metadata: { purpose: "studio_pro_subscription" },
      onSuccess: async (ref) => {
        await verifyPayment(ref);
        activateStudioPro(ref);
        addInvoice({ kind: "subscription", description: "TOBEEZ Studio Pro · 30 days", amount: STUDIO_PRO_PRICE, ref });
        addNotification({
          title: "Studio Pro activated",
          kind: "payment",
          href: "/studio",
          body: "Premium image and video generation is unlocked for the next 30 days.",
        });
        setPaying(false);
      },
      onCancel: () => setPaying(false),
      onError: () => setPaying(false),
    });
  }

  return (
    <div className="grid flex-1 place-items-center overflow-y-auto px-6 py-8">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 text-center shadow-soft">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          {mode === "video" ? <Video className="size-7" /> : <ImageIcon className="size-7" />}
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold">
          {mode === "video" ? "Video generation is a Studio Pro feature" : "Image generation is a Studio Pro feature"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Chat stays free. Studio Pro unlocks the premium generation engines for 30 days.
        </p>

        <div className="mt-6 flex items-end justify-center gap-2">
          <span className="font-display text-4xl font-bold text-gradient">{formatCurrency(STUDIO_PRO_PRICE)}</span>
          <span className="mb-1.5 text-sm text-muted-foreground">/ month</span>
        </div>

        <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
          {[
            "Photorealistic interior renders in seconds",
            "Redesign your own room from a photo",
            "Cinematic video walkthroughs with audio",
            "Save every design to your dashboard",
          ].map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" /> {benefit}
            </li>
          ))}
        </ul>

        <Button className="mt-7 w-full" size="lg" onClick={subscribe} disabled={paying}>
          {paying ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {paying ? "Processing…" : `Subscribe · ${formatCurrency(STUDIO_PRO_PRICE)}/mo`}
        </Button>
        <p className="mt-3 text-[11px] text-muted-foreground">Secure payment via Paystack. Renew anytime — no auto-billing.</p>
      </div>
    </div>
  );
}

function StudioAuthGate() {
  return (
    <div className="grid h-[calc(100dvh-8rem)] place-items-center rounded-3xl border border-border bg-card px-6 text-center shadow-soft">
      <div className="max-w-md">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">Sign in to TOBEEZ AI Studio</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Chat, image generation, and video generation use your private TOBEEZ projects and saved estimates. Sign in so that context stays attached to the right workspace.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild><Link href="/login?next=/studio">Sign in to continue</Link></Button>
          <Button asChild variant="outline"><Link href="/signup?next=/studio">Create an account</Link></Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Replies saved before product cards existed carry marketplace matches as a
 * plain "From the TOBEEZ marketplace: …" text line. Recover those products
 * from the catalogue at render time and hide the raw line, so old chats show
 * the same linked cards as new ones.
 */
function messagePresentation(message: StudioMessage): { displayContent: string; products: RecommendedProduct[] } {
  if (message.role !== "assistant") return { displayContent: message.content, products: [] };
  if (message.products?.length) return { displayContent: message.content, products: message.products };

  const marketplaceLine = /^\s*From the TOBEEZ marketplace:.*$/im;
  const match = message.content.match(marketplaceLine);
  if (!match) return { displayContent: message.content, products: [] };

  const lineLower = match[0].toLowerCase();
  const products = PRODUCTS
    .filter((product) => lineLower.includes(product.name.toLowerCase()))
    .slice(0, 3)
    .map(({ id, name, brand, category, price, rating, reviews }) => ({ id, name, brand, category, price, rating, reviews }));
  if (!products.length) return { displayContent: message.content, products: [] };

  return { displayContent: message.content.replace(marketplaceLine, "").trim(), products };
}

/** Newest image in the conversation — generated or uploaded — so video stays anchored to the room being discussed. */
function latestConversationImage(convId: string): string | undefined {
  const messages = useChatStore.getState().conversations.find((c) => c.id === convId)?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const generated = messages[i].generated?.filter(
      (g): g is StudioGeneratedImage => typeof g !== "string",
    );
    if (generated?.length) return generated[generated.length - 1].url;
    const images = messages[i].attachments?.filter((a) => a.kind === "image");
    if (images?.length) return images[images.length - 1].url;
  }
  return undefined;
}

function ChatThread({ conversationId, mode, setMode, proActive }: { conversationId: string | null; mode: Mode; setMode: (m: Mode) => void; proActive: boolean }) {
  const store = useChatStore();
  const conv = store.conversations.find((c) => c.id === conversationId) ?? null;
  const messages = conv?.messages ?? [];

  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<StudioAttachment[]>([]);
  const [busy, setBusy] = React.useState(false);
  const studioPro = useAppData((s) => s.studioPro);
  const recordStudioGeneration = useAppData((s) => s.recordStudioGeneration);
  const imagesLeft = Math.max(0, STUDIO_PRO_LIMITS.image - (studioPro?.imagesUsed ?? 0));
  const videosLeft = Math.max(0, STUDIO_PRO_LIMITS.video - (studioPro?.videosUsed ?? 0));
  const [visual, setVisual] = React.useState<{ id: string; kind: "image" | "video"; error: string } | null>(null);
  const [lightbox, setLightbox] = React.useState<LightboxMedia | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const dragDepth = React.useRef(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const media = Array.from(files).filter((f) => f.type.startsWith("image") || f.type.startsWith("video"));
    const next: StudioAttachment[] = [];
    for (const f of media.slice(0, 4)) {
      const kind = f.type.startsWith("video") ? "video" : "image";
      const url = kind === "image" ? await fileToDataUrl(f) : URL.createObjectURL(f);
      next.push({ kind, url, name: f.name });
    }
    setAttachments((a) => [...a, ...next].slice(0, 4));
  }

  function draggingFiles(e: React.DragEvent) {
    return e.dataTransfer.types.includes("Files");
  }

  async function send() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || busy) return;

    const convId = conversationId ?? store.newChat();
    const userAttachments = [...attachments];
    store.addMessage(convId, { role: "user", content: text || "(see attachment)", attachments: userAttachments });
    if (!conv || conv.messages.length === 0) store.setTitle(convId, (text || `${mode} chat`).slice(0, 40));
    setInput("");
    setAttachments([]);
    setBusy(true);

    const assistantId = store.addMessage(convId, { role: "assistant", content: "", pending: true });

    const priorConv = useChatStore.getState().conversations.find((c) => c.id === convId);
    const history: ChatMessage[] = (priorConv?.messages ?? [])
      .filter((m) => !m.pending)
      .map((m) => ({
        role: m.role,
        content: m.content,
        images: m.attachments?.filter((a) => a.kind === "image").map((a) => a.url),
      }));

    const editIntent = userAttachments.some((a) => a.kind === "image") && /redesign|edit|change|make|convert|style|improve/i.test(text);
    // Generation is a Studio Pro feature with per-cycle quotas — outside the
    // plan or over quota, replies stay text-only and the card explains why.
    const wantsImageNow = mode === "image" || (mode === "chat" && (wantsImage(text) || editIntent));
    const imageBlocked = wantsImageNow && proActive && imagesLeft <= 0;
    const videoBlocked = mode === "video" && proActive && videosLeft <= 0;
    const shouldImage = proActive && wantsImageNow && imagesLeft > 0;
    const shouldVideo = proActive && mode === "video" && videosLeft > 0;

    try {
      // Kick off the visual immediately — a high-quality render takes 60–120s,
      // so it must not wait behind the text reply and its typewriter.
      const visualPrompt = text || "beautiful interior redesign based on the uploaded room";
      // Video is anchored to the newest image in the thread when nothing new is
      // attached, so walkthroughs animate the room under discussion instead of
      // inventing a new one.
      const attachedImage = userAttachments.find((attachment) => attachment.kind === "image")?.url;
      const referenceImage = attachedImage ?? (shouldVideo ? latestConversationImage(convId) : undefined);
      let visualTask: Promise<void> | null = null;
      setVisual(null);
      if (videoBlocked || imageBlocked) {
        setVisual({
          id: assistantId,
          kind: videoBlocked ? "video" : "image",
          error: videoBlocked
            ? "You've reached this cycle's video generation limit. It resets when your subscription renews."
            : "You've reached this cycle's image generation limit. It resets when your subscription renews.",
        });
      }
      if (shouldVideo) {
        setVisual({ id: assistantId, kind: "video", error: "" });
        visualTask = generateVideoJob({ prompt: visualPrompt, aspect: "landscape", referenceImage })
          .then((video) => {
            store.patchMessage(convId, assistantId, {
              video: {
                handle: video.handle,
                prompt: video.prompt,
                provider: video.provider,
                model: video.model,
                grounded: video.grounded,
                status: video.status,
              },
            });
            recordStudioGeneration("video");
            setVisual(null);
          })
          .catch((videoError) => {
            const message = videoError instanceof Error ? videoError.message : "The video provider was unavailable.";
            setVisual({ id: assistantId, kind: "video", error: `Video generation failed: ${message}` });
          });
      } else if (shouldImage) {
        setVisual({ id: assistantId, kind: "image", error: "" });
        visualTask = generateImageAsset({ prompt: visualPrompt, aspect: "landscape", referenceImage })
          .then((image) => {
            store.patchMessage(convId, assistantId, {
              generated: [{
                url: image.url,
                prompt: image.prompt,
                provider: image.provider,
                model: image.model,
                grounded: image.grounded,
              }],
            });
            recordStudioGeneration("image");
            setVisual(null);
          })
          .catch((imageError) => {
            const message = imageError instanceof Error ? imageError.message : "The image provider was unavailable.";
            setVisual({ id: assistantId, kind: "image", error: `Image generation failed: ${message}` });
          });
      }

      // The route tells the model a visual is rendering below its reply, so it
      // captions instead of consulting or pointing users at other tools.
      const { text: reply, products: matchedProducts } = await sendChat(history, {
        mode: shouldVideo ? "video" : shouldImage ? "image" : "chat",
      });
      const full = reply || (shouldVideo ? "Here's a concept walkthrough for your space." : "Here's what I came up with.");
      let i = 0;
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          i = Math.min(full.length, i + 4);
          store.patchMessage(convId, assistantId, { content: full.slice(0, i), pending: i < full.length });
          if (i >= full.length) { clearInterval(timer); resolve(); }
        }, 12);
      });

      if (matchedProducts.length > 0) {
        store.patchMessage(convId, assistantId, { products: matchedProducts });
      }

      if (visualTask) await visualTask;
    } catch (error) {
      const content = error instanceof AIClientError && error.code === "AUTH_REQUIRED"
        ? "Your session has expired. Sign in again to continue using TOBEEZ AI Studio."
        : "Sorry, I hit an error. Please try again.";
      store.patchMessage(convId, assistantId, { content, pending: false });
    } finally {
      store.patchMessage(convId, assistantId, { pending: false });
      setBusy(false);
    }
  }

  const activeMode = MODES.find((m) => m.id === mode)!;
  const placeholder = mode === "image" ? "Describe an image to generate…" : mode === "video" ? "Describe a walkthrough to generate…" : "Message TOBEEZ AI…";

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col"
      onDragEnter={(e) => {
        if (!draggingFiles(e)) return;
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (draggingFiles(e)) e.preventDefault();
      }}
      onDragLeave={() => {
        if (dragDepth.current > 0 && (dragDepth.current -= 1) === 0) setDragging(false);
      }}
      onDrop={(e) => {
        if (!draggingFiles(e)) return;
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        void onFiles(e.dataTransfer.files);
      }}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-2 z-40 grid place-items-center rounded-2xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><ImagePlus className="size-6" /></span>
            <p className="text-sm font-semibold">Drop your room photo or video</p>
            <p className="text-xs text-muted-foreground">Up to 4 files — I&apos;ll redesign what you drop</p>
          </div>
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"><activeMode.icon className="size-7" /></span>
            <h2 className="mt-5 font-display text-2xl font-bold">
              {mode === "image" ? "Generate any interior visual" : mode === "video" ? "Create a walkthrough concept" : "How can I help design your space?"}
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              {mode === "image" ? "Describe a space, or drag & drop a room photo to redesign it." : mode === "video" ? "Describe a camera move, or drop a room photo to animate it." : "Ask anything, generate concepts, or drop in a room photo."}
            </p>
            <div className="mt-7 grid w-full gap-2.5 sm:grid-cols-2">
              {SUGGESTIONS[mode].map((s) => (
                <button key={s.text} onClick={() => setInput(s.text)}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 text-left text-sm transition-colors hover:bg-muted">
                  <s.icon className="mt-0.5 size-4 shrink-0 text-primary" /> {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((m) => {
              const { displayContent, products: messageProducts } = messagePresentation(m);
              return (
              <div key={m.id} className="flex gap-3">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full",
                  m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                  {m.role === "assistant" ? <Bot className="size-4" /> : <User className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">{m.role === "assistant" ? "TOBEEZ AI" : "You"}</p>
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {m.attachments.map((a, i) => a.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={a.url}
                          alt={a.name}
                          className="size-24 cursor-zoom-in rounded-xl border border-border object-cover"
                          onClick={() => setLightbox({ kind: "image", url: a.url, alt: a.name })}
                        />
                      ) : (
                        <video
                          key={i}
                          src={a.url}
                          className="size-24 cursor-zoom-in rounded-xl border border-border object-cover"
                          muted
                          onClick={() => setLightbox({ kind: "video", url: a.url, alt: a.name })}
                        />
                      ))}
                    </div>
                  )}
                  {displayContent && <Markdown>{displayContent}</Markdown>}
                  {m.pending && !m.content && (
                    <span className="inline-flex gap-1 py-1">
                      {[0, 0.15, 0.3].map((d) => (
                        <motion.span key={d} className="size-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }} />
                      ))}
                    </span>
                  )}
                  {m.generated && m.generated.length > 0 && (
                    <div className="mt-3 grid gap-2 sm:max-w-2xl">
                      {m.generated.map((asset, i) => <GeneratedImage key={i} asset={asset} />)}
                    </div>
                  )}
                  {m.video && <VideoPreview video={m.video} />}
                  {visual?.id === m.id && !m.generated && !m.video && (
                    <div className="mt-3 sm:max-w-2xl">
                      <div className="grid aspect-video place-items-center rounded-2xl border border-border bg-muted p-6">
                        {visual.error ? (
                          <p className="text-center text-sm text-destructive">{visual.error}</p>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                            <Loader2 className="size-6 animate-spin" />
                            <span className="text-xs">
                              {visual.kind === "video" ? "Starting your cinematic walkthrough…" : "Generating your redesign…"}
                            </span>
                            <span className="text-[10px]">
                              {visual.kind === "video"
                                ? "Veo renders take one to three minutes."
                                : "High-quality renders take about a minute — the reply continues meanwhile."}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {messageProducts.length > 0 && (
                    <div className="mt-3 sm:max-w-2xl">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Shop this look on the TOBEEZ marketplace</p>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {messageProducts.map((product) => <ChatProductCard key={product.id} product={product} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <div key={i} className="relative">
                  {a.kind === "image"
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={a.url} alt={a.name} className="size-16 cursor-zoom-in rounded-lg border border-border object-cover" onClick={() => setLightbox({ kind: "image", url: a.url, alt: a.name })} />
                    : <button className="grid size-16 place-items-center rounded-lg border border-border bg-muted" onClick={() => setLightbox({ kind: "video", url: a.url, alt: a.name })} aria-label="Preview video"><Video className="size-5 text-muted-foreground" /></button>}
                  <button onClick={() => setAttachments((x) => x.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background" aria-label="Remove"><X className="size-3" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 rounded-3xl border border-border bg-background p-2 shadow-soft focus-within:ring-2 focus-within:ring-ring">
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Attach image or video"><Paperclip /></Button>
            {/* Composer mode toggle (cycles Chat → Image → Video) */}
            <button
              onClick={() => setMode(mode === "chat" ? "image" : mode === "image" ? "video" : "chat")}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors"
              title="Switch model: Chat / Image / Video"
            >
              <activeMode.icon className="size-4" /> {activeMode.label}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !isTouchDevice()) { e.preventDefault(); send(); } }}
              onPaste={(e) => {
                if (e.clipboardData.files.length > 0) {
                  e.preventDefault();
                  void onFiles(e.clipboardData.files);
                }
              }}
              rows={1}
              placeholder={placeholder}
              className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button size="icon" onClick={send} disabled={busy || (!input.trim() && attachments.length === 0)} aria-label="Send">
              {busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {mode === "video"
              ? "Real video generation can take one to three minutes. Keep this page open while it renders."
              : "TOBEEZ AI grounds responses and visuals in your workspace and verified platform records."}
          </p>
        </div>
      </div>
      <MediaLightbox media={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

/** Marketplace product matched to a generated design — same look as the marketplace grid, links to the product page. */
function ChatProductCard({ product }: { product: RecommendedProduct }) {
  const addToCart = useCart((s) => s.addToCart);
  const [added, setAdded] = React.useState(false);

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5">
      <Link href={`/marketplace/${product.id}`} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {PRODUCT_IMAGES[product.id] && (
            <Image
              src={PRODUCT_IMAGES[product.id]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, 220px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="p-2.5">
        <p className="text-[10px] text-muted-foreground">{product.brand}</p>
        <Link href={`/marketplace/${product.id}`} className="mt-0.5 block truncate text-xs font-medium hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="size-3 fill-primary text-primary" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span>({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1.5">
          <span className="truncate text-xs font-semibold">{formatCurrency(product.price)}</span>
          <Button
            size="sm"
            variant={added ? "default" : "outline"}
            className="h-7 shrink-0 px-2.5 text-xs"
            onClick={() => {
              addToCart(product.id);
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
            }}
          >
            {added ? <Check className="size-3.5" /> : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ video }: { video: StudioGeneratedVideo | string }) {
  if (typeof video === "string") return <LegacyVideoPreview prompt={video} />;
  return <GeneratedVideoPreview video={video} />;
}

function GeneratedVideoPreview({ video }: { video: StudioGeneratedVideo }) {
  const [status, setStatus] = React.useState(video.status);
  const [url, setUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [lightbox, setLightbox] = React.useState<LightboxMedia | null>(null);

  React.useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const result = await getVideoJob(video.handle);
        if (!active) return;
        setStatus(result.status);
        if (result.status === "completed") {
          const objectUrl = await getVideoObjectUrl(video.handle);
          if (!active) {
            URL.revokeObjectURL(objectUrl);
            return;
          }
          setUrl(objectUrl);
          return;
        }
        if (result.status === "failed") {
          setError(result.error || "The video provider could not complete this render.");
          return;
        }
        timer = setTimeout(poll, 10_000);
      } catch (pollError) {
        if (active) setError(pollError instanceof Error ? pollError.message : "Unable to check video progress.");
      }
    }

    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [video.handle]);

  React.useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="mt-3 sm:max-w-2xl">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
        {!url && !error && (
          <div className="absolute inset-0 z-10 grid place-items-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2 text-center">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-xs">{status === "queued" ? "Video queued…" : "Generating cinematic walkthrough…"}</span>
              <span className="text-[10px]">Veo renders usually take one to three minutes.</span>
            </div>
          </div>
        )}
        {url && (
          <>
            <video src={url} controls playsInline className="size-full object-cover" aria-label={video.prompt} />
            <button
              onClick={() => setLightbox({ kind: "video", url, alt: video.prompt })}
              className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              aria-label="Expand video"
            >
              <Maximize2 className="size-4" />
            </button>
          </>
        )}
        {error && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-destructive">{error}</div>}
      </div>
      <MediaLightbox media={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function LegacyVideoPreview({ prompt }: { prompt: string }) {
  const [status, setStatus] = React.useState<"loading" | "ok" | "fallback">("loading");
  const liveUrl = buildImageUrl(`cinematic wide shot, ${prompt}`, { width: 768, height: 432 });
  const shownUrl = status === "fallback" ? fallbackImage(prompt) : liveUrl;
  return (
    <div className="mt-3 sm:max-w-md">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
        {status === "loading" && <div className="absolute inset-0 z-10 grid place-items-center"><Loader2 className="size-6 animate-spin" /></div>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shownUrl} alt={prompt} className="size-full object-cover" onLoad={() => setStatus("ok")} onError={() => setStatus("fallback")} />
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25">
          <span className="grid size-14 place-items-center rounded-full glass text-white"><Play className="size-6 translate-x-0.5" /></span>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">Legacy concept keyframe · create a new video for full motion.</p>
    </div>
  );
}
