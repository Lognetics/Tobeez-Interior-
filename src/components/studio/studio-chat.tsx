"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp, ImageIcon, Images, MessageSquarePlus, Paperclip, Plus, Sparkles, Trash2, X,
  Loader2, Video, PanelLeft, Wand2, Bot, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { GeneratedImage } from "./generated-image";
import { useChatStore, type StudioAttachment } from "@/lib/ai/chat-store";
import { sendChat, wantsImage, fileToDataUrl, type ChatMessage } from "@/lib/ai/client";
import { cn } from "@/lib/utils";

type Mode = "chat" | "image";

const SUGGESTIONS = [
  { icon: Sparkles, text: "Design a luxury Scandinavian living room with walnut wood and warm lighting" },
  { icon: ImageIcon, text: "Generate 4 concepts for a modern marble kitchen" },
  { icon: Wand2, text: "I'll upload my room, redesign it in Japandi style" },
  { icon: MessageSquarePlus, text: "Suggest a colour palette and furniture for a small bedroom" },
];

export function StudioChat() {
  const store = useChatStore();
  const [mounted, setMounted] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const active = store.conversations.find((c) => c.id === store.activeId) ?? null;

  if (!mounted) return <div className="h-[calc(100dvh-9rem)] animate-pulse rounded-3xl bg-muted" />;

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
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-success" /> Real AI · text + image generation</span>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}><PanelLeft /></Button>
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>
          <p className="text-sm font-semibold">TOBEEZ AI Studio</p>
          <span className="ml-auto hidden rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground sm:block">Chat · Vision · Image</span>
        </header>
        <ChatThread key={active?.id ?? "empty"} conversationId={active?.id ?? null} />
      </div>
    </div>
  );
}

function ChatThread({ conversationId }: { conversationId: string | null }) {
  const store = useChatStore();
  const conv = store.conversations.find((c) => c.id === conversationId) ?? null;
  const messages = conv?.messages ?? [];

  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<Mode>("chat");
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
    if (!conv || conv.messages.length === 0) store.setTitle(convId, (text || "Image chat").slice(0, 40));
    setInput("");
    setAttachments([]);
    setBusy(true);

    // Assistant placeholder
    const assistantId = store.addMessage(convId, { role: "assistant", content: "", pending: true });

    // Build history for the API (include uploaded images for vision)
    const priorConv = useChatStore.getState().conversations.find((c) => c.id === convId);
    const history: ChatMessage[] = (priorConv?.messages ?? [])
      .filter((m) => !m.pending)
      .map((m) => ({
        role: m.role,
        content: m.content,
        images: m.attachments?.filter((a) => a.kind === "image").map((a) => a.url),
      }));

    const shouldImage = mode === "image" || wantsImage(text) || (userAttachments.some((a) => a.kind === "image") && /redesign|edit|change|make|convert|style/i.test(text));

    try {
      const { text: reply } = await sendChat(history);
      // Typewriter reveal
      const full = reply || "Here's what I came up with.";
      let i = 0;
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          i = Math.min(full.length, i + 4);
          store.patchMessage(convId, assistantId, { content: full.slice(0, i), pending: i < full.length });
          if (i >= full.length) { clearInterval(timer); resolve(); }
        }, 12);
      });

      if (shouldImage) {
        const imgPrompt = text || "beautiful interior redesign based on the uploaded room";
        store.patchMessage(convId, assistantId, { generated: [imgPrompt, imgPrompt, imgPrompt, imgPrompt] });
      }
    } catch {
      store.patchMessage(convId, assistantId, { content: "Sorry, I hit an error. Please try again.", pending: false });
    } finally {
      store.patchMessage(convId, assistantId, { pending: false });
      setBusy(false);
    }
  }

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"><Sparkles className="size-7" /></span>
            <h2 className="mt-5 font-display text-2xl font-bold">How can I help design your space?</h2>
            <p className="mt-1.5 text-muted-foreground">Ask anything, generate concepts, or upload a room photo to redesign.</p>
            <div className="mt-7 grid w-full gap-2.5 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
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
            <button
              onClick={() => setMode((mo) => (mo === "chat" ? "image" : "chat"))}
              className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                mode === "image" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
              title="Toggle image generation mode"
            >
              {mode === "image" ? <Images className="size-4" /> : <MessageSquarePlus className="size-4" />}
              {mode === "image" ? "Image" : "Chat"}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
              placeholder={mode === "image" ? "Describe an image to generate…" : "Message TOBEEZ AI…"}
              className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button size="icon" onClick={send} disabled={busy || (!input.trim() && attachments.length === 0)} aria-label="Send">
              {busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            TOBEEZ AI can make mistakes. Real text + image generation. Video generation activates with a provider key.
          </p>
        </div>
      </div>
    </>
  );
}
