"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudioAttachment = { kind: "image" | "video"; url: string; name: string };

export type StudioMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: StudioAttachment[]; // user uploads
  generated?: string[]; // AI-generated image URLs (prompts)
  video?: string; // AI video prompt (renders a keyframe preview)
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
    (set, get) => ({
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
    { name: "tobeez-studio-chats" },
  ),
);

/** Utility exported for the UI. */
export { uid as newId };
export function getActive(state: ChatState) {
  return state.conversations.find((c) => c.id === state.activeId) ?? null;
}
