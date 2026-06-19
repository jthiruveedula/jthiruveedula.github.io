"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/data";
import { useSound } from "@/hooks/useSound";

export default function Footer() {
  const { play } = useSound();
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="relative border-t py-16 overflow-hidden transition-all duration-700" style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-bg)", boxShadow: "0 -1px 0 0 var(--color-glass-border), var(--neon-shadow-sm)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}>
      <div className="cyber-grid absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }} />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-10 md:gap-6 mb-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline">
              <span className="neon-glow-text font-mono text-xl font-semibold" style={{ color: "var(--color-accent)" }}>JT</span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{siteConfig.name}</p>
            <p className="font-mono text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {siteConfig.role}
              <br />
              {siteConfig.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--color-text-muted)" }}>Connect</p>
            <div className="flex flex-col gap-2">
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener"
                className="font-mono text-sm transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; play("tick"); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
              >
                LinkedIn ↗
              </a>
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener"
                className="font-mono text-sm transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; play("tick"); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
              >
                GitHub ↗
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-mono text-sm transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; play("tick"); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
              >
                Email ↗
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--color-text-muted)" }}>Stack</p>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>Next.js · Tailwind · GSAP + ScrollTrigger</span>
              <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>GSAP ScrollSmoother · Playwright</span>
              <span className="font-mono text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>{siteConfig.location}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3" style={{ borderColor: "var(--color-glass-border)" }}>
          <p className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            © {year} {siteConfig.name} · All rights reserved
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            Built on Next.js · Deployed on GitHub Pages · Animations by GSAP
          </p>
        </div>
      </div>
    </footer>
  );
}
