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
      const studies = document.querySelectorAll(".case-study");

      studies.forEach((study) => {
        const heading = study.querySelector(".cs-heading") as HTMLElement;
        const subtitle = study.querySelector(".cs-subtitle") as HTMLElement;
        const contentSections = study.querySelectorAll(".cs-content-section");
        const metrics = study.querySelectorAll(".cs-metric");
        const techStack = study.querySelector(".cs-stack") as HTMLElement;
        const accentBar = study.querySelector(".cs-accent-bar") as HTMLElement;
        const studyEl = study as HTMLElement;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: studyEl,
            start: "top 80%",
          },
        });

        tl.from(heading, { opacity: 0, x: -30, duration: 0.6, ease: "power3.out" })
          .from(subtitle, { opacity: 0, x: -20, duration: 0.4, ease: "power3.out" }, "-=0.3")
          .from(contentSections, { opacity: 0, y: 20, stagger: 0.08, duration: 0.5, ease: "power3.out" }, "-=0.2");

        if (metrics.length) {
          tl.from(metrics, {
            opacity: 0,
            scale: 0,
            filter: "blur(8px)",
            stagger: 0.08,
            duration: 0.6,
            ease: "back.out(2)",
          }, "-=0.1");
        }

        tl.from(techStack, { opacity: 0, y: 10, duration: 0.4, ease: "power3.out" }, "-=0.2");

        if (accentBar) {
          ScrollTrigger.create({
            trigger: studyEl,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
            onUpdate: (self) => {
              accentBar.style.height = `${self.progress * 100}%`;
            },
          });
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="case-studies" ref={sectionRef} className="relative py-24 border-t" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16">
          <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Case Studies</p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>Deep dives.</h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Architecture decisions, challenges, and measurable outcomes.
          </p>
        </div>

        <div className="space-y-10 -mx-4 md:-mx-6">
          {caseStudies.map((study, i) => (
            <article
              key={i}
              className="case-study relative rounded-2xl border p-6 md:p-8 overflow-hidden" style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="cs-accent-bar absolute left-0 top-0 w-1 rounded-l-2xl"
                style={{ height: "0%", background: "var(--gradient-accent)" }}
              />

              <div className="mb-6">
                <h3 className="cs-heading text-lg md:text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>{study.title}</h3>
                <p className="cs-subtitle text-sm font-mono" style={{ color: "var(--color-accent)" }}>{study.subtitle}</p>
              </div>

              <div className="space-y-4 mb-6">
                {study.content.map((section, j) => (
                  <div key={j} className="cs-content-section">
                    <h4 className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
                      {section.heading}
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{section.text}</p>
                  </div>
                ))}
              </div>

              <div className="cs-metrics grid grid-cols-3 gap-4 mb-6">
                {study.metrics.map((m, j) => (
                  <div
                    key={j}
                    className="cs-metric rounded-xl border p-4 text-center transition-all duration-300 hover:border-[color:var(--color-accent)] hover:shadow-[var(--shadow-soft-sm)]"
                    style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-surface)" }}
                  >
                    <div className="font-mono text-xl md:text-2xl font-bold" style={{ color: "var(--color-accent)", textShadow: "0 0 8px var(--color-accent)" }}>
                      <AnimatedCounter end={parseFloat(String(m.value))} suffix={m.suffix} prefix={m.prefix || ""} duration={2} />
                    </div>
                    <p className="font-mono text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="cs-stack flex flex-wrap gap-1.5">
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
