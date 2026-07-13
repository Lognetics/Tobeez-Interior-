"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Button } from "@/components/ui/button";
import type { DashNavItem } from "@/lib/dashboard-nav";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function DashboardShell({
  nav,
  role,
  user,
  children,
}: {
  nav: DashNavItem[];
  role: string;
  user: { name: string; initials: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const sessionUser = useSession((s) => s.user);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // Even if the network call fails, clear the local session below.
    }
    // Clears the mirrored session and the auth cookie before navigating,
    // so the proxy doesn't bounce the next protected visit incorrectly.
    useSession.getState().signOut();
    router.replace("/");
  }

  // On the client dashboard, reflect the actually signed-in user.
  const display =
    mounted && role.toLowerCase() === "client" && sessionUser
      ? { name: sessionUser.name, initials: sessionUser.initials }
      : user;

  const NavLinks = (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href;
        const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border px-5 py-4"><Logo /></div>
        <div className="flex-1 overflow-y-auto p-3">{NavLinks}</div>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{display.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{display.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{role}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Sign out"
              title="Sign out"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              {signingOut ? <Icons.Loader2 className="size-4 animate-spin" /> : <Icons.LogOut className="size-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Logo />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><X /></Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3" onClick={() => setMobileOpen(false)}>{NavLinks}</div>
              <div className="border-t border-border p-3">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {signingOut ? <Icons.Loader2 className="size-4.5 animate-spin" /> : <Icons.LogOut className="size-4.5" />}
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border glass px-4 py-3 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu /></Button>
          <div className="relative hidden max-w-xs flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search…" className="h-10 w-full rounded-full bg-muted pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell />
            <span className="ml-1 grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{display.initials}</span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {mounted ? children : (
            <div className="space-y-4">
              <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
              </div>
              <div className="h-64 animate-pulse rounded-2xl bg-muted" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
