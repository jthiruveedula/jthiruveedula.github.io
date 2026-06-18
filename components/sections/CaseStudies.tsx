"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { caseStudies } from "@/lib/data";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

gsap.registerPlugin(ScrollTrigger);

export default function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".case-study", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#case-studies",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="case-studies" ref={sectionRef} className="relative py-28 border-t" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16">
          <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Case Studies</p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Deep dives.</h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Architecture decisions, challenges, and measurable outcomes.
          </p>
        </div>

        <div className="space-y-10">
          {caseStudies.map((study, i) => (
            <article
              key={i}
              className="case-study rounded-2xl border p-6 md:p-8" style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>{study.title}</h3>
                <p className="text-sm font-mono" style={{ color: "var(--color-accent)" }}>{study.subtitle}</p>
              </div>

              <div className="space-y-4 mb-6">
                {study.content.map((section, j) => (
                  <div key={j}>
                    <h4 className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
                      {section.heading}
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{section.text}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {study.metrics.map((m, j) => (
                  <div
                    key={j}
                    className="rounded-xl border p-4 text-center" style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-surface)" }}
                  >
                    <div className="font-mono text-xl md:text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
                      <AnimatedCounter end={parseFloat(String(m.value))} suffix={m.suffix} prefix={m.prefix || ""} duration={2} />
                    </div>
                    <p className="font-mono text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {study.stack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[9px] px-2 py-0.5 rounded border" style={{ borderColor: "var(--color-glass-border)", color: "var(--color-text-muted)", backgroundColor: "var(--color-surface)" }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
