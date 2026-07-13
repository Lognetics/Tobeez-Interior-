"use client";

import * as React from "react";
import { Bookmark, Check, Download, Loader2, RefreshCw } from "lucide-react";
import {
  buildImageUrl,
  fallbackImage,
  generateImageAsset,
} from "@/lib/ai/client";
import type { StudioGeneratedImage } from "@/lib/ai/chat-store";
import { MediaLightbox, type LightboxMedia } from "./media-lightbox";
import { useAppData } from "@/lib/store/app-data";
import { cn } from "@/lib/utils";

export function GeneratedImage({ asset }: { asset: StudioGeneratedImage | string }) {
  const legacyPrompt = typeof asset === "string" ? asset : asset.prompt;
  const [current, setCurrent] = React.useState<StudioGeneratedImage>(() =>
    typeof asset === "string"
      ? {
          prompt: asset,
          url: buildImageUrl(asset, { width: 1536, height: 1024 }),
          provider: "Legacy open image model",
          model: "pollinations",
          grounded: false,
        }
      : asset,
  );
  const [status, setStatus] = React.useState<"loading" | "ok" | "fallback">("loading");
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");
  const [lightbox, setLightbox] = React.useState<LightboxMedia | null>(null);
  const saveDesign = useAppData((state) => state.saveDesign);
  const libraryUrl = fallbackImage(legacyPrompt);
  const shownUrl = status === "fallback" ? libraryUrl : current.url;

  async function retry() {
    setStatus("loading");
    setError("");
    try {
      const generated = await generateImageAsset({ prompt: legacyPrompt, aspect: "landscape" });
      setCurrent({
        url: generated.url,
        prompt: generated.prompt,
        provider: generated.provider,
        model: generated.model,
        grounded: generated.grounded,
      });
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Regeneration failed.");
      setStatus("fallback");
    }
  }

  return (
    <div>
      <div className="group relative aspect-[3/2] overflow-hidden rounded-2xl border border-border bg-muted">
        {status === "loading" && (
          <div className="absolute inset-0 z-10 grid place-items-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-xs">Generating high-quality visual…</span>
            </div>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shownUrl}
          alt={legacyPrompt}
          className={cn("size-full cursor-zoom-in object-cover transition-opacity duration-500", status === "loading" ? "opacity-0" : "opacity-100")}
          onClick={() => setLightbox({ kind: "image", url: shownUrl, alt: legacyPrompt })}
          onLoad={() => setStatus((value) => (value === "loading" ? "ok" : value))}
          onError={() => setStatus("fallback")}
        />

        {status !== "loading" && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button onClick={retry} className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Regenerate image"><RefreshCw className="size-4" /></button>
            <a href={shownUrl} download="tobeez-design.jpg" className="grid size-8 place-items-center rounded-full glass text-white" aria-label="Download image"><Download className="size-4" /></a>
            <button
              onClick={() => {
                saveDesign({ prompt: legacyPrompt, src: shownUrl });
                setSaved(true);
              }}
              className="grid size-8 place-items-center rounded-full glass text-white"
              aria-label="Save image to project"
            >
              {saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      <MediaLightbox media={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
