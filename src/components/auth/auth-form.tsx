"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/**
 * Stubbed auth form. Wire `onSubmit` to NextAuth / Clerk / your API later,
 * the UI does not need to change. Social buttons are placeholders.
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulated auth, replace with a real provider call.
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {isLogin ? "Sign in to your TOBEEZ workspace." : "Start estimating and planning in minutes."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {["Google", "Apple"].map((p) => (
          <Button key={p} type="button" variant="outline" className="w-full">
            {p}
          </Button>
        ))}
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or continue with email <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Jane Doe" required />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@email.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isLogin && <Link href="#" className="text-xs text-primary hover:underline">Forgot?</Link>}
          </div>
          <Input id="password" type="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Mail />}
          {isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "New to TOBEEZ? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-primary hover:underline">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
