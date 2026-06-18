"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, filterCategories } from "@/lib/data";
import { createHover3DTilt } from "@/lib/gsap-animations";

gsap.registerPlugin(ScrollTrigger);

const categoryColors: Record<string, string> = {
  AI: "border-cyan-500/30 text-cyan-400",
  "Data Engineering": "border-indigo-500/30 text-indigo-400",
  Development: "border-emerald-500/30 text-emerald-400",
  Trading: "border-amber-500/30 text-amber-400",
};

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const sectionRef = useRef<HTMLElement>(null);

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".project-card", {
        opacity: 0,
        y: 30,
        stagger: 0.06,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#projects",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".project-card",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.04, ease: "power2.out", overwrite: "auto" }
    );
  }, [activeFilter]);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".project-card");
    if (!cards || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];
    cards.forEach((card) => {
      cleanups.push(createHover3DTilt(card as HTMLElement, { scale: 1.02, maxTilt: 3 }));
    });
    return () => cleanups.forEach((fn) => fn());
  }, [filtered.length]);

  return (
    <section id="projects" ref={sectionRef} className="relative py-28 border-t" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Portfolio</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Selected projects.</h2>
            <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
              Production AI and data systems I&apos;ve architected and shipped.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
               className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                 activeFilter === cat
                   ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]"
                   : "border-[color:var(--color-glass-border)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-accent)]/30 hover:text-[color:var(--color-text-secondary)]"
               }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((project, i) => {
            const isFeatured = i === 0;
            return (
              <article
                key={project.id}
                className={`project-card group relative rounded-2xl border p-6 transition-all duration-500 overflow-hidden ${isFeatured ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-6" : ""}`}
                style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-surface)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-glass-border)"; }}
                data-hoverable
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "var(--gradient-accent)" }} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[project.category] || ""}`}
                      style={!categoryColors[project.category] ? { borderColor: "var(--color-glass-border)", color: "var(--color-text-secondary)" } : undefined}
                    >
                      {project.category}
                    </span>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener"
                        className="transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"; }}
                        aria-label={`View ${project.title} on GitHub`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    )}
                  </div>

                  <h3 className="text-base font-semibold mb-2 transition-colors" style={{ color: "var(--color-text-primary)" }}>
                    {project.title}
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--color-text-muted)" }}>{project.summary}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[9px] px-2 py-0.5 rounded border" style={{ borderColor: "var(--color-glass-border)", color: "var(--color-text-muted)", backgroundColor: "var(--color-surface)" }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor: "var(--color-glass-border)" }}>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                        {project.metric}
                      </span>
                      <span className="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>
                        {project.metricLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {isFeatured && (
                  <div className="hidden md:flex flex-col justify-center gap-3 pl-6 border-l" style={{ borderColor: "var(--color-glass-border)" }}>
                    <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
                      Case Highlight
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{project.detail}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>Role: {project.role}</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
