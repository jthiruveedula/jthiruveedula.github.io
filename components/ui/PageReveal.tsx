"use client";

// Runs a 4-stage GSAP timeline:
//   1) Neon grid + vignette fade in (0.5s)
//   2) Eyebrow line draws (synced with Hero headline ScrambleText)
//   3) Subtitle, tags, CTAs stagger in
//   4) Scroll indicator reveals last
// All stages guard against prefers-reduced-motion and clean up GSAP contexts.

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

const REVEAL_DONE_FLAG = "__pageRevealDone" as const;
const REVEAL_COMPLETE_EVENT = "pagereveal:complete" as const;

export function isPageRevealDone(): boolean {
  if (typeof window === "undefined") return true;
  return Boolean((window as unknown as Record<string, unknown>)[REVEAL_DONE_FLAG]);
}

export function onPageRevealComplete(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (isPageRevealDone()) {
    handler();
    return () => {};
  }
  const listener = () => handler();
  window.addEventListener(REVEAL_COMPLETE_EVENT, listener, { once: true });
  return () => window.removeEventListener(REVEAL_COMPLETE_EVENT, listener);
}

function markRevealDone(): void {
  (window as unknown as Record<string, unknown>)[REVEAL_DONE_FLAG] = true;
  window.dispatchEvent(new CustomEvent(REVEAL_COMPLETE_EVENT));
}

interface PageRevealProps {
  children: ReactNode;
  className?: string;
}

export default function PageReveal({ children, className = "" }: PageRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const eyebrow = root.querySelector<HTMLElement>(".hero-eyebrow-line");
    const sub = root.querySelector<HTMLElement>(".hero-sub");
    const tags = root.querySelector<HTMLElement>(".hero-tags");
    const ctas = root.querySelectorAll<HTMLElement>(".hero-cta a");
    const scroll = root.querySelector<HTMLElement>(".scroll-indicator");
    const grid = gridRef.current;

    if (reduced) {
      gsap.set([sub, tags, ...Array.from(ctas), scroll].filter(Boolean), {
        opacity: 1,
        clearProps: "transform,filter",
      });
      if (eyebrow) gsap.set(eyebrow, { scaleX: 1, clearProps: "transform" });
      if (grid) gsap.set(grid, { autoAlpha: 0 });
      markRevealDone();
      return;
    }

    if (eyebrow) gsap.set(eyebrow, { scaleX: 0, transformOrigin: "left center", opacity: 1 });
    if (sub) gsap.set(sub, { opacity: 0, y: 14, filter: "blur(6px)" });
    if (tags) gsap.set(tags, { opacity: 0, y: 8 });
    gsap.set(Array.from(ctas), { opacity: 0, y: 12, scale: 0.96 });
    if (scroll) gsap.set(scroll, { opacity: 0, y: 10 });
    if (grid) gsap.set(grid, { autoAlpha: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => markRevealDone(),
      });
      tlRef.current = tl;

      // Stage 1 — grid + vignette fade in (0.4s)
      tl.add("grid", 0).to(
        grid,
        { autoAlpha: 0.55, duration: 0.4, ease: "power2.out" },
        "grid"
      );

      // Stage 2 — eyebrow line draws while Hero headline ScrambleText runs
      // (ScrambleText for "Generative AI" with duration=1.0, stagger=0.03
      //  resolves around 1.27s after mount; we sync the rest to that.)
      tl.to(
        eyebrow,
        { scaleX: 1, duration: 0.55, ease: "power2.out" },
        "grid+=0.2"
      );

      // Stage 3 — stagger subtitle, tags, CTAs once headline is settled
      tl.add("settle", "grid+=1.0");
      tl.to(
        sub,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5 },
        "settle"
      );
      tl.to(
        tags,
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04 },
        "settle+=0.1"
      );
      tl.to(
        ctas,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(1.2)",
        },
        "settle+=0.25"
      );

      // Stage 4 — scroll indicator last, then grid fades out
      tl.to(
        scroll,
        { opacity: 1, y: 0, duration: 0.45 },
        "settle+=0.6"
      );
      tl.to(
        grid,
        { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" },
        "settle+=0.75"
      );

      tl.call(() => {
        const primary = root.querySelector<HTMLElement>(".hero-cta-primary");
        if (primary) {
          gsap.to(primary, {
            boxShadow: "0 0 30px var(--color-glow), 0 0 60px var(--color-glow)",
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      }, [], "settle+=0.9");
    }, wrapperRef);

    const maxGuard = window.setTimeout(() => {
      tlRef.current?.kill();
      markRevealDone();
    }, 6000);

    return () => {
      ctx.revert();
      tlRef.current?.kill();
      window.clearTimeout(maxGuard);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {children}
      <div
        ref={gridRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: [
            "linear-gradient(var(--color-accent-muted) 1px, transparent 1px)",
            "linear-gradient(90deg, var(--color-accent-muted) 1px, transparent 1px)",
            "radial-gradient(ellipse at center, transparent 35%, color-mix(in srgb, var(--color-bg) 70%, transparent) 100%)",
          ].join(", "),
          backgroundSize: "64px 64px, 64px 64px, 100% 100%",
          backgroundPosition: "0 0, 0 0, center",
          mixBlendMode: "screen",
          opacity: 0,
          willChange: "opacity",
        }}
      />
    </div>
  );
}
