"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, filterCategories } from "@/lib/data";
import { useSound } from "@/hooks/useSound";

gsap.registerPlugin(ScrollTrigger);

const categoryConfig: Record<string, { color: string; gradient: string; label: string }> = {
  "AI": {
    color: "#00f0ff",
    gradient: "linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 240, 255, 0.02))",
    label: "AI",
  },
  "Data Engineering": {
    color: "#b026ff",
    gradient: "linear-gradient(135deg, rgba(176, 38, 255, 0.15), rgba(176, 38, 255, 0.02))",
    label: "Data Eng.",
  },
  "Development": {
    color: "#39ff14",
    gradient: "linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(57, 255, 20, 0.02))",
    label: "Dev",
  },
  "Trading": {
    color: "#f0ff00",
    gradient: "linear-gradient(135deg, rgba(240, 255, 0, 0.15), rgba(240, 255, 0, 0.02))",
    label: "Trading",
  },
};

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const metricRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();
  const cfg = categoryConfig[project.category] || categoryConfig["AI"];

  const handleEnter = () => {
    play("click");
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.01,
      boxShadow: `0 0 32px ${cfg.color}40, 0 0 64px ${cfg.color}20`,
      duration: 0.35,
      ease: "power2.out",
    });
    if (metricRef.current) {
      gsap.to(metricRef.current, {
        scale: 1.08,
        textShadow: `0 0 12px ${cfg.color}, 0 0 24px ${cfg.color}`,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      boxShadow: "none",
      duration: 0.35,
      ease: "power2.out",
    });
    if (metricRef.current) {
      gsap.to(metricRef.current, {
        scale: 1,
        textShadow: `0 0 8px ${cfg.color}, 0 0 16px ${cfg.color}80`,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <article
      ref={cardRef}
      data-project-card
      className="project-card group relative rounded-2xl border overflow-hidden cursor-pointer transition-colors duration-300"
      style={{
        borderColor: "var(--color-glass-border)",
        backgroundColor: "var(--color-surface)",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}80, transparent)` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: cfg.gradient }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${cfg.color}40, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-50 group-hover:opacity-100"
          style={{
            backgroundColor: "var(--color-bg)",
            border: `1px solid ${cfg.color}40`,
            color: cfg.color,
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`View ${project.title} on GitHub`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      )}
      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border"
            style={{
              borderColor: `${cfg.color}50`,
              color: cfg.color,
              backgroundColor: `${cfg.color}10`,
            }}
          >
            {cfg.label}
          </span>
          <span
            className="font-mono text-[10px] tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            {project.kicker}
          </span>
        </div>
        <h3
          className="text-xl md:text-2xl font-bold mb-3 leading-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {project.title}
        </h3>
        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {project.summary}
        </p>
        <div
          ref={metricRef}
          className="flex items-baseline gap-2 mb-5 pb-5 border-b font-mono"
          style={{ borderColor: "var(--color-glass-border)" }}
        >
          <span
            className="text-2xl md:text-3xl font-black"
            style={{
              color: cfg.color,
              textShadow: `0 0 8px ${cfg.color}, 0 0 16px ${cfg.color}80`,
            }}
          >
            {project.metric}
          </span>
          <span
            className="text-[10px] tracking-wider uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            {project.metricLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border"
              style={{
                borderColor: "var(--color-glass-border)",
                color: "var(--color-text-muted)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span
              className="font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded"
              style={{ color: cfg.color }}
            >
              +{project.stack.length - 4}
            </span>
          )}
        </div>
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${cfg.color}10 50%, transparent 60%)`,
        }}
        aria-hidden="true"
      />
    </article>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(".project-card");
    if (!cards || cards.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.92, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          stagger: 0.1,
          duration: 0.7,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: "#projects",
            start: "top 80%",
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [filtered.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveFilter(activeFilter);
      return;
    }
    const cards = gridRef.current?.querySelectorAll(".project-card");
    if (!cards || cards.length === 0) return;
    play("whoosh");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.94, filter: "blur(6px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, stagger: 0.05, ease: "power3.out" }
    );
  }, [activeFilter, play]);

  const handleFilterClick = (cat: string) => {
    if (cat === activeFilter) return;
    play("toggle");
    setActiveFilter(cat);
  };

  const getCount = (cat: string) =>
    cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length;

  return (
    <section id="projects" ref={sectionRef} className="relative py-24 border-t" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Portfolio</p>
            <h2 className="text-3xl md:text-4xl font-black mt-1" style={{ color: "var(--color-text-primary)" }}>
              Selected projects.
            </h2>
            <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
              Production AI and data systems I&apos;ve architected and shipped.
            </p>
          </div>
          <div className="font-mono text-[10px] tracking-wider uppercase" style={{ color: "var(--color-text-muted)" }}>
            {filtered.length} of {projects.length} shown
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-10">
          {filterCategories.map((cat) => {
            const cfg = categoryConfig[cat];
            const isActive = activeFilter === cat;
            const accent = cfg ? cfg.color : "var(--color-accent)";
            return (
              <button
                key={cat}
                onClick={() => handleFilterClick(cat)}
                data-active={isActive}
                className="group font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-2"
                style={
                  isActive
                    ? {
                        borderColor: accent,
                        backgroundColor: `${accent}15`,
                        color: accent,
                        boxShadow: `0 0 12px ${accent}40`,
                      }
                    : {
                        borderColor: "var(--color-glass-border)",
                        color: "var(--color-text-muted)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = `${accent}50`;
                    (e.currentTarget as HTMLElement).style.color = accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-glass-border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                  }
                }}
              >
                <span>{cat}</span>
                <span
                  className="text-[9px] opacity-60"
                  style={{ color: isActive ? accent : "var(--color-text-muted)" }}
                >
                  {getCount(cat)}
                </span>
              </button>
            );
          })}
        </div>
        <div
          ref={gridRef}
          className="grid gap-5 md:grid-cols-2"
        >
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 font-mono text-sm" style={{ color: "var(--color-text-muted)" }}>
            No projects in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
