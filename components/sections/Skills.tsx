"use client";

import { useState } from "react";
import type React from "react";
import { skillCategories } from "@/lib/data";
import SkillRadar from "@/components/ui/SkillRadar";

const iconPaths: Record<string, React.ReactNode> = {
  cloud: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
  database: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  brain: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  "trending-up": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

const skillToCategory: Record<string, string> = {
  GCP: "Cloud",
  BigQuery: "Cloud",
  Airflow: "Data Engineering",
  GenAI: "AI/ML",
  Python: "Development",
  SQL: "Development",
  Agentic: "AI/ML",
  Trading: "Finance",
};

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSkillClick = (skillName: string) => {
    const category = skillToCategory[skillName] || null;
    if (category && category !== activeCategory) {
      setActiveCategory(category);
    } else if (category && category === activeCategory) {
      setActiveCategory(null);
    }
  };

  const handleChipClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  const activeData = activeCategory ? skillCategories.find((c) => c.category === activeCategory) : null;

  return (
    <section
      id="skills"
      className="relative py-24 border-t overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 max-w-3xl">
          <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Expertise</p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Skills &amp; capabilities.
          </h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Five years of deep expertise across the full data and AI stack.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
          <div
            className="relative w-full max-w-[520px] aspect-square flex-shrink-0 mx-auto"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(201, 168, 76, 0.06) 0%, rgba(201, 168, 76, 0.02) 40%, transparent 70%)",
            }}
          >
            <SkillRadar onSkillClick={handleSkillClick} />
          </div>

          <div className="flex-1 min-w-0 w-full flex flex-col gap-4" style={{ minHeight: "380px" }}>
            <div className="flex flex-wrap gap-2">
              {skillCategories.map((cat) => {
                const isActive = activeCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => handleChipClick(cat.category)}
                    className="text-[11px] font-mono px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? "var(--color-accent-muted)" : "transparent",
                      color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                      border: `1px solid ${isActive ? "var(--color-accent)" : "var(--color-glass-border)"}`,
                      boxShadow: "none",
                    }}
                  >
                    {cat.category}
                  </button>
                );
              })}
            </div>

            <div
              className="flex-1 transition-all duration-500 ease-out"
              style={{
                opacity: activeData ? 1 : 0,
                transform: activeData ? "translateY(0)" : "translateY(12px)",
                pointerEvents: activeData ? "auto" : "none",
              }}
            >
              {activeData && (
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-glass-border)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--color-accent-muted)",
                        color: "var(--color-accent)",
                      }}
                    >
                      <span style={{ color: "var(--color-accent)" }}>
                        {iconPaths[activeData.icon] || iconPaths.code}
                      </span>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {activeData.category}
                      </h3>
                      <p className="text-[10px] font-mono" style={{ color: "var(--color-text-muted)" }}>
                        {activeData.skills.length} skills
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {activeData.skills.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                            {skill.name}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                            {skill.level}%
                          </span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${skill.level}%`,
                              backgroundColor: "var(--color-accent)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!activeData && (
              <div
                className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed"
                style={{ borderColor: "var(--color-glass-border)", minHeight: "240px" }}
              >
                <p className="text-sm font-mono" style={{ color: "var(--color-text-muted)" }}>
                  Click a radar axis or category to explore
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
