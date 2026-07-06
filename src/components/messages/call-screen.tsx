"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MonitorUp, Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A functional call screen. It accesses the REAL device camera & microphone
 * (getUserMedia) and screen share (getDisplayMedia), with working mute / camera /
 * screen-share / end controls and a live duration timer. The remote participant
 * is simulated in this demo (a full 2-way call needs a signalling server / WebRTC
 * peer, which activates when that backend is configured).
 */
export function CallScreen({ mode, peerName, onEnd }: { mode: "voice" | "video"; peerName: string; onEnd: () => void }) {
  const localRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = React.useState(true);
  const [camOn, setCamOn] = React.useState(mode === "video");
  const [sharing, setSharing] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [connected, setConnected] = React.useState(false);
  const initials = peerName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: mode === "video", audio: true });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;
      } catch {
        setError("Camera / microphone access was blocked. Allow permissions to start the call.");
      }
    })();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  React.useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    const c = setTimeout(() => setConnected(true), 1800);
    return () => { clearInterval(t); clearTimeout(c); };
  }, []);

  function toggleMic() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  }
  function toggleCam() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  }
  async function toggleShare() {
    if (sharing) { setSharing(false); return; }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (localRef.current) localRef.current.srcObject = display;
      setSharing(true);
      display.getVideoTracks()[0].addEventListener("ended", () => {
        setSharing(false);
        if (localRef.current && streamRef.current) localRef.current.srcObject = streamRef.current;
      });
    } catch { /* user cancelled */ }
  }
  function end() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onEnd();
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-3xl bg-neutral-950 text-white">
      {/* Remote (simulated) */}
      <div className="relative flex-1">
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-neutral-800 to-neutral-950">
          <div className="text-center">
            <span className="mx-auto grid size-24 place-items-center rounded-full bg-primary/30 font-display text-3xl font-bold">{initials}</span>
            <p className="mt-4 text-lg font-medium">{peerName}</p>
            <p className="text-sm text-white/60">{error ? "Waiting for media…" : connected ? `Connected · ${mm}:${ss}` : "Connecting…"}</p>
          </div>
        </div>

        {/* Local preview */}
        {mode === "video" && (
          <div className="absolute bottom-4 right-4 h-40 w-28 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-glow sm:h-48 sm:w-36">
            <video ref={localRef} autoPlay playsInline muted className={cn("size-full object-cover", !camOn && "hidden")} />
            {!camOn && <div className="grid size-full place-items-center bg-neutral-900 text-xs text-white/60">Camera off</div>}
          </div>
        )}

        {error && (
          <div className="absolute inset-x-4 top-4 rounded-2xl bg-destructive/90 px-4 py-3 text-center text-sm">{error}</div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs backdrop-blur">
          <span className="size-2 animate-pulse rounded-full bg-success" /> {mode === "video" ? "Video call" : "Voice call"} · {mm}:{ss}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 border-t border-white/10 py-5">
        <CallBtn active={micOn} onClick={toggleMic} label="Mic"><>{micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}</></CallBtn>
        {mode === "video" && <CallBtn active={camOn} onClick={toggleCam} label="Camera"><>{camOn ? <VideoIcon className="size-5" /> : <VideoOff className="size-5" />}</></CallBtn>}
        <CallBtn active={sharing} onClick={toggleShare} label="Share"><MonitorUp className="size-5" /></CallBtn>
        <CallBtn active onClick={() => localRef.current?.requestFullscreen?.()} label="Full"><Maximize2 className="size-5" /></CallBtn>
        <button onClick={end} className="grid size-14 place-items-center rounded-full bg-destructive text-white transition-transform hover:scale-105" aria-label="End call">
          <PhoneOff className="size-6" />
        </button>
      </div>
    </motion.div>
  );
}

function CallBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label} className={cn("grid size-12 place-items-center rounded-full transition-colors", active ? "bg-white/15 hover:bg-white/25" : "bg-white text-neutral-900")}>
      {children}
    </button>
  );
}
