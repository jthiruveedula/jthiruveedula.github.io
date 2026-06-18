"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { siteConfig } from "@/lib/data";
import SplineContainer from "@/components/ui/SplineContainer";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 20, duration: 0.5 })
        .from(".hero-line", { opacity: 0, y: 60, rotateX: -45, duration: 0.8, stagger: 0.12 }, "-=0.2")
        .from(".hero-sub", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
        .from(".hero-tags", { opacity: 0, y: 10, duration: 0.4 }, "-=0.3")
        .from(".hero-cta", { opacity: 0, y: 15, duration: 0.4, stagger: 0.1 }, "-=0.2")
        .from(".scroll-indicator", { opacity: 0, duration: 0.5 }, "-=0.1");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-svh flex items-center overflow-hidden bg-slate-950 isolate"
    >
      <SplineContainer className="opacity-40" intensity={20} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.7)_100%)]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6 py-24">
        <div className="max-w-3xl">
          <p className="hero-eyebrow font-mono text-[11px] tracking-[0.28em] uppercase text-cyan-400/80 mb-6">
            Data Architect · GCP & Generative AI
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            <span className="hero-line block">Architecting</span>
            <span className="hero-line block text-cyan-400">Intelligent Data Systems</span>
          </h1>
          <p className="hero-sub mt-6 max-w-xl text-base md:text-lg text-slate-300 font-light leading-relaxed">
            Enterprise data architecture, GenAI applications, and cloud-native pipelines —
            built for performance, governed for production.
          </p>
          <div className="hero-tags flex flex-wrap gap-2 mt-4">
            {["GCP-native", "BigQuery", "Vertex AI", "Generative AI", "Agentic Frameworks"].map(
              (tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-slate-700/50 text-slate-400 bg-slate-900/60"
                >
                  {tag}
                </span>
              )
            )}
          </div>
          <div className="hero-cta flex flex-wrap gap-4 mt-8">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.2)] hover:bg-cyan-400 hover:scale-[1.02] transition-all duration-200"
            >
              View My Work
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
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-medium text-slate-300 hover:border-cyan-400/40 hover:text-cyan-100 backdrop-blur-sm transition-all duration-200"
            >
              Contact Me
            </a>
          </div>
        </div>
      </div>

      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.3em] text-slate-600 uppercase">scroll</span>
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
