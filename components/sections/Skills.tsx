"use client";

import { useRef, useEffect, useState } from "react";
import type React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skillCategories } from "@/lib/data";
import SkillConstellation from "@/components/ui/SkillConstellation";
import { EASE, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const ICON_PATHS: Record<string, string> = {
  cloud: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  database: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  brain: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  "trending-up": "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
};

const totalSkills = skillCategories.reduce((sum, c) => sum + c.skills.length, 0);
const overallAvg = Math.round(
  skillCategories.reduce((sum, c) => sum + c.skills.reduce((s, sk) => s + sk.level, 0) / c.skills.length, 0) /
    skillCategories.length
);

function CategoryDetail({ data }: { data: (typeof skillCategories)[0] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".skill-row", {
        opacity: 0,
        x: 24,
        stagger: 0.06,
        duration: 0.5,
        ease: EASE.soft,
      });
      gsap.from(".skill-bar-fill", {
        scaleX: 0,
        transformOrigin: "left center",
        stagger: 0.06,
        duration: 0.8,
        ease: EASE.cinematic,
        delay: 0.1,
      });
      gsap.fromTo(
        ".skill-percent",
        { textContent: 0 },
        {
          textContent: (i: number) => data.skills[i].level,
          duration: 0.8,
          snap: { textContent: 1 },
          stagger: 0.06,
          ease: EASE.soft,
          delay: 0.1,
        }
      );
      gsap.from(".cat-header", {
        opacity: 0,
        y: -12,
        duration: 0.4,
        ease: EASE.soft,
      });
      gsap.fromTo(
        ".cat-icon-path",
        { strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 1.2, ease: EASE.soft, delay: 0.15 }
      );
    }, ref);

    return () => ctx.revert();
  }, [data]);

  return (
    <div ref={ref} className="rounded-2xl border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-glass-border)" }}>
      <div className="cat-header flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-muted)" }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--color-accent)" }}>
            <path className="cat-icon-path" d={ICON_PATHS[data.icon] || ICON_PATHS.code} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} strokeDasharray={200} />
          </svg>
        </span>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{data.category}</h3>
          <p className="text-[10px] font-mono" style={{ color: "var(--color-text-muted)" }}>{data.skills.length} skills</p>
        </div>
      </div>
      <div className="space-y-3.5">
        {data.skills.map((skill) => (
          <div key={skill.name} className="skill-row">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{skill.name}</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--color-accent)" }}>
                <span className="skill-percent">{skill.level}</span>%
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
              <div
                className="skill-bar-fill h-full rounded-full"
                style={{
                  width: `${skill.level}%`,
                  background: "var(--gradient-accent)",
                  boxShadow: "0 0 6px rgba(201, 168, 76, 0.3)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".overview-row", {
        opacity: 0,
        x: 20,
        stagger: 0.08,
        duration: 0.5,
        ease: EASE.soft,
      });
      gsap.from(".overview-bar-fill", {
        scaleX: 0,
        transformOrigin: "left center",
        stagger: 0.08,
        duration: 0.8,
        ease: EASE.cinematic,
        delay: 0.1,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl border border-dashed p-6" style={{ borderColor: "var(--color-glass-border)" }}>
      <div className="mb-5">
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>At a glance</p>
        <p className="font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>
          {skillCategories.length} domains · {totalSkills} skills · {overallAvg}% avg
        </p>
      </div>
      <div className="space-y-3">
        {skillCategories.map((cat) => {
          const avg = Math.round(cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length);
          return (
            <div key={cat.category} className="overview-row">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{cat.category}</span>
                <span className="font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>{avg}%</span>
              </div>
              <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                <div className="overview-bar-fill h-full rounded-full" style={{ width: `${avg}%`, backgroundColor: "var(--color-accent)", opacity: 0.6 }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-center font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>
        Select a domain to explore
      </p>
    </div>
  );
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const handleCategoryClick = (category: string) => {
    setActiveCategory((prev) => (prev === category ? null : category));
  };

  const activeData = activeCategory ? skillCategories.find((c) => c.category === activeCategory) ?? null : null;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".skills-heading", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: EASE.cinematic,
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-24 border-t overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="skills-heading mb-12 max-w-3xl">
          <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Expertise</p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Skills &amp; capabilities.
          </h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Five years of deep expertise across the full data and AI stack.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="w-full max-w-[480px] flex-shrink-0">
            <SkillConstellation activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />
          </div>

          <div className="flex-1 min-w-0 w-full flex flex-col gap-4" style={{ minHeight: "420px" }}>
            <div className="flex flex-wrap gap-2">
              {skillCategories.map((cat) => {
                const isActive = activeCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => handleCategoryClick(cat.category)}
                    className="text-[11px] font-mono px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? "var(--color-accent-muted)" : "transparent",
                      color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                      border: `1px solid ${isActive ? "var(--color-accent)" : "var(--color-glass-border)"}`,
                    }}
                  >
                    {cat.category}
                  </button>
                );
              })}
            </div>

            <div key={activeCategory ?? "overview"} className="flex-1">
              {activeData ? <CategoryDetail data={activeData} /> : <Overview />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
