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
    <section id="case-studies" ref={sectionRef} className="relative py-28 bg-slate-950 border-t border-slate-800/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16">
          <p className="section-eyebrow text-indigo-400">Case Studies</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Deep dives.</h2>
          <p className="mt-2 text-sm text-slate-400 font-light">
            Architecture decisions, challenges, and measurable outcomes.
          </p>
        </div>

        <div className="space-y-10">
          {caseStudies.map((study, i) => (
            <article
              key={i}
              className="case-study rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 md:p-8"
            >
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{study.title}</h3>
                <p className="text-sm text-cyan-400/80 font-mono">{study.subtitle}</p>
              </div>

              <div className="space-y-4 mb-6">
                {study.content.map((section, j) => (
                  <div key={j}>
                    <h4 className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {section.heading}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{section.text}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {study.metrics.map((m, j) => (
                  <div
                    key={j}
                    className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 text-center"
                  >
                    <div className="font-mono text-xl md:text-2xl font-bold text-emerald-400">
                      <AnimatedCounter end={parseFloat(String(m.value))} suffix={m.suffix} prefix={m.prefix || ""} duration={2} />
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {study.stack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[9px] px-2 py-0.5 rounded border border-slate-700/50 text-slate-500 bg-slate-800/60"
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
