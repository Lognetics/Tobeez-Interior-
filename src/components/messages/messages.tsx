"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot, Check, CheckCheck, Paperclip, Search, Send, Smile, Sparkles, Video, Phone, Lock, X, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallScreen } from "./call-screen";
import { useAppData, type Conversation } from "@/lib/store/app-data";
import { sendChat, fileToDataUrl, type ChatMessage } from "@/lib/ai/client";
import { cn } from "@/lib/utils";

type Attachment = { kind: "image" | "video"; url: string; name: string };
type Msg = { id: string; from: "me" | "ai" | "consultant"; text: string; time: string; read?: boolean; attachments?: Attachment[] };

const DEMO_CONV: Conversation = {
  id: "demo", consultantId: "d1", consultantName: "Vee",
  subject: "Luxury Interior Consultation", unlockDateIso: "2999-01-01", createdAt: 0,
};
const EMOJIS = ["😀", "😍", "👍", "🙏", "🔥", "🎉", "✨", "🛋️", "🏠", "💡", "🎨", "👌"];

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function consultantUnlocked(conversation: Conversation, now: number) {
  if (conversation.bookingStatus && !["confirmed", "completed"].includes(conversation.bookingStatus)) return false;
  const unlockValue = conversation.unlockAtIso ?? conversation.unlockDateIso;
  if (!unlockValue) return true;
  const unlockTime = new Date(unlockValue.length === 10 ? `${unlockValue}T00:00:00` : unlockValue).getTime();
  return !Number.isNaN(unlockTime) && unlockTime <= now;
}

function consultantUnlockLabel(conversation: Conversation) {
  const unlockValue = conversation.unlockAtIso ?? conversation.unlockDateIso;
  if (!unlockValue) return "the scheduled time";
  const date = new Date(unlockValue.length === 10 ? `${unlockValue}T00:00:00` : unlockValue);
  if (Number.isNaN(date.getTime())) return "the scheduled time";
  return date.toLocaleString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
    ...(conversation.unlockAtIso ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function Messages() {
  const stored = useAppData((s) => s.conversations);
  const conversations = stored.length ? stored : [DEMO_CONV];
  const [activeId, setActiveId] = React.useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const [now, setNow] = React.useState(() => Date.now());
  const consultantActive = consultantUnlocked(active, now);

  const [threads, setThreads] = React.useState<Record<string, Msg[]>>({});
  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [typing, setTyping] = React.useState(false);
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [call, setCall] = React.useState<"voice" | "video" | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const messages = threads[activeId] ?? [
    {
      id: "seed", from: "ai" as const, time: nowLabel(),
      text: consultantActive
        ? `Hi! ${active.consultantName} is available now. How can we help with your ${active.subject.toLowerCase()}?`
        : `Hi 👋 I'm TOBEEZ AI. I'll assist you until ${active.consultantName} joins at ${consultantUnlockLabel(active)} after accepting the booking. Ask me anything about design, budget or materials, or share a photo.`,
    },
  ];

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing, activeId]);

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function setThread(id: string, updater: (m: Msg[]) => Msg[]) {
    setThreads((t) => ({ ...t, [id]: updater(t[id] ?? messages) }));
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const next: Attachment[] = [];
    for (const f of Array.from(files).slice(0, 4)) {
      const kind = f.type.startsWith("video") ? "video" : "image";
      next.push({ kind, url: kind === "image" ? await fileToDataUrl(f) : URL.createObjectURL(f), name: f.name });
    }
    setAttachments((a) => [...a, ...next].slice(0, 4));
  }

  async function send() {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    const mine: Msg = { id: `m${Date.now()}`, from: "me", text, time: nowLabel(), read: false, attachments: attachments.length ? attachments : undefined };
    setThread(activeId, (m) => [...m, mine]);
    setInput(""); setAttachments([]); setEmojiOpen(false); setTyping(true);

    if (consultantActive) {
      await new Promise((r) => setTimeout(r, 900));
      setThread(activeId, (m) => [
        ...m.map((x) => (x.from === "me" ? { ...x, read: true } : x)),
        { id: `c${Date.now()}`, from: "consultant", text: "Thanks for sharing! Let me review this and pull up your estimate and moodboard so we can plan the next steps together.", time: nowLabel() },
      ]);
    } else {
      const history: ChatMessage[] = [...messages, mine].slice(-8).map((x) => ({
        role: x.from === "me" ? "user" : "assistant",
        content: x.text || "(shared an attachment)",
        images: x.attachments?.filter((a) => a.kind === "image").map((a) => a.url),
      }));
      let reply = "";
      try { reply = (await sendChat(history)).text; } catch { /* handled below */ }
      setThread(activeId, (m) => [
        ...m.map((x) => (x.from === "me" ? { ...x, read: true } : x)),
        { id: `a${Date.now()}`, from: "ai", text: reply || "I'm having trouble connecting right now, please try again.", time: nowLabel() },
      ]);
    }
    setTyping(false);
  }

  return (
    <div className="grid h-[calc(100dvh-9rem)] grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card shadow-soft md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div className="hidden flex-col border-r border-border md:flex">
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search conversations…" className="h-10 w-full rounded-full bg-muted pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((c) => {
            const unlocked = consultantUnlocked(c, now);
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={cn("flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors", c.id === activeId ? "bg-muted" : "hover:bg-muted/60")}>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{c.consultantName.split(" ").map((n) => n[0]).join("")}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{c.consultantName}</span>
                    {!unlocked && <Lock className="size-3 shrink-0 text-muted-foreground" />}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{c.subject}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread */}
      <div className="relative flex min-w-0 flex-col">
        {call && <CallScreen mode={call} peerName={active.consultantName} onEnd={() => setCall(null)} />}

        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="relative grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
              {active.consultantName.split(" ").map((n) => n[0]).join("")}
              <span className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card", consultantActive ? "bg-success" : "bg-warning")} />
            </span>
            <div>
              <p className="text-sm font-semibold">{active.consultantName}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">{consultantActive ? "Online" : <><Sparkles className="size-3 text-primary" /> AI assisting</>}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Voice call" title={consultantActive ? "Start voice call" : "Available at the accepted session time"} disabled={!consultantActive} onClick={() => setCall("voice")}><Phone /></Button>
            <Button variant="ghost" size="icon" aria-label="Video call" title={consultantActive ? "Start video call" : "Available at the accepted session time"} disabled={!consultantActive} onClick={() => setCall("video")}><Video /></Button>
          </div>
        </header>

        {!consultantActive && (
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
            <Bot className="size-4 text-primary" /> AI is assisting until {active.consultantName.split(" ")[0]} joins at {consultantUnlockLabel(active)} after accepting the booking.
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", m.from === "me" ? "bg-primary text-primary-foreground" : m.from === "ai" ? "border border-primary/20 bg-primary/5" : "bg-muted")}>
                {m.from !== "me" && <span className="mb-0.5 flex items-center gap-1 text-[11px] font-medium opacity-70">{m.from === "ai" ? <><Sparkles className="size-3" /> TOBEEZ AI</> : active.consultantName}</span>}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    {m.attachments.map((a, i) => a.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={a.url} alt={a.name} className="max-h-40 rounded-xl object-cover" />
                    ) : (
                      <span key={i} className="relative"><video src={a.url} className="max-h-40 rounded-xl" muted /><Play className="absolute inset-0 m-auto size-8 text-white" /></span>
                    ))}
                  </div>
                )}
                {m.text && <p>{m.text}</p>}
                <span className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {m.time}{m.from === "me" && (m.read ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
                </span>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start"><div className="flex gap-1 rounded-2xl bg-muted px-3.5 py-3">{[0, 0.15, 0.3].map((d) => <motion.span key={d} className="size-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }} />)}</div></div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <div key={i} className="relative">
                  {a.kind === "image"
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={a.url} alt={a.name} className="size-14 rounded-lg border border-border object-cover" />
                    : <div className="grid size-14 place-items-center rounded-lg border border-border bg-muted"><Video className="size-5 text-muted-foreground" /></div>}
                  <button onClick={() => setAttachments((x) => x.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background" aria-label="Remove"><X className="size-3" /></button>
                </div>
              ))}
            </div>
          )}
          <AnimatePresence>
            {emojiOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mb-2 flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-2">
                {EMOJIS.map((e) => <button key={e} onClick={() => setInput((v) => v + e)} className="grid size-9 place-items-center rounded-lg text-xl hover:bg-muted">{e}</button>)}
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            <Button type="button" variant="ghost" size="icon" aria-label="Attach file" onClick={() => fileRef.current?.click()}><Paperclip /></Button>
            <Button type="button" variant="ghost" size="icon" aria-label="Emoji" onClick={() => setEmojiOpen((v) => !v)}><Smile /></Button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="h-11 flex-1 rounded-full bg-muted px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit" size="icon" disabled={!input.trim() && attachments.length === 0} aria-label="Send"><Send /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}
