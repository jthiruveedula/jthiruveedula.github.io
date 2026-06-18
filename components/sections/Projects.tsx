"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, filterCategories } from "@/lib/data";

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

  return (
    <section id="projects" ref={sectionRef} className="relative py-28 bg-slate-900 border-t border-slate-800/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="section-eyebrow text-cyan-400">Portfolio</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Selected projects.</h2>
            <p className="mt-2 text-sm text-slate-400 font-light">
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
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                  : "border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300"
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
                className={`project-card group relative rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all duration-500 overflow-hidden ${isFeatured ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-6" : ""}`}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/40 via-indigo-400/60 to-emerald-400/40" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[project.category] || "border-slate-600 text-slate-400"}`}
                    >
                      {project.category}
                    </span>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener"
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                        aria-label={`View ${project.title} on GitHub`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-100 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{project.summary}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[9px] px-2 py-0.5 rounded border border-slate-700/50 text-slate-500 bg-slate-900/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800/60">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm font-semibold text-emerald-400">
                        {project.metric}
                      </span>
                      <span className="font-mono text-[9px] text-slate-600">
                        {project.metricLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {isFeatured && (
                  <div className="hidden md:flex flex-col justify-center gap-3 pl-6 border-l border-slate-700/40">
                    <p className="font-mono text-[10px] text-cyan-400/80 uppercase tracking-wider">
                      Case Highlight
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">{project.detail}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="font-mono text-[9px] text-slate-500">Role: {project.role}</span>
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
