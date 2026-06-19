"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/data";
import ArchDiagram from "@/components/ui/ArchDiagram";
import TypewriterText from "@/components/ui/TypewriterText";
import { EASE, DUR, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: number | null;
  prefix: string;
  suffix: string;
  label: string;
  icon: string;
}

const STATS: Stat[] = [
  { value: 6, prefix: "", suffix: "+", label: "Production GenAI", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { value: 12, prefix: "", suffix: "M+", label: "RAG Pipelines", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { value: null, prefix: "GCP", suffix: "", label: "Data Platforms", icon: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" },
  { value: 60, prefix: "", suffix: "%", label: "Latency Cut", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
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
    gsap.set(".about-bio-line", { opacity: 0, y: 16 });
    gsap.set(".about-stat", { opacity: 0, y: 30, scale: 0.95 });
    gsap.set(".about-stat-glow", { opacity: 0 });

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      });

      masterTl.fromTo(".about-eyebrow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.soft }, 0);

      masterTl.fromTo(".about-heading-underline", { maxWidth: "0%" }, { maxWidth: "100%", duration: 1.0, ease: EASE.soft }, 0.3);

      masterTl.fromTo(".about-bio-line", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.soft, stagger: 0.08 }, 0.4);

      masterTl.add("stats", 0.6);
      masterTl.fromTo(".about-stat", { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: DUR.base, ease: EASE.snap, stagger: 0.08 }, "stats");
      masterTl.fromTo(".about-stat-glow", { opacity: 0 }, { opacity: 1, duration: DUR.base, ease: EASE.soft, stagger: 0.08 }, "stats+=0.2");

      masterTl.add("countup", "stats+=0.4");
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

  const buildBioLines = (text: string) => {
    const sentences = text.split(/(?<=[.!])\s+/);
    return sentences.map((sentence, i) => (
      <span key={i} className="about-bio-line inline" style={{ display: "inline" }}>
        {sentence}{" "}
      </span>
    ));
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-16 md:py-20 border-t overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-glass-border)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-accent) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <p
              className="about-eyebrow section-eyebrow mb-3"
              style={{ color: "var(--color-accent)" }}
            >
              About
            </p>
            <div className="mb-5">
              <TypewriterText
                text="GCP Data Architect."
                className="text-xl md:text-2xl font-semibold tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
                duration={1.2}
                stagger={0.04}
                showCursor
              />
              <span
                className="about-heading-underline block h-[2px] max-w-0 origin-left"
                style={{ backgroundColor: "var(--color-accent)" }}
              />
            </div>
            <div
              className="text-sm leading-relaxed font-light mb-8"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {siteConfig.bio.map((paragraph, i) => (
                <p key={i}>{buildBioLines(paragraph)}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="about-stat group relative rounded-xl border p-3 md:p-4 overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)]/30"
                  style={{
                    borderColor: "var(--color-glass-border)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <div
                    className="about-stat-glow absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, var(--color-accent) 0%, transparent 70%)`,
                      opacity: 0.06,
                    }}
                  />
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="var(--color-accent)"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                    <div
                      ref={(el) => { numRefs.current[i] = el; }}
                      className="text-lg md:text-xl font-bold font-mono"
                      style={{
                        color: stat.value === null
                          ? "var(--color-accent-tertiary)"
                          : "var(--color-accent)",
                      }}
                    >
                      {stat.value === null ? stat.prefix : `0${stat.suffix}`}
                    </div>
                  </div>
                  <div
                    ref={(el) => { labelRefs.current[i] = el; }}
                    className="font-mono text-[9px] md:text-[10px] tracking-wider uppercase"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <ArchDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
