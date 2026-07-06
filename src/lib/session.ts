"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Lightweight client session. Stands in for a real auth provider
 * (NextAuth/Clerk) so personalized greetings, gating and dashboards work
 * end-to-end offline. Swap `signIn` to call a real backend later.
 */
export type SessionUser = {
  name: string;
  email: string;
  role: "client" | "consultant" | "vendor" | "admin";
  initials: string;
};

type SessionState = {
  user: SessionUser | null;
  signIn: (u: Partial<SessionUser> & { name: string; email: string }) => void;
  signOut: () => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      // Default demo user so dashboards feel populated out of the box.
      user: { name: "Light Ade", email: "light@example.com", role: "client", initials: "LA" },
      signIn: (u) =>
        set({
          user: {
            role: "client",
            ...u,
            initials: initials(u.name),
          } as SessionUser,
        }),
      signOut: () => set({ user: null }),
    }),
    { name: "tobeez-session" },
  ),
);

/** Time-aware greeting, e.g. "Good afternoon, Light". */
export function useGreeting() {
  const user = useSession((s) => s.user);
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = user?.name?.split(" ")[0] ?? "there";
  return { greeting: `${part}, ${first}`, user };
}
