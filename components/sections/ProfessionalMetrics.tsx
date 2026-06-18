"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { metrics } from "@/lib/data";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

gsap.registerPlugin(ScrollTrigger);

export default function ProfessionalMetrics() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".metric-card", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#metrics",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  function parseValue(val: string): { num: number; symbol: string } {
    const match = val.match(/^(\d+)(.*)$/);
    if (!match) return { num: 0, symbol: val };
    return { num: parseInt(match[1], 10), symbol: match[2] };
  }

  return (
    <section id="metrics" ref={sectionRef} aria-label="Professional Metrics" className="relative py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-12">
          <p className="section-eyebrow">By The Numbers</p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Operating at <span style={{ color: "var(--color-accent)" }}>/</span> Production Scale
          </h2>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          {metrics.map((metric, i) => {
            const { num, symbol } = parseValue(metric.value);
            return (
              <div key={i} className="metric-card glass glass-hover rounded-2xl p-6 text-center relative">
                <div className="w-full h-0.5 mb-4" aria-hidden="true" style={{ backgroundColor: "var(--color-accent)" }} />
                <div className="text-5xl md:text-6xl font-black" style={{ color: "var(--color-accent)" }}>
                  <AnimatedCounter end={num} suffix={symbol} />
                </div>
                <p className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {metric.suffix}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  {metric.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
