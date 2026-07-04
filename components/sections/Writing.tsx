"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export default function Writing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".writing-eyebrow, .writing-heading, .writing-body, .writing-badge", {
        opacity: 0,
        y: 16,
        duration: 0.7,
        stagger: 0.1,
        ease: EASE.cinematic,
        scrollTrigger: { trigger: "#writing", start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="writing"
      ref={sectionRef}
      className="relative py-24 border-t"
      style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-xl">
        <p className="writing-eyebrow section-eyebrow" style={{ color: "var(--color-accent)" }}>
          Writing
        </p>
        <h2
          className="writing-heading text-xl md:text-2xl font-semibold tracking-tight mt-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Thinking out loud.
        </h2>
        <p
          className="writing-body mt-3 text-sm font-light leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Long-form notes on RAG architecture, agentic systems, and GCP cost optimization — coming soon.
        </p>
        <span
          className="writing-badge inline-flex items-center mt-5 font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border"
          style={{
            borderColor: "var(--color-glass-border)",
            color: "var(--color-text-muted)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          Coming soon
        </span>
      </div>
    </section>
  );
}
