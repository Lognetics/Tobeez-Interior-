"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useAppData } from "@/lib/store/app-data";
import { pullOrSeed, push } from "@/lib/supabase/sync";
import { useSession } from "@/lib/session";

function mirrorAuthUser(user: User | null) {
  const session = useSession.getState();
  if (!user) {
    session.signOut();
    session.setAuthReady(true);
    return;
  }

  const metadataName = typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name.trim()
    : "";
  // OAuth providers supply a profile photo (Google: avatar_url/picture).
  const avatarUrl = typeof user.user_metadata?.avatar_url === "string"
    ? user.user_metadata.avatar_url
    : typeof user.user_metadata?.picture === "string"
      ? user.user_metadata.picture
      : undefined;
  const email = user.email ?? "";
  const fallbackName = email
    ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "TOBEEZ member";
  session.signIn({ name: metadataName || fallbackName, email, avatarUrl });
  session.setAuthReady(true);
}

/**
 * Mounts once (in Providers). Everything runs in effects — never during render —
 * so it cannot cause hydration issues. It hydrates the store from the cloud on
 * login and debounces writes back on every change. Silent no-op without a session.
 */
export function CloudSync() {
  const userIdRef = React.useRef<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function activate() {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      const user = error ? null : data.user;
      mirrorAuthUser(user);
      const uid = user?.id ?? null;
      userIdRef.current = uid;
      if (uid) await pullOrSeed(uid);
    }
    activate();

    // Re-run when auth state changes (login / logout).
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      userIdRef.current = session?.user?.id ?? null;
      mirrorAuthUser(session?.user ?? null);
      if (userIdRef.current) pullOrSeed(userIdRef.current);
    });

    // Debounced write-back on any store change.
    const unsub = useAppData.subscribe(() => {
      if (!userIdRef.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (userIdRef.current) push(userIdRef.current);
      }, 900);
    });

    return () => {
      mounted = false;
      authSub.subscription.unsubscribe();
      unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
