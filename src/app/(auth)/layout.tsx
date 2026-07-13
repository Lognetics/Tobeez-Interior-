import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TOBEEZ INTERIOR
        </p>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -right-20 top-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-16 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div />
          <div>
            <h2 className="max-w-md font-display text-4xl font-bold leading-tight">
              Intelligent interior planning, from estimate to installation.
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Plan, budget and furnish beautiful spaces with AI on TOBEEZ.
            </p>
          </div>
          <div className="flex gap-8">
            {[["20", "Projects"], ["1", "Country"], ["4.9★", "Avg rating"]].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-2xl font-bold">{v}</p>
                <p className="text-sm text-primary-foreground/70">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
