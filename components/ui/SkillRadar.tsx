"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skillCategories } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const AXES = [
  { name: "GCP", category: "Cloud" },
  { name: "BigQuery", category: "Cloud" },
  { name: "Airflow", category: "Data Engineering" },
  { name: "GenAI", category: "AI/ML" },
  { name: "Python", category: "Development" },
  { name: "SQL", category: "Development" },
  { name: "Agentic", category: "AI/ML" },
  { name: "Trading", category: "Finance" },
];

const SKILL_LOOKUP: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      map[skill.name] = skill.level;
    }
  }
  return map;
})();

const VALUES = AXES.map((a) => SKILL_LOOKUP[a.name] ?? 80);
const VIEWBOX = 400;
const CX = 200;
const CY = 200;
const R_MAX = 140;
const RINGS = 4;
const NUM_AXES = AXES.length;

function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function polygonAt(fraction: number) {
  return AXES.map((_, i) => {
    const p = polar((i * 360) / NUM_AXES, R_MAX * fraction);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");
}

function dataPolygon() {
  return VALUES.map((v, i) => {
    const p = polar((i * 360) / NUM_AXES, (v / 100) * R_MAX);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");
}

export interface RadarAxis {
  name: string;
  max: number;
  category: string;
}

interface SkillRadarProps {
  className?: string;
  onSkillClick?: (axisName: string) => void;
}

export default function SkillRadar({ className = "", onSkillClick }: SkillRadarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const polygon = svg.querySelector("[data-radar-shape]");
      const points = svg.querySelectorAll("[data-radar-point]");

      if (polygon) {
        gsap.from(polygon, {
          scale: 0,
          transformOrigin: `${CX}px ${CY}px`,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: svg, start: "top 75%", once: true },
        });
      }

      if (points.length) {
        gsap.from(points, {
          scale: 0,
          transformOrigin: "center",
          stagger: 0.08,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: { trigger: svg, start: "top 75%", once: true },
        });
      }
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full ${className}`}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      fill="none"
      aria-label="Skills radar chart"
      role="img"
    >
      {Array.from({ length: RINGS }, (_, i) => i + 1).map((ring) => (
        <polygon
          key={ring}
          points={polygonAt(ring / RINGS)}
          stroke="var(--color-accent)"
          strokeOpacity={0.1}
          strokeWidth={1}
          fill={ring % 2 === 0 ? "var(--color-accent)" : "none"}
          fillOpacity={0.015}
        />
      ))}

      {AXES.map((_, i) => {
        const p = polar((i * 360) / NUM_AXES, R_MAX);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="var(--color-accent)"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}

      <polygon
        data-radar-shape
        points={dataPolygon()}
        fill="var(--color-accent)"
        fillOpacity={0.08}
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {VALUES.map((v, i) => {
        const p = polar((i * 360) / NUM_AXES, (v / 100) * R_MAX);
        return (
          <circle
            key={i}
            data-radar-point
            cx={p.x}
            cy={p.y}
            r={hovered === i ? 5 : 3.5}
            fill="var(--color-accent)"
            stroke="var(--color-bg)"
            strokeWidth={2}
            className="transition-all duration-200"
          />
        );
      })}

      {AXES.map((axis, i) => {
        const p = polar((i * 360) / NUM_AXES, R_MAX + 26);
        return (
          <g
            key={axis.name}
            className={onSkillClick ? "cursor-pointer" : ""}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSkillClick?.(axis.name)}
          >
            <circle cx={p.x} cy={p.y} r={18} fill="transparent" />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              fill={hovered === i ? "var(--color-accent)" : "var(--color-text-secondary)"}
              className="transition-colors duration-200"
            >
              {axis.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
