"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bot, Send, Sparkles, X } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import { AIClientError, sendChat, type ChatMessage, type ChatSource } from "@/lib/ai/client";

const SUGGESTIONS = [
  "How much to furnish a 3-bedroom?",
  "Suggest a design style for me",
  "Compare marble vs porcelain",
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi 👋 I'm TOBEEZ AI. Ask me about budgets, styles, materials, products, or book a consultation.",
};

export function AIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasUserMessage = messages.some((message) => message.role === "user");

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, pending]);

  React.useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 220);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const response = await sendChat(next);
      setMessages([
        ...next,
        {
          role: "assistant",
          content: response.text || "Sorry, I couldn't respond just now. Please try again.",
          sources: response.sources,
        },
      ]);
    } catch (error) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: error instanceof AIClientError && error.code === "RATE_LIMITED"
            ? error.message
            : "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            id="tobeez-ai-dialog"
            role="dialog"
            aria-modal="false"
            aria-labelledby="tobeez-ai-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed bottom-[88px] right-3 z-50 flex h-[540px] max-h-[calc(100dvh-7.5rem)] w-[calc(100vw-1.5rem)] max-w-[384px] origin-bottom-right flex-col overflow-hidden rounded-[26px] border border-[#3a2e27] bg-[#171413] text-[#f7f3ef] shadow-[0_24px_70px_-20px_rgba(126,64,23,0.72)] sm:right-6"
          >
            <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-[#292320] px-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#ff923f] text-[#26160d]">
                  <Sparkles className="size-[17px]" strokeWidth={2.2} />
                </span>
                <div className="leading-tight">
                  <h2 id="tobeez-ai-title" className="text-[14px] font-semibold tracking-[-0.01em]">
                    TOBEEZ AI
                  </h2>
                  <p className="mt-1 text-[11px] text-[#9e958f]">Interior assistant · online</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close TOBEEZ AI"
                className="grid size-10 place-items-center rounded-full text-[#c8c0ba] transition-colors hover:bg-[#28221f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff923f]"
              >
                <X className="size-[18px]" />
              </button>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-color:#43362f_transparent] [scrollbar-width:thin]"
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "w-fit max-w-[86%] rounded-[26px] px-3.5 py-3 text-[13px] leading-[1.6]",
                    message.role === "user"
                      ? "ml-auto rounded-br-lg bg-[#f58c3c] text-[#24150d]"
                      : "rounded-tl-lg bg-[#29241f] text-[#f4efeb]",
                  )}
                >
                  {message.role === "assistant" ? (
                    <>
                      <Markdown className="text-[13px] leading-[1.6] text-inherit">
                        {message.content}
                      </Markdown>
                      {!!message.sources?.length && <SourceLinks sources={message.sources} />}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              ))}

              {pending && (
                <div
                  aria-label="TOBEEZ AI is thinking"
                  aria-live="polite"
                  className="flex w-fit items-center gap-1.5 rounded-[22px] rounded-tl-lg bg-[#29241f] px-4 py-3.5"
                >
                  <Dot />
                  <Dot delay={0.15} />
                  <Dot delay={0.3} />
                </div>
              )}

              {!hasUserMessage && (
                <div className="flex flex-col items-start gap-2 pt-1">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => send(suggestion)}
                      disabled={pending}
                      className="rounded-full border border-[#3a302a] bg-transparent px-3 py-1.5 text-left text-[12px] text-[#a69d96] transition-colors hover:border-[#6e4933] hover:bg-[#241f1c] hover:text-[#eee7e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff923f] disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex min-h-[68px] shrink-0 items-center gap-2 border-t border-[#292320] px-3 py-2.5"
            >
              <label htmlFor="tobeez-ai-input" className="sr-only">
                Ask TOBEEZ AI about interiors or the platform
              </label>
              <input
                ref={inputRef}
                id="tobeez-ai-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={4_000}
                autoComplete="off"
                placeholder="Ask anything about interiors..."
                className="h-10 min-w-0 flex-1 rounded-full bg-[#29241f] px-4 text-[13px] text-[#f7f3ef] outline-none placeholder:text-[#8f8781] focus-visible:ring-2 focus-visible:ring-[#ff923f]/80"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send message"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#9b562a] text-[#1f120b] transition-all hover:bg-[#f58c3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb174] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="size-[17px]" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close TOBEEZ AI" : "Open TOBEEZ AI"}
        aria-controls="tobeez-ai-dialog"
        aria-expanded={open}
        className="fixed bottom-4 right-3 z-50 grid size-14 place-items-center rounded-full bg-[#ff8f3d] text-[#21130c] shadow-[0_14px_36px_-10px_rgba(226,111,32,0.7)] transition-colors hover:bg-[#ffa057] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb47d] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Bot className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

function SourceLinks({ sources }: { sources: ChatSource[] }) {
  const uniqueSources = sources.filter(
    (source, index) => sources.findIndex((candidate) => candidate.id === source.id) === index,
  );

  return (
    <div className="mt-3 border-t border-[#403730] pt-2.5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9f938a]">
        Platform sources
      </p>
      <div className="flex flex-wrap gap-1.5">
        {uniqueSources.slice(0, 3).map((source) => (
          <Link
            key={source.id}
            href={source.href}
            className="inline-flex items-center gap-1 rounded-full border border-[#4a3d34] px-2 py-1 text-[10px] leading-none text-[#d7c9be] transition-colors hover:border-[#b16c3c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff923f]"
          >
            <span className="max-w-[170px] truncate">{source.title}</span>
            <ArrowUpRight className="size-2.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="size-1.5 rounded-full bg-[#a79d96]"
      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 0.9, repeat: Infinity, delay }}
    />
  );
}
