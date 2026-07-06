"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Check, LogOut, Trash2 } from "lucide-react";
import { DashHeader } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useSession } from "@/lib/session";
import { useAppData } from "@/lib/store/app-data";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")} role="switch" aria-checked={checked}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "GHS", "KES"];

export default function SettingsPage() {
  const router = useRouter();
  const { user, preferences, updateProfile, updatePreferences, signOut } = useSession();
  const clearAll = useAppData((s) => s.clearAll);
  const { theme, setTheme } = useTheme();

  const [form, setForm] = React.useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", location: user?.location ?? "" });
  const [saved, setSaved] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  function saveProfile() {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <>
      <DashHeader title="Settings" subtitle="Manage your profile, preferences and account." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display font-semibold">Profile</h2>
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234…" /></div>
                <div className="space-y-2"><Label htmlFor="loc">Location</Label><Input id="loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lagos, NG" /></div>
              </div>
              <Button onClick={saveProfile}>{saved ? <><Check /> Saved</> : "Save changes"}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display font-semibold">Preferences</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Preferred currency</Label>
                <select value={preferences.currency} onChange={(e) => updatePreferences({ currency: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Appearance</Label>
                <div className="flex gap-2">
                  {["light", "dark", "system"].map((t) => (
                    <button key={t} onClick={() => setTheme(t)} className={cn("flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition-colors", mounted && theme === t ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}>{t}</button>
                  ))}
                </div>
              </div>
              {([["Email notifications", "emailNotifs"], ["Push notifications", "pushNotifs"], ["Product updates & offers", "marketing"]] as const).map(([label, key]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Toggle checked={preferences[key]} onChange={(v) => updatePreferences({ [key]: v })} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h2 className="font-display font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">Sign out, or clear all locally stored activity data.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { if (confirm("Clear all your local activity (projects, estimates, orders, messages)?")) clearAll(); }}>
                <Trash2 className="size-4" /> Clear data
              </Button>
              <Button variant="destructive" onClick={() => { signOut(); router.push("/"); }}>
                <LogOut className="size-4" /> Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
