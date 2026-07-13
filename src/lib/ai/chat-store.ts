"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecommendedProduct } from "@/lib/ai/client";

export type StudioAttachment = { kind: "image" | "video"; url: string; name: string };

export type StudioGeneratedImage = {
  url: string;
  prompt: string;
  provider: string;
  model: string;
  grounded: boolean;
};

export type StudioGeneratedVideo = {
  handle: string;
  prompt: string;
  provider: string;
  model: string;
  grounded: boolean;
  status: "queued" | "processing" | "completed" | "failed";
};

export type StudioMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: StudioAttachment[]; // user uploads
  generated?: Array<StudioGeneratedImage | string>; // strings keep older persisted chats compatible
  video?: StudioGeneratedVideo | string;
  products?: RecommendedProduct[]; // marketplace matches for the generated design
  pending?: boolean;
  time: number;
};

export type StudioConversation = {
  id: string;
  title: string;
  messages: StudioMessage[];
  createdAt: number;
};

let n = 1;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${n++}`;

/**
 * Chat media are inline data URLs, so a busy history can outgrow the ~5MB
 * localStorage quota. When a write overflows, drop the oldest conversations
 * (the list is newest-first) and retry — never throw into the send flow.
 */
const safeChatStorage = {
  getItem: (name: string) => (typeof window === "undefined" ? null : localStorage.getItem(name)),
  removeItem: (name: string) => {
    if (typeof window !== "undefined") localStorage.removeItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(name, value);
      return;
    } catch {
      try {
        const persisted = JSON.parse(value) as { state?: { conversations?: StudioConversation[] } };
        const conversations = persisted.state?.conversations ?? [];
        for (let keep = conversations.length - 1; keep >= 1; keep--) {
          try {
            localStorage.setItem(name, JSON.stringify({
              ...persisted,
              state: { ...persisted.state, conversations: conversations.slice(0, keep) },
            }));
            return;
          } catch {
            // Still too big — prune one more conversation.
          }
        }
      } catch {
        // Unparseable payload; fall through to clearing the key.
      }
      // Even a single conversation exceeds quota: stop persisting rather than crash.
      try {
        localStorage.removeItem(name);
      } catch {
        // Storage is unavailable entirely; in-memory chat still works.
      }
    }
  },
};

type ChatState = {
  conversations: StudioConversation[];
  activeId: string | null;
  newChat: () => string;
  setActive: (id: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (convId: string, msg: Omit<StudioMessage, "id" | "time">) => string;
  patchMessage: (convId: string, msgId: string, partial: Partial<StudioMessage>) => void;
  setTitle: (convId: string, title: string) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,
      newChat: () => {
        const conv: StudioConversation = { id: uid("cv"), title: "New chat", messages: [], createdAt: Date.now() };
        set((s) => ({ conversations: [conv, ...s.conversations], activeId: conv.id }));
        return conv.id;
      },
      setActive: (id) => set({ activeId: id }),
      deleteChat: (id) =>
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== id);
          return { conversations, activeId: s.activeId === id ? conversations[0]?.id ?? null : s.activeId };
        }),
      addMessage: (convId, msg) => {
        const m: StudioMessage = { ...msg, id: uid("m"), time: Date.now() };
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, m] } : c)),
        }));
        return m.id;
      },
      patchMessage: (convId, msgId, partial) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...partial } : m)) }
              : c,
          ),
        })),
      setTitle: (convId, title) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? { ...c, title } : c)) })),
    }),
    { name: "tobeez-studio-chats", storage: createJSONStorage(() => safeChatStorage) },
  ),
);

/** Utility exported for the UI. */
export { uid as newId };
export function getActive(state: ChatState) {
  return state.conversations.find((c) => c.id === state.activeId) ?? null;
}
