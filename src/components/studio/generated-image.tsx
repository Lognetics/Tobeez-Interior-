"use client";

import * as React from "react";
import { Bookmark, Check, Download, Loader2, RefreshCw } from "lucide-react";
import { buildImageUrl, fallbackImage } from "@/lib/ai/client";
import { useAppData } from "@/lib/store/app-data";
import { cn } from "@/lib/utils";

/**
 * A single REAL AI-generated image. Generation happens when the browser loads
 * the URL. If the free image tier is busy/rate-limited, it AUTO-FALLS BACK to a
 * relevant stored interior photo so an image is ALWAYS shown. Users can retry
 * live generation any time.
 */
export function GeneratedImage({ prompt, size = 512 }: { prompt: string; size?: number }) {
  const [seed, setSeed] = React.useState(() => Math.floor(Math.random() * 1_000_000));
  const [status, setStatus] = React.useState<"loading" | "ok" | "fallback">("loading");
  const [saved, setSaved] = React.useState(false);
  const saveDesign = useAppData((s) => s.saveDesign);

  const liveUrl = buildImageUrl(prompt, { width: size, height: size, seed });
  const libUrl = fallbackImage(prompt, seed);
  const shownUrl = status === "fallback" ? libUrl : liveUrl;

  function retry() {
    setStatus("loading");
    setSeed(Math.floor(Math.random() * 1_000_000));
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 grid place-items-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-xs">Generating…</span>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${status}-${seed}`}
        src={shownUrl}
        alt={prompt}
        className={cn("size-full object-cover transition-opacity duration-500", status === "loading" ? "opacity-0" : "opacity-100")}
        onLoad={() => setStatus((s) => (s === "loading" ? "ok" : s))}
        onError={() => setStatus("fallback")}
      />

      {status === "fallback" && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          From library
        </span>
      )}

      {status !== "loading" && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={retry} className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Regenerate" title="Try live generation again"><RefreshCw className="size-4" /></button>
          <a href={shownUrl} download="tobeez-design.jpg" target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Download"><Download className="size-4" /></a>
          <button onClick={() => { saveDesign({ prompt, src: shownUrl }); setSaved(true); }} className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Save to project">
            {saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
