"use client";

import { useEffect, useState } from "react";

const themes = [
  { id: "noir", label: "Noir", dot: "bg-slate-400" },
  { id: "golden", label: "Golden", dot: "bg-amber-400" },
  { id: "teal-orange", label: "Teal & Orange", dot: "bg-cyan-400" },
  { id: "crimson", label: "Crimson", dot: "bg-red-400" },
] as const;

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string>("noir");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("film-grade-theme");
    if (saved && themes.some((t) => t.id === saved)) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "noir");
    }
  }, []);

  const cycleTheme = () => {
    const idx = themes.findIndex((t) => t.id === theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next.id);
    document.documentElement.setAttribute("data-theme", next.id);
    localStorage.setItem("film-grade-theme", next.id);
  };

  if (!mounted) return null;

  const current = themes.find((t) => t.id === theme)!;

  return (
    <button
      onClick={cycleTheme}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-full glass glass-hover cursor-pointer group"
      aria-label="Switch film grade mood"
      title={`Current: ${current.label}. Click to cycle.`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot} transition-all`} />
      <span className="font-mono text-[9px] text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-300">
        {current.label}
      </span>
    </button>
  );
}
