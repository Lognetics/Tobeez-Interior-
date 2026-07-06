"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Central client-side data store that ties the modules together:
 * bookings ↔ conversations ↔ notifications ↔ projects. In production this
 * would be server state (Prisma + realtime); here it keeps everything in
 * sync offline so the ecosystem feels connected.
 */

export type Booking = {
  id: string;
  type: string;
  consultantId: string;
  consultantName: string;
  mode: string;
  dateIso: string;
  dateLabel: string;
  time: string;
  amount: number;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: number;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  kind: "booking" | "message" | "payment" | "system" | "ai";
  read: boolean;
  href?: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  bookingId?: string;
  consultantId: string;
  consultantName: string;
  subject: string;
  /** Consultant unlocks (joins) only once the consultation date arrives. */
  unlockDateIso?: string;
  createdAt: number;
};

let counter = 1;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${counter++}`;

type AppState = {
  bookings: Booking[];
  notifications: AppNotification[];
  conversations: Conversation[];
  savedDesigns: { id: string; prompt: string; src: string; createdAt: number }[];

  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  addConversation: (c: Omit<Conversation, "id" | "createdAt">) => Conversation;
  saveDesign: (d: { prompt: string; src: string }) => void;
  unreadCount: () => number;
};

export const useAppData = create<AppState>()(
  persist(
    (set, get) => ({
      bookings: [],
      notifications: [],
      conversations: [],
      savedDesigns: [],

      addBooking: (b) => {
        const booking: Booking = { ...b, id: uid("bkg"), status: "confirmed", createdAt: Date.now() };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },
      addNotification: (n) =>
        set((s) => ({
          notifications: [{ ...n, id: uid("ntf"), read: false, createdAt: Date.now() }, ...s.notifications].slice(0, 50),
        })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      addConversation: (c) => {
        const conv: Conversation = { ...c, id: uid("cnv"), createdAt: Date.now() };
        set((s) => ({ conversations: [conv, ...s.conversations] }));
        return conv;
      },
      saveDesign: (d) =>
        set((s) => ({ savedDesigns: [{ ...d, id: uid("dsn"), createdAt: Date.now() }, ...s.savedDesigns] })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: "tobeez-app-data" },
  ),
);
