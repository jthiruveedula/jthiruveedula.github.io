"use client";

import { useEffect, useRef } from "react";
import type React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skillCategories } from "@/lib/data";
import { createHover3DTilt, animateSkillBars } from "@/lib/gsap-animations";

gsap.registerPlugin(ScrollTrigger);

const iconPaths: Record<string, React.ReactNode> = {
  cloud: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
  database: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  brain: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  code: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  "trending-up": (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

const categoryColors: Record<string, string> = {
  Cloud: "border-cyan-500/30 hover:border-cyan-400/50",
  "Data Engineering": "border-indigo-500/30 hover:border-indigo-400/50",
  "AI/ML": "border-emerald-500/30 hover:border-emerald-400/50",
  Development: "border-amber-500/30 hover:border-amber-400/50",
  Finance: "border-purple-500/30 hover:border-purple-400/50",
};

const iconColors: Record<string, string> = {
  Cloud: "text-cyan-400",
  "Data Engineering": "text-indigo-400",
  "AI/ML": "text-emerald-400",
  Development: "text-amber-400",
  Finance: "text-purple-400",
};

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".skill-card", {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#skills",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      animateSkillBars(sectionRef.current);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".skill-card");
    if (!cards || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];
    cards.forEach((card) => {
      cleanups.push(createHover3DTilt(card as HTMLElement, { scale: 1.03, maxTilt: 4 }));
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="relative py-28 border-t" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 max-w-3xl">
          <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Expertise</p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Skills & capabilities.</h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Five years of deep expertise across the full data and AI stack.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((cat) => (
            <div
              key={cat.category}
              className={`skill-card rounded-2xl border p-6 transition-colors duration-300 ${categoryColors[cat.category] || ""}`}
              style={{ backgroundColor: "var(--color-surface)", ...(categoryColors[cat.category] ? {} : { borderColor: "var(--color-glass-border)" }) }}
              data-hoverable
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={iconColors[cat.category] || "text-slate-400"}>
                  {iconPaths[cat.icon] || iconPaths.code}
                </span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{cat.category}</h3>
              </div>
              <div className="space-y-2.5">
                {cat.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{skill.name}</span>
                      <span className="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>{skill.level}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                      <div
                        className="skill-bar-fill h-full rounded-full" style={{ background: "var(--gradient-accent)" }}
                        data-level={skill.level}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
