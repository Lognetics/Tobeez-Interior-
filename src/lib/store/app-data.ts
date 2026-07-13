"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Central client-side data store that ties every module together:
 * estimates ↔ projects ↔ bookings ↔ conversations ↔ orders ↔ invoices ↔
 * documents ↔ notifications. Actions anywhere in the app write here, and the
 * dashboards read from here, so the whole product stays in sync.
 */

export type Booking = {
  id: string; type: string; consultantId: string; consultantName: string;
  mode: string; dateIso: string; dateLabel: string; time: string;
  amount: number; status: "confirmed" | "completed" | "cancelled"; createdAt: number;
};

export type AppNotification = {
  id: string; title: string; body: string;
  kind: "booking" | "message" | "payment" | "system" | "ai" | "order" | "project";
  read: boolean; href?: string; createdAt: number;
};

export type Conversation = {
  id: string; bookingId?: string; consultantId: string; consultantName: string;
  subject: string; unlockDateIso?: string; createdAt: number;
};

export type OrderItem = { productId: string; name: string; price: number; qty: number };
export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";
export type Order = {
  id: string; items: OrderItem[]; subtotal: number; shipping: number; tax: number;
  total: number; status: OrderStatus; address: string; createdAt: number;
};

export type ProjectStatus = "planning" | "in_progress" | "completed" | "on_hold";
export type Project = {
  id: string; name: string; category?: string; budget: number;
  status: ProjectStatus; progress: number; estimateId?: string; createdAt: number;
};

export type SavedEstimate = {
  id: string; category?: string; style?: string; area?: number;
  currency: string; recommended: number; min: number; max: number;
  input: unknown; createdAt: number;
};

export type Invoice = {
  id: string; number: string; kind: "consultation" | "order" | "estimate" | "subscription";
  description: string; amount: number; status: "paid" | "due"; ref?: string; createdAt: number;
};

export type SavedDesign = { id: string; prompt: string; src: string; createdAt: number };

/** Studio Pro subscription (₦43,000 / 30 days) — unlocks image & video generation. */
export type StudioProSub = {
  ref: string; activatedAt: number; expiresAt: number;
  imagesUsed: number; videosUsed: number;
};

/** Per-cycle generation quotas included in Studio Pro. */
export const STUDIO_PRO_LIMITS = { image: 20, video: 5 } as const;

let counter = 1;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${counter++}`;
const invNo = () => `TBZ-${Math.floor(100000 + (Date.now() % 900000))}`;

type AppState = {
  bookings: Booking[];
  notifications: AppNotification[];
  conversations: Conversation[];
  orders: Order[];
  projects: Project[];
  estimates: SavedEstimate[];
  invoices: Invoice[];
  savedDesigns: SavedDesign[];
  studioPro: StudioProSub | null;

  addOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  addConversation: (c: Omit<Conversation, "id" | "createdAt">) => Conversation;
  addProject: (p: Omit<Project, "id" | "createdAt" | "status" | "progress"> & { status?: ProjectStatus; progress?: number }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addEstimate: (e: Omit<SavedEstimate, "id" | "createdAt">) => SavedEstimate;
  addInvoice: (i: Omit<Invoice, "id" | "createdAt" | "number" | "status"> & { status?: Invoice["status"] }) => Invoice;
  saveDesign: (d: { prompt: string; src: string }) => void;
  activateStudioPro: (ref: string) => void;
  recordStudioGeneration: (kind: "image" | "video") => void;
  unreadCount: () => number;
  clearAll: () => void;
};

export const useAppData = create<AppState>()(
  persist(
    (set, get) => ({
      bookings: [],
      notifications: [],
      conversations: [],
      orders: [],
      projects: [],
      estimates: [],
      invoices: [],
      savedDesigns: [],
      studioPro: null,

      addOrder: (o) => {
        const order: Order = { ...o, id: uid("ord"), status: "processing", createdAt: Date.now() };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      addBooking: (b) => {
        const booking: Booking = { ...b, id: uid("bkg"), status: "confirmed", createdAt: Date.now() };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },
      addNotification: (n) =>
        set((s) => ({ notifications: [{ ...n, id: uid("ntf"), read: false, createdAt: Date.now() }, ...s.notifications].slice(0, 60) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      addConversation: (c) => {
        const conv: Conversation = { ...c, id: uid("cnv"), createdAt: Date.now() };
        set((s) => ({ conversations: [conv, ...s.conversations] }));
        return conv;
      },
      addProject: (p) => {
        const project: Project = {
          ...p, id: uid("prj"), status: p.status ?? "planning", progress: p.progress ?? 5, createdAt: Date.now(),
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },
      updateProject: (id, patch) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      addEstimate: (e) => {
        const est: SavedEstimate = { ...e, id: uid("est"), createdAt: Date.now() };
        set((s) => ({ estimates: [est, ...s.estimates] }));
        return est;
      },
      addInvoice: (i) => {
        const inv: Invoice = { ...i, id: uid("inv"), number: invNo(), status: i.status ?? "paid", createdAt: Date.now() };
        set((s) => ({ invoices: [inv, ...s.invoices] }));
        return inv;
      },
      saveDesign: (d) => set((s) => ({ savedDesigns: [{ ...d, id: uid("dsn"), createdAt: Date.now() }, ...s.savedDesigns] })),
      activateStudioPro: (ref) =>
        set({
          studioPro: {
            ref, activatedAt: Date.now(), expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
            imagesUsed: 0, videosUsed: 0,
          },
        }),
      recordStudioGeneration: (kind) =>
        set((s) => s.studioPro
          ? {
              studioPro: {
                ...s.studioPro,
                imagesUsed: (s.studioPro.imagesUsed ?? 0) + (kind === "image" ? 1 : 0),
                videosUsed: (s.studioPro.videosUsed ?? 0) + (kind === "video" ? 1 : 0),
              },
            }
          : s),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
      clearAll: () => set({ bookings: [], notifications: [], conversations: [], orders: [], projects: [], estimates: [], invoices: [], savedDesigns: [], studioPro: null }),
    }),
    { name: "tobeez-app-data" },
  ),
);

/** Unified activity timeline across every module, newest first. */
export type ActivityItem = { id: string; title: string; detail: string; kind: string; at: number; href?: string };
type ActivitySource = Pick<AppState, "estimates" | "bookings" | "orders" | "projects" | "savedDesigns">;
export function selectActivity(s: ActivitySource): ActivityItem[] {
  const items: ActivityItem[] = [
    ...s.estimates.map((e) => ({ id: e.id, title: "AI estimate generated", detail: e.category ?? "Estimate", kind: "estimate", at: e.createdAt, href: "/dashboard/estimates" })),
    ...s.bookings.map((b) => ({ id: b.id, title: "Consultation booked", detail: `${b.type} · ${b.consultantName}`, kind: "booking", at: b.createdAt, href: "/dashboard/consultations" })),
    ...s.orders.map((o) => ({ id: o.id, title: "Order placed", detail: `${o.items.length} item(s)`, kind: "order", at: o.createdAt, href: "/dashboard/orders" })),
    ...s.projects.map((p) => ({ id: p.id, title: "Project created", detail: p.name, kind: "project", at: p.createdAt, href: "/dashboard/projects" })),
    ...s.savedDesigns.map((d) => ({ id: d.id, title: "AI design saved", detail: d.prompt.slice(0, 40), kind: "ai", at: d.createdAt, href: "/dashboard/documents" })),
  ];
  return items.sort((a, b) => b.at - a.at);
}
