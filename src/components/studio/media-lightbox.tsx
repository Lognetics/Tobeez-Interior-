"use client";

import * as React from "react";
import { X } from "lucide-react";

export type LightboxMedia = { kind: "image" | "video"; url: string; alt?: string };

/** Full-screen preview for chat media. Closes on backdrop click, X, or Escape. */
export function MediaLightbox({ media, onClose }: { media: LightboxMedia | null; onClose: () => void }) {
  React.useEffect(() => {
    if (!media) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [media, onClose]);

  if (!media) return null;

  return (
    <div
      className="fixed inset-0 z-100 grid place-items-center bg-black/85 p-4 sm:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        aria-label="Close preview"
      >
        <X className="size-5" />
      </button>
      {media.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={media.alt ?? "Preview"}
          className="max-h-[88dvh] max-w-[94vw] rounded-2xl object-contain shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <video
          src={media.url}
          controls
          autoPlay
          playsInline
          className="max-h-[88dvh] max-w-[94vw] rounded-2xl shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </div>
  );
}
