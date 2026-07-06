"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Bot, Check, CheckCheck, Paperclip, Search, Send, Smile, Sparkles, Video, Phone, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData, type Conversation } from "@/lib/store/app-data";
import { stubChat } from "@/lib/ai/stub";
import { cn } from "@/lib/utils";

type Msg = { id: string; from: "me" | "ai" | "consultant"; text: string; time: string; read?: boolean };

const DEMO_CONV: Conversation = {
  id: "demo",
  consultantId: "d1",
  consultantName: "Ada Okonkwo",
  subject: "Luxury Interior Consultation",
  unlockDateIso: "2999-01-01", // locked (future) so AI assists in the demo
  createdAt: 0,
};

function nowLabel() {
  const d = new Date();
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function Messages() {
  const stored = useAppData((s) => s.conversations);
  const conversations = stored.length ? stored : [DEMO_CONV];
  const [activeId, setActiveId] = React.useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const consultantActive = !active.unlockDateIso || active.unlockDateIso <= new Date().toISOString().slice(0, 10);

  const [threads, setThreads] = React.useState<Record<string, Msg[]>>({});
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const messages = threads[activeId] ?? [
    {
      id: "seed",
      from: "ai" as const,
      text: consultantActive
        ? `Hi! ${active.consultantName} is available now. How can we help with your ${active.subject.toLowerCase()}?`
        : `Hi 👋 I'm TOBEEZ AI. I'll assist you until ${active.consultantName} joins on your consultation date. Ask me anything about design, budget or materials.`,
      time: nowLabel(),
    },
  ];

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing, activeId]);

  function setThread(id: string, updater: (m: Msg[]) => Msg[]) {
    setThreads((t) => ({ ...t, [id]: updater(t[id] ?? messages) }));
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    const mine: Msg = { id: `m${Date.now()}`, from: "me", text, time: nowLabel(), read: false };
    setThread(activeId, (m) => [...m, mine]);
    setInput("");
    setTyping(true);

    if (consultantActive) {
      await new Promise((r) => setTimeout(r, 900));
      setThread(activeId, (m) => [
        ...m.map((x) => (x.from === "me" ? { ...x, read: true } : x)),
        { id: `c${Date.now()}`, from: "consultant", text: "Great, thanks for sharing! Let me pull up your estimate and moodboard so we can plan the next steps together.", time: nowLabel() },
      ]);
    } else {
      const reply = await stubChat([{ role: "user", content: text }]);
      setThread(activeId, (m) => [
        ...m.map((x) => (x.from === "me" ? { ...x, read: true } : x)),
        { id: `a${Date.now()}`, from: "ai", text: reply, time: nowLabel() },
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
            const unlocked = !c.unlockDateIso || c.unlockDateIso <= new Date().toISOString().slice(0, 10);
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={cn("flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors", c.id === activeId ? "bg-muted" : "hover:bg-muted/60")}>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                  {c.consultantName.split(" ").map((n) => n[0]).join("")}
                </span>
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
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="relative grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
              {active.consultantName.split(" ").map((n) => n[0]).join("")}
              <span className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card", consultantActive ? "bg-success" : "bg-warning")} />
            </span>
            <div>
              <p className="text-sm font-semibold">{active.consultantName}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {consultantActive ? "Online" : <><Sparkles className="size-3 text-primary" /> AI assisting</>}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Voice call"><Phone /></Button>
            <Button variant="ghost" size="icon" aria-label="Video call"><Video /></Button>
          </div>
        </header>

        {!consultantActive && (
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
            <Bot className="size-4 text-primary" />
            AI is assisting until {active.consultantName.split(" ")[0]} joins on your consultation date.
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.from === "me" ? "bg-primary text-primary-foreground" : m.from === "ai" ? "border border-primary/20 bg-primary/5" : "bg-muted")}>
                {m.from !== "me" && (
                  <span className="mb-0.5 flex items-center gap-1 text-[11px] font-medium opacity-70">
                    {m.from === "ai" ? <><Sparkles className="size-3" /> TOBEEZ AI</> : active.consultantName}
                  </span>
                )}
                <p>{m.text}</p>
                <span className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {m.time}
                  {m.from === "me" && (m.read ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
                </span>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-muted px-3.5 py-3">
                {[0, 0.15, 0.3].map((d) => (
                  <motion.span key={d} className="size-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-border p-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Attach file"><Paperclip /></Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Emoji"><Smile /></Button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…"
            className="h-11 flex-1 rounded-full bg-muted px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send"><Send /></Button>
        </form>
      </div>
    </div>
  );
}
