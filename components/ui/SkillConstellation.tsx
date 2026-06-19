"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skillCategories } from "@/lib/data";
import { EASE, prefersReducedMotion, isCoarsePointer } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const VB = 500;
const CX = 250;
const CY = 250;
const CAT_R = 115;
const SKILL_R = 47;

const ICON_PATHS: Record<string, string> = {
  cloud: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  database: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  brain: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  "trending-up": "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
};

const SHORT_LABELS: Record<string, string> = {
  Cloud: "Cloud",
  "Data Engineering": "Data Eng.",
  "AI/ML": "AI/ML",
  Development: "Dev",
  Finance: "Finance",
};

function rad(deg: number) {
  return (deg * Math.PI) / 180;
}

function catPos(i: number) {
  const angle = -90 + (i * 360) / skillCategories.length;
  return {
    x: CX + CAT_R * Math.cos(rad(angle)),
    y: CY + CAT_R * Math.sin(rad(angle)),
    angle,
  };
}

function skillPos(catI: number, skillI: number, total: number) {
  const cat = catPos(catI);
  const spread = 58;
  const sAngle = cat.angle - spread / 2 + (skillI * spread) / Math.max(total - 1, 1);
  return {
    x: cat.x + SKILL_R * Math.cos(rad(sAngle)),
    y: cat.y + SKILL_R * Math.sin(rad(sAngle)),
  };
}

function labelPos(i: number) {
  const cat = catPos(i);
  return {
    x: cat.x + 30 * Math.cos(rad(cat.angle)),
    y: cat.y + 30 * Math.sin(rad(cat.angle)),
  };
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

interface Props {
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
  className?: string;
}

export default function SkillConstellation({ activeCategory, onCategoryClick, className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const catActive = (i: number) => skillCategories[i].category === activeCategory;
  const catHovered = (i: number) => hoveredCat === i;
  const catDimmed = (i: number) =>
    (activeCategory !== null && !catActive(i)) ||
    (activeCategory === null && hoveredCat !== null && !catHovered(i));

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;
    const reduced = prefersReducedMotion();

    if (!reduced) {
      const lines = svg.querySelectorAll("[data-cat-line], [data-skill-line]");
      lines.forEach((el) => {
        const x1 = parseFloat(el.getAttribute("x1") || "0");
        const y1 = parseFloat(el.getAttribute("y1") || "0");
        const x2 = parseFloat(el.getAttribute("x2") || "0");
        const y2 = parseFloat(el.getAttribute("y2") || "0");
        const len = dist(x1, y1, x2, y2);
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      });

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: container, start: "top 72%", once: true },
          defaults: { ease: EASE.cinematic },
        });

        tl.from("[data-bg]", { opacity: 0, duration: 0.4 })
          .from("[data-core]", { scale: 0, transformOrigin: "center", duration: 0.5, ease: EASE.snap }, "-=0.15")
          .from("[data-cat-lines]", { strokeDashoffset: 0, stagger: 0.08, duration: 0.4, ease: EASE.soft }, "-=0.2")
          .from("[data-cat-node]", { scale: 0, transformOrigin: "center", stagger: 0.1, duration: 0.4, ease: EASE.snap }, "-=0.2")
          .to("[data-skill-line]", { strokeDashoffset: 0, stagger: 0.015, duration: 0.2 }, "-=0.15")
          .from("[data-skill-node]", { scale: 0, transformOrigin: "center", stagger: 0.012, duration: 0.3, ease: EASE.snap }, "-=0.1")
          .from("[data-cat-label]", { opacity: 0, stagger: 0.06, duration: 0.3 }, "-=0.2")
          .add(() => {
            gsap.to("[data-cat-node] > circle", {
              scale: 1.07,
              transformOrigin: "center",
              duration: 3,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              stagger: 0.5,
            });
            gsap.to("[data-skill-node] > circle", {
              scale: 1.2,
              transformOrigin: "center",
              duration: 2.5,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              stagger: { each: 0.04, from: "center" },
            });
            const ripple = svg.querySelector("[data-ripple]");
            if (ripple) {
              gsap.fromTo(
                ripple,
                { scale: 1, opacity: 0.35, transformOrigin: "center" },
                { scale: 3.8, opacity: 0, duration: 2.8, ease: "power1.out", repeat: -1, repeatDelay: 1.2 }
              );
            }
          });
      }, svgRef);

      return () => ctx.revert();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;
    if (isCoarsePointer()) return;
    if (prefersReducedMotion()) return;

    let rafId = 0;
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          gsap.to(svg, { x: x * 8, y: y * 8, duration: 0.8, ease: EASE.soft, overwrite: "auto" });
          rafId = 0;
        });
      }
    };
    container.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      container.removeEventListener("pointermove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-auto"
        viewBox={`0 0 ${VB} ${VB}`}
        fill="none"
        aria-label="Skills constellation map"
        role="img"
      >
        <defs>
          <radialGradient id="constellation-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.06} />
            <stop offset="40%" stopColor="var(--color-accent)" stopOpacity={0.02} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.4} />
            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.4} />
          </linearGradient>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle data-bg cx={CX} cy={CY} r={210} fill="url(#constellation-bg)" />

        {skillCategories.map((_, i) => {
          const cp = catPos(i);
          return (
            <line
              key={`cl-${i}`}
              data-cat-line
              x1={CX}
              y1={CY}
              x2={cp.x}
              y2={cp.y}
              stroke="url(#conn-grad)"
              strokeOpacity={catDimmed(i) ? 0.06 : catActive(i) || catHovered(i) ? 0.5 : 0.22}
              strokeWidth={catActive(i) || catHovered(i) ? 1.5 : 1}
              style={{ transition: "stroke-opacity 0.4s, stroke-width 0.4s" }}
            />
          );
        })}

        {skillCategories.map((cat, ci) =>
          cat.skills.map((_, si) => {
            const cp = catPos(ci);
            const sp = skillPos(ci, si, cat.skills.length);
            return (
              <line
                key={`sl-${ci}-${si}`}
                data-skill-line
                x1={cp.x}
                y1={cp.y}
                x2={sp.x}
                y2={sp.y}
                stroke="var(--color-accent)"
                strokeOpacity={catDimmed(ci) ? 0.04 : catActive(ci) || catHovered(ci) ? 0.35 : 0.12}
                strokeWidth={0.8}
                style={{ transition: "stroke-opacity 0.4s" }}
              />
            );
          })
        )}

        <g data-core>
          <circle data-ripple cx={CX} cy={CY} r={14} fill="none" stroke="var(--color-accent)" strokeWidth={1} />
          <circle cx={CX} cy={CY} r={16} fill="var(--color-accent)" fillOpacity={0.06} stroke="var(--color-accent)" strokeWidth={1.5} filter="url(#node-glow)" />
          <circle cx={CX} cy={CY} r={7} fill="var(--color-accent)" fillOpacity={0.25} />
          <circle cx={CX} cy={CY} r={3} fill="var(--color-accent)" />
        </g>

        {skillCategories.map((cat, i) => {
          const cp = catPos(i);
          const lp = labelPos(i);
          return (
            <g
              key={cat.category}
              data-cat-node
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCat(i)}
              onMouseLeave={() => setHoveredCat(null)}
              onClick={() => onCategoryClick(cat.category)}
              style={{ opacity: catDimmed(i) ? 0.25 : 1, transition: "opacity 0.4s" }}
            >
              <circle
                cx={cp.x}
                cy={cp.y}
                r={17}
                fill="var(--color-surface)"
                stroke="var(--color-accent)"
                strokeWidth={catActive(i) || catHovered(i) ? 2 : 1.5}
                filter="url(#node-glow)"
                style={{ transition: "stroke-width 0.3s" }}
              />
              <g transform={`translate(${cp.x - 7.5} ${cp.y - 7.5}) scale(0.6)`}>
                <path
                  d={ICON_PATHS[cat.icon] || ICON_PATHS.code}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <text
                data-cat-label
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill={catActive(i) || catHovered(i) ? "var(--color-accent)" : "var(--color-text-secondary)"}
                style={{ transition: "fill 0.3s" }}
              >
                {SHORT_LABELS[cat.category] || cat.category}
              </text>
            </g>
          );
        })}

        {skillCategories.map((cat, ci) =>
          cat.skills.map((skill, si) => {
            const sp = skillPos(ci, si, cat.skills.length);
            const r = 2.5 + (skill.level / 100) * 4;
            const showLabel = hoveredSkill === skill.name || catActive(ci);
            return (
              <g
                key={skill.name}
                data-skill-node
                style={{ opacity: catDimmed(ci) ? 0.15 : 1, transition: "opacity 0.4s" }}
              >
                <circle
                  cx={sp.x}
                  cy={sp.y}
                  r={r}
                  fill="var(--color-accent)"
                  fillOpacity={catActive(ci) || catHovered(ci) ? 0.35 : 0.15}
                  stroke="var(--color-accent)"
                  strokeWidth={1}
                  filter="url(#node-glow)"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  style={{ transition: "fill-opacity 0.3s" }}
                />
                {showLabel && (
                  <text
                    x={sp.x}
                    y={sp.y - r - 5}
                    textAnchor="middle"
                    fontSize={8}
                    fontFamily="var(--font-mono)"
                    fill="var(--color-accent)"
                    opacity={0.8}
                  >
                    {skill.name}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
