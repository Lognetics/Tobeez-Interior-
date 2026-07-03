import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * Brand logo: the real TOBEEZ INTERIORS "Ti" monogram (public/brand/monogram.png,
 * transparent) paired with the wordmark. Set `showText={false}` to render the
 * monogram alone. The full lockup lives at public/brand/logo.png.
 */
export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative size-9 shrink-0 transition-transform group-hover:scale-105">
        <Image src="/brand/monogram.png" alt={site.name} fill sizes="40px" className="object-contain" priority />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">{site.shortName}</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Interiors
          </span>
        </span>
      )}
    </Link>
  );
}
