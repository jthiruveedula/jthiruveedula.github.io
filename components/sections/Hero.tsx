"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/data";
import SplineContainer from "@/components/ui/SplineContainer";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let splitInstance: any = null;
    const ctx = gsap.context(() => {
      const SplitTypeClass = (window as any).SplitType;
      if (SplitTypeClass) {
        splitInstance = new SplitTypeClass(".hero-line", { types: "chars" });
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 20, duration: 0.5 });
      if (splitInstance?.chars?.length) {
        tl.from(splitInstance.chars, { opacity: 0, y: 40, rotateX: -45, duration: 0.5, stagger: 0.02 }, "-=0.2");
      } else {
        tl.from(".hero-line", { opacity: 0, y: 60, rotateX: -45, duration: 0.8, stagger: 0.12 }, "-=0.2");
      }
      tl.from(".hero-sub", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
        .from(".hero-tags", { opacity: 0, y: 10, duration: 0.4 }, "-=0.3")
        .from(".hero-cta", { opacity: 0, y: 15, duration: 0.4, stagger: 0.1 }, "-=0.2")
        .from(".scroll-indicator", { opacity: 0, duration: 0.5 }, "-=0.1");
      const container = sectionRef.current?.querySelector(".container");
      if (container) {
        gsap.to(container, {
          y: -80,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });
      }
    }, sectionRef);
    return () => {
      ctx.revert();
      splitInstance?.revert();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-svh flex items-center overflow-hidden isolate"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <SplineContainer className="opacity-40" intensity={20} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 40%, var(--color-bg) 100%)` }} />

      <div className="container relative z-10 mx-auto px-4 md:px-6 py-24">
        <div className="max-w-3xl">
          <p className="hero-eyebrow section-eyebrow">
            Data · RAG · Agents · Guardrails
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]" style={{ color: "var(--color-text-primary)" }}>
            <span className="hero-line block">Command Surface for</span>
            <span className="hero-line block" style={{ color: "var(--color-accent)" }}>Production AI</span>
          </h1>
          <p className="hero-sub mt-6 max-w-xl text-base md:text-lg font-light leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Private LLM applications, enterprise-grade RAG pipelines, and governed agentic workflows on GCP — built for teams that need performance, security, and operational clarity.
          </p>
          <div className="hero-tags flex flex-wrap gap-2 mt-4">
            {["GCP-native", "Vertex AI", "Token-efficient", "Governed workflows"].map(
              (tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-glass-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {tag}
                </span>
              )
            )}
          </div>
          <div className="hero-cta flex flex-wrap gap-4 mt-8">
            <a
              href="#pipeline"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#pipeline")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: "var(--gradient-accent)", color: "var(--color-bg)", boxShadow: "0 0 18px var(--color-glow)" }}
            >
              See the systems
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="glass glass-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Discuss a system
            </a>
          </div>
        </div>
      </div>

      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--color-text-muted)" }}>scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-slate-600 to-transparent animate-[scroll-drop_1.8s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes scroll-drop {
          0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
          40% { transform: scaleY(1); transform-origin: top; opacity: 1; }
          60% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
