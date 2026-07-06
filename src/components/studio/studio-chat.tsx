"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUp, ImageIcon, Images, MessageSquarePlus, Paperclip, Play, Plus, Sparkles, Trash2, X,
  Loader2, Video, PanelLeft, Wand2, Bot, User, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { GeneratedImage } from "./generated-image";
import { useChatStore, type StudioAttachment } from "@/lib/ai/chat-store";
import { sendChat, wantsImage, fileToDataUrl, buildImageUrl, type ChatMessage } from "@/lib/ai/client";
import { cn } from "@/lib/utils";

type Mode = "chat" | "image" | "video";

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
  const [mounted, setMounted] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("chat");
  React.useEffect(() => setMounted(true), []);

  const active = store.conversations.find((c) => c.id === store.activeId) ?? null;

  if (!mounted) return <div className="h-[calc(100dvh-8rem)] animate-pulse rounded-3xl bg-muted" />;

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

        <ChatThread key={active?.id ?? "empty"} conversationId={active?.id ?? null} mode={mode} setMode={setMode} />
      </div>
    </div>
  );
}

function ChatThread({ conversationId, mode, setMode }: { conversationId: string | null; mode: Mode; setMode: (m: Mode) => void }) {
  const store = useChatStore();
  const conv = store.conversations.find((c) => c.id === conversationId) ?? null;
  const messages = conv?.messages ?? [];

  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<StudioAttachment[]>([]);
  const [busy, setBusy] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const next: StudioAttachment[] = [];
    for (const f of Array.from(files).slice(0, 4)) {
      const kind = f.type.startsWith("video") ? "video" : "image";
      const url = kind === "image" ? await fileToDataUrl(f) : URL.createObjectURL(f);
      next.push({ kind, url, name: f.name });
    }
    setAttachments((a) => [...a, ...next].slice(0, 4));
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
    const shouldImage = mode === "image" || (mode === "chat" && (wantsImage(text) || editIntent));
    const shouldVideo = mode === "video";

    try {
      const { text: reply } = await sendChat(history);
      const full = reply || (shouldVideo ? "Here's a concept walkthrough for your space." : "Here's what I came up with.");
      let i = 0;
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          i = Math.min(full.length, i + 4);
          store.patchMessage(convId, assistantId, { content: full.slice(0, i), pending: i < full.length });
          if (i >= full.length) { clearInterval(timer); resolve(); }
        }, 12);
      });

      const visualPrompt = text || "beautiful interior redesign based on the uploaded room";
      if (shouldVideo) {
        store.patchMessage(convId, assistantId, { video: visualPrompt });
      } else if (shouldImage) {
        store.patchMessage(convId, assistantId, { generated: [visualPrompt, visualPrompt, visualPrompt, visualPrompt] });
      }
    } catch {
      store.patchMessage(convId, assistantId, { content: "Sorry, I hit an error. Please try again.", pending: false });
    } finally {
      store.patchMessage(convId, assistantId, { pending: false });
      setBusy(false);
    }
  }

  const activeMode = MODES.find((m) => m.id === mode)!;
  const placeholder = mode === "image" ? "Describe an image to generate…" : mode === "video" ? "Describe a walkthrough to generate…" : "Message TOBEEZ AI…";

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"><activeMode.icon className="size-7" /></span>
            <h2 className="mt-5 font-display text-2xl font-bold">
              {mode === "image" ? "Generate any interior visual" : mode === "video" ? "Create a walkthrough concept" : "How can I help design your space?"}
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              {mode === "image" ? "Describe a space or upload a room to redesign it." : mode === "video" ? "Describe a camera move through your space." : "Ask anything, generate concepts, or upload a room photo."}
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
            {messages.map((m) => (
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
                        <img key={i} src={a.url} alt={a.name} className="size-24 rounded-xl border border-border object-cover" />
                      ) : (
                        <video key={i} src={a.url} className="size-24 rounded-xl border border-border object-cover" muted />
                      ))}
                    </div>
                  )}
                  {m.content && <Markdown>{m.content}</Markdown>}
                  {m.pending && !m.content && (
                    <span className="inline-flex gap-1 py-1">
                      {[0, 0.15, 0.3].map((d) => (
                        <motion.span key={d} className="size-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }} />
                      ))}
                    </span>
                  )}
                  {m.generated && m.generated.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
                      {m.generated.map((p, i) => <GeneratedImage key={i} prompt={p} />)}
                    </div>
                  )}
                  {m.video && <VideoPreview prompt={m.video} />}
                </div>
              </div>
            ))}
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
                    ? <img src={a.url} alt={a.name} className="size-16 rounded-lg border border-border object-cover" />
                    : <div className="grid size-16 place-items-center rounded-lg border border-border bg-muted"><Video className="size-5 text-muted-foreground" /></div>}
                  <button onClick={() => setAttachments((x) => x.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background" aria-label="Remove"><X className="size-3" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-3xl border border-border bg-background p-2 shadow-soft focus-within:ring-2 focus-within:ring-ring">
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
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
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
              ? "Video renders a real concept keyframe. Full motion generation activates with a provider key."
              : "TOBEEZ AI can make mistakes. Real text + image generation."}
          </p>
        </div>
      </div>
    </>
  );
}

function VideoPreview({ prompt }: { prompt: string }) {
  const [status, setStatus] = React.useState<"loading" | "ok" | "error">("loading");
  const [seed, setSeed] = React.useState(() => Math.floor(Math.random() * 1_000_000));
  const url = buildImageUrl(`cinematic wide shot, ${prompt}`, { width: 768, height: 432, seed });

  return (
    <div className="mt-3 sm:max-w-md">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2"><Loader2 className="size-6 animate-spin" /><span className="text-xs">Rendering keyframe…</span></div>
          </div>
        )}
        {status !== "error" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={seed} src={url} alt={prompt} className={cn("size-full object-cover transition-opacity", status === "ok" ? "opacity-100" : "opacity-0")} onLoad={() => setStatus("ok")} onError={() => setStatus("error")} />
        )}
        {status === "error" && (
          <button onClick={() => { setStatus("loading"); setSeed(Math.floor(Math.random() * 1_000_000)); }} className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">Service busy, tap to retry</button>
        )}
        {status === "ok" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25">
            <span className="grid size-14 place-items-center rounded-full glass text-white"><Play className="size-6 translate-x-0.5" /></span>
          </div>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">Concept keyframe · full AI video (motion) activates with a Replicate/Runway key.</p>
    </div>
  );
}
