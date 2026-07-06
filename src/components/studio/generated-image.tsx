"use client";

import * as React from "react";
import { Bookmark, Check, Download, ImageOff, Loader2, RefreshCw } from "lucide-react";
import { buildImageUrl } from "@/lib/ai/client";
import { useAppData } from "@/lib/store/app-data";
import { cn } from "@/lib/utils";

/**
 * A single REAL AI-generated image. Generation happens when the browser loads
 * the URL. On failure (free-tier rate limit), the user can retry with a new seed.
 */
export function GeneratedImage({ prompt, size = 512 }: { prompt: string; size?: number }) {
  const [seed, setSeed] = React.useState(() => Math.floor(Math.random() * 1_000_000));
  const [status, setStatus] = React.useState<"loading" | "ok" | "error">("loading");
  const [saved, setSaved] = React.useState(false);
  const saveDesign = useAppData((s) => s.saveDesign);
  const url = buildImageUrl(prompt, { width: size, height: size, seed });

  function retry() {
    setStatus("loading");
    setSeed(Math.floor(Math.random() * 1_000_000));
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-xs">Generating…</span>
          </div>
        </div>
      )}
      {status === "error" ? (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <ImageOff className="size-6" />
            <span className="text-xs">Image service busy (free tier).</span>
            <button onClick={retry} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
              <RefreshCw className="size-3" /> Retry
            </button>
          </div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={seed}
          src={url}
          alt={prompt}
          className={cn("size-full object-cover transition-opacity duration-500", status === "ok" ? "opacity-100" : "opacity-0")}
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
        />
      )}

      {status === "ok" && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={retry} className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Regenerate"><RefreshCw className="size-4" /></button>
          <a href={url} download="tobeez-design.jpg" target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Download"><Download className="size-4" /></a>
          <button onClick={() => { saveDesign({ prompt, src: url }); setSaved(true); }} className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Save to project">
            {saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
