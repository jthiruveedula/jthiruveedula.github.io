"use client";

import { useEffect, useRef, useState } from "react";
import { useSound } from "@/hooks/useSound";

export default function SoundControl() {
  const { mode, volume, setMode, setVolume, initSound } = useSound();
  const [open, setOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (mode === "off") {
      setShowBadge(false);
      return;
    }
    setShowBadge(true);
    const t = setTimeout(() => setShowBadge(false), 3000);
    return () => clearTimeout(t);
  }, [mode]);

  const cycleMode = () => {
    initSound();
    const modes: Array<"off" | "low" | "on"> = ["off", "low", "on"];
    const idx = modes.indexOf(mode);
    setMode(modes[(idx + 1) % 3]);
  };

  const icon =
    mode === "off" ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    );

  return (
    <div ref={panelRef} className="fixed right-4 top-20 z-50 flex flex-col items-end gap-2">
      {showBadge && mode !== "off" && (
        <span
          className="font-mono text-[10px] px-2 py-1 rounded-full border transition-opacity duration-700"
          style={{
            borderColor: "var(--color-accent)",
            color: "var(--color-accent)",
            backgroundColor: "var(--color-surface)",
            boxShadow: "var(--neon-shadow-sm)",
            opacity: showBadge ? 1 : 0,
          }}
        >
          🔊 Sound on
        </span>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-mono transition-all duration-200 cursor-pointer"
        style={{
          borderColor: "var(--color-glass-border)",
          backgroundColor: "var(--color-surface)",
          color: mode === "off" ? "var(--color-text-muted)" : "var(--color-accent)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--neon-shadow-sm)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-glass-border)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
        aria-label="Sound controls"
      >
        {icon}
      </button>

      {open && (
        <div
          className="flex flex-col gap-4 p-4 rounded-2xl border min-w-[200px]"
          style={{
            borderColor: "var(--color-glass-border)",
            backgroundColor: "var(--color-surface)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: "var(--color-text-muted)" }}>Sound</span>
            <button
              onClick={cycleMode}
              className="font-mono text-xs px-2 py-1 rounded border transition-all cursor-pointer"
              style={{
                borderColor: "var(--color-glass-border)",
                color: mode === "off" ? "var(--color-text-muted)" : "var(--color-accent)",
                backgroundColor: mode !== "off" ? "var(--color-accent-muted)" : "transparent",
              }}
            >
              {mode === "off" ? "OFF" : mode === "low" ? "LOW" : "ON"}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>
              Volume
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(e) => {
                initSound();
                setVolume(Number(e.target.value) / 100);
              }}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${volume * 100}%, var(--color-glass-border) ${volume * 100}%, var(--color-glass-border) 100%)`,
                accentColor: "var(--color-accent)",
              }}
              aria-label="Sound volume"
            />
          </div>
        </div>
      )}
    </div>
  );
}
