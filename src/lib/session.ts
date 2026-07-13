"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mirrorAuthCookie } from "@/lib/auth/cookie";

/**
 * Client mirror of the verified Supabase session. This state improves the UI,
 * but protected API routes always verify the Supabase access token themselves.
 */
export type SessionUser = {
  name: string;
  email: string;
  role: "client" | "consultant" | "vendor" | "admin";
  initials: string;
  avatarUrl?: string; // profile photo from OAuth providers (Google, Apple, …)
  phone?: string;
  location?: string;
};

export type Preferences = {
  currency: string;
  emailNotifs: boolean;
  pushNotifs: boolean;
  marketing: boolean;
};

const defaultPreferences: Preferences = { currency: "NGN", emailNotifs: true, pushNotifs: true, marketing: false };

type SessionState = {
  user: SessionUser | null;
  authReady: boolean;
  preferences: Preferences;
  signIn: (u: Partial<SessionUser> & { name: string; email: string }) => void;
  signOut: () => void;
  setAuthReady: (ready: boolean) => void;
  updateProfile: (patch: Partial<SessionUser>) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
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
      user: null,
      authReady: false,
      preferences: defaultPreferences,
      signIn: (u) => {
        mirrorAuthCookie(true);
        set({
          user: {
            role: "client",
            ...u,
            initials: initials(u.name),
          } as SessionUser,
        });
      },
      signOut: () => {
        mirrorAuthCookie(false);
        set({ user: null });
      },
      setAuthReady: (ready) => set({ authReady: ready }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch, initials: initials(patch.name ?? s.user.name) } } : s)),
      updatePreferences: (patch) => set((s) => ({ preferences: { ...s.preferences, ...patch } })),
    }),
    {
      name: "tobeez-session",
      version: 2,
      migrate: (persisted) => ({ ...(persisted as SessionState), user: null, authReady: false }),
      partialize: (state) => ({ preferences: state.preferences }) as SessionState,
    },
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
