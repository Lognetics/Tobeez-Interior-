"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/store/app-data";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const notifications = useAppData((s) => s.notifications);
  const markAllRead = useAppData((s) => s.markAllRead);
  const markRead = useAppData((s) => s.markRead);
  React.useEffect(() => setMounted(true), []);

  const unread = mounted ? notifications.filter((n) => !n.read).length : 0;

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <Bell />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-glow"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground">You're all caught up.</p>
                ) : (
                  notifications.map((n) => {
                    const body = (
                      <div className={cn("flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60", !n.read && "bg-primary/5")}>
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                        </div>
                      </div>
                    );
                    return n.href ? (
                      <Link key={n.id} href={n.href} onClick={() => { markRead(n.id); setOpen(false); }}>{body}</Link>
                    ) : (
                      <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left">{body}</button>
                    );
                  })
                )}
              </div>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1.5 border-t border-border py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                <Check className="size-3.5" /> View activity timeline
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
