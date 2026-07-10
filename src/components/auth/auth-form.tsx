"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

/** Real Supabase authentication. Protected APIs never accept a local-only session. */
export function AuthForm({
  mode,
  nextPath = "/dashboard",
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const router = useRouter();
  const signIn = useSession((state) => state.signIn);
  const user = useSession((state) => state.user);
  const authReady = useSession((state) => state.authReady);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const isLogin = mode === "login";

  // Already signed in — including OAuth returns the proxy bounced here before
  // the browser could detect the new session — so go straight to the workspace.
  React.useEffect(() => {
    if (authReady && user) router.replace(nextPath);
  }, [authReady, user, nextPath, router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const nameField = String(form.get("name") || "").trim();
    const name = nameField || email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    try {
      const result = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          });

      if (result.error) throw result.error;
      if (!result.data.session) {
        setNotice("Account created. Check your email to confirm your address, then sign in.");
        setLoading(false);
        return;
      }

      const verifiedName = String(result.data.user?.user_metadata?.full_name || name);
      signIn({ name: verifiedName, email });
      router.replace(nextPath);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Please try again.");
      setLoading(false);
    }
  }

  async function continueWith(provider: "google" | "apple") {
    setLoading(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${nextPath}` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
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
        {(["google", "apple"] as const).map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={() => continueWith(provider)}
          >
            {provider === "google" ? "Google" : "Apple"}
          </Button>
        ))}
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or continue with email <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div role="status" className="flex gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{notice}</span>
          </div>
        )}

        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Jane Doe" required />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@email.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isLogin && <span className="text-xs text-muted-foreground">Minimum 6 characters</span>}
          </div>
          <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Mail />}
          {isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "New to TOBEEZ? " : "Already have an account? "}
        <Link
          href={`${isLogin ? "/signup" : "/login"}?next=${encodeURIComponent(nextPath)}`}
          className="font-medium text-primary hover:underline"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
