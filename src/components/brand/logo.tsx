import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * ⭐️ TO USE YOUR OWN LOGO:
 *   1. Save it to `public/brand/logo.png` (or .svg).
 *   2. Set LOGO_SRC below to "/brand/logo.png".
 * Leave it null to use the built-in terracotta "house" mark.
 */
const LOGO_SRC: string | null = null;

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      {LOGO_SRC ? (
        <span className="relative size-9 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
          <Image src={LOGO_SRC} alt={site.name} fill sizes="36px" className="object-contain" />
        </span>
      ) : (
        <span className="relative grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
            <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-tight">{site.shortName}</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Interiors
        </span>
      </span>
    </Link>
  );
}
