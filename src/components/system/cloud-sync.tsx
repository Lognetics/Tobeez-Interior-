"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import { useAppData } from "@/lib/store/app-data";
import { getSessionUserId, pullOrSeed, push } from "@/lib/supabase/sync";

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
      const uid = await getSessionUserId();
      if (!mounted) return;
      userIdRef.current = uid;
      if (uid) await pullOrSeed(uid);
    }
    activate();

    // Re-run when auth state changes (login / logout).
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      userIdRef.current = session?.user?.id ?? null;
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
