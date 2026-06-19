"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/data";
import ArchDiagram from "@/components/ui/ArchDiagram";
import { EASE, DUR, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: number | null;
  prefix: string;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 6, prefix: "", suffix: "+", label: "Production GenAI" },
  { value: 12, prefix: "", suffix: "M+", label: "RAG Pipelines" },
  { value: null, prefix: "GCP", suffix: "", label: "Data Platforms" },
  { value: 60, prefix: "", suffix: "%", label: "Latency Cut" },
];

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKMNOPQRSTUVWXYZ0123456789";

function scrambleTo(el: HTMLElement, final: string, duration = 0.6): void {
  if (typeof window === "undefined") return;
  const start = performance.now();
  const len = final.length;
  function frame(now: number) {
    const elapsed = now - start;
    const t = Math.min(elapsed / (duration * 1000), 1);
    let out = "";
    for (let i = 0; i < len; i++) {
      if (final[i] === " ") {
        out += " ";
        continue;
      }
      const settleAt = 0.3 + (i / Math.max(len - 1, 1)) * 0.7;
      if (t < settleAt) {
        out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      } else {
        out += final[i];
      }
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = final;
  }
  requestAnimationFrame(frame);
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const numRefs = useRef<Array<HTMLDivElement | null>>([]);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;
    const reduced = prefersReducedMotion();

    if (reduced) {
      STATS.forEach((stat, i) => {
        const numEl = numRefs.current[i];
        if (numEl) {
          const finalText = stat.value === null
            ? stat.prefix
            : `${stat.prefix}${stat.value}${stat.suffix}`;
          numEl.textContent = finalText;
        }
        const labelEl = labelRefs.current[i];
        if (labelEl) labelEl.textContent = stat.label;
      });
      return;
    }

    gsap.set(".about-eyebrow", { opacity: 0, y: 20 });
    gsap.set(".bio-char", { opacity: 0 });
    gsap.set(".bg-flow-line", { opacity: 0, x: -60 });

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      });

      masterTl.fromTo(".about-eyebrow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.soft }, 0);
      masterTl.fromTo(".bio-char", { opacity: 0 }, { opacity: 1, duration: 0.04, stagger: 0.04, ease: "none" }, 0.1);
      masterTl.fromTo(".bg-flow-line", { opacity: 0, x: -60 }, { opacity: 1, x: 0, stagger: 0.06, duration: DUR.hero, ease: EASE.soft }, 0.2);

      masterTl.add("cards", 0.3);
      masterTl.fromTo(".about-stat", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.soft, stagger: 0.1 }, "cards");

      masterTl.add("countup", "cards+=0.3");
      STATS.forEach((stat, i) => {
        const numEl = numRefs.current[i];
        const labelEl = labelRefs.current[i];
        if (!numEl || !labelEl) return;
        if (stat.value === null) {
          numEl.textContent = stat.prefix;
          return;
        }
        const target = stat.value;
        const obj = { v: 0 };
        masterTl.to(obj, {
          v: target,
          duration: DUR.hero,
          ease: EASE.soft,
          onUpdate: () => {
            numEl.textContent = `${stat.prefix}${Math.floor(obj.v)}${stat.suffix}`;
          },
          onComplete: () => {
            numEl.textContent = `${stat.prefix}${target}${stat.suffix}`;
            scrambleTo(labelEl, stat.label, 0.5);
          },
        }, "countup");
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  const buildCharSpans = (text: string) =>
    text.split("").map((ch, i) => (
      <span key={i} className="bio-char" style={{ display: "inline" }}>
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 border-t overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-glass-border)",
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            className="bg-flow-line"
            x1="0"
            y1={`${(i + 1) * 8}%`}
            x2="100%"
            y2={`${(i + 1) * 8}%`}
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            strokeDasharray="8 12 4 8"
            opacity="0"
          />
        ))}
      </svg>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl">
          <div>
            <p
              className="about-eyebrow section-eyebrow"
              style={{ color: "var(--color-accent)" }}
            >
              About
            </p>
            <h2
              className="text-xl md:text-2xl font-semibold tracking-tight mb-8"
              style={{ color: "var(--color-text-primary)" }}
            >
              GCP Data Architect.
            </h2>
            <div
              className="space-y-3 text-sm leading-relaxed font-light"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {siteConfig.bio.map((paragraph, i) => (
                <p key={i}>{buildCharSpans(paragraph)}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="about-highlights mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="about-stat rounded-xl border p-4 relative overflow-hidden"
              style={{
                borderColor: "var(--color-glass-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, var(--color-accent) 8, transparent)`,
                }}
              />
              <div
                ref={(el) => { numRefs.current[i] = el; }}
                className="text-xl md:text-2xl font-bold font-mono relative z-10"
                style={{
                  color: stat.value === null
                    ? "var(--color-accent-tertiary)"
                    : "var(--color-accent)",
                }}
              >
                {stat.value === null ? stat.prefix : `0${stat.suffix}`}
              </div>
              <div
                ref={(el) => { labelRefs.current[i] = el; }}
                className="font-mono text-[10px] tracking-wider uppercase mt-1 relative z-10"
                style={{ color: "var(--color-text-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="arch-diagram mt-14 max-w-4xl mx-auto">
          <ArchDiagram />
        </div>
      </div>
    </section>
  );
}
