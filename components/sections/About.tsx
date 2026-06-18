"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/data";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useSound } from "@/hooks/useSound";

gsap.registerPlugin(ScrollTrigger);

const ARCH_NODES = [
  { id: "sources", label: "Data Sources", x: 50, y: 30 },
  { id: "ingestion", label: "Ingestion", x: 160, y: 30 },
  { id: "bigquery", label: "BigQuery", x: 270, y: 30 },
  { id: "transform", label: "Transform", x: 160, y: 90 },
  { id: "aiml", label: "AI / ML", x: 270, y: 90 },
  { id: "insights", label: "Insights", x: 380, y: 60 },
];

const CONNECTIONS = [
  { from: "sources", to: "ingestion" },
  { from: "ingestion", to: "bigquery" },
  { from: "bigquery", to: "transform" },
  { from: "transform", to: "aiml" },
  { from: "aiml", to: "insights" },
  { from: "bigquery", to: "insights" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { normalizedX, normalizedY } = useMousePosition();
  const { play } = useSound();
  const svgRef = useRef<SVGSVGElement>(null);
  const bioTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".about-eyebrow", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#about",
          start: "top 75%",
          onEnter: () => play("shimmer"),
        },
      });

      const charSpans = document.querySelectorAll(".bio-char");
      gsap.from(charSpans, {
        opacity: 0,
        duration: 0.04,
        stagger: 0.008,
        ease: "none",
        scrollTrigger: {
          trigger: "#about",
          start: "top 70%",
        },
      });

      gsap.from(".arch-node", {
        scale: 0,
        opacity: 0,
        transformOrigin: "center",
        stagger: 0.08,
        duration: 0.7,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".arch-diagram",
          start: "top 80%",
        },
      });

      const connEls = document.querySelectorAll<SVGPathElement>(".arch-conn");
      connEls.forEach((el) => {
        const len = el.getTotalLength();
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len}`;
      });
      gsap.to(".arch-conn", {
        strokeDashoffset: 0,
        duration: 1.5,
        stagger: 0.15,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".arch-diagram",
          start: "top 75%",
        },
      });

      gsap.from(".photo-frame", {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".photo-frame",
          start: "top 85%",
        },
      });

      gsap.from(".bg-flow-line", {
        x: -60,
        opacity: 0,
        stagger: 0.06,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#about",
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const tooltips = svgRef.current.querySelectorAll(".node-tooltip");
      tooltips.forEach((tt) => {
        const node = tt.closest("g");
        if (!node) return;
        const nRect = node.getBoundingClientRect();
        const cx = nRect.left + nRect.width / 2;
        const cy = nRect.top + nRect.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        (tt as SVGElement).style.opacity = dist < 50 ? "1" : "0";
      });
    };
    window.addEventListener("mousemove", listener);
    return () => window.removeEventListener("mousemove", listener);
  }, []);

  const buildCharSpans = (text: string) =>
    text.split("").map((ch, i) => (
      <span key={i} className="bio-char" style={{ display: "inline" }}>
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-28 border-t overflow-hidden scanline"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-glass-border)",
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            className="bg-flow-line"
            x1="0"
            y1={`${(i + 1) * 8}%`}
            x2="100%"
            y2={`${(i + 1) * 8}%`}
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            strokeDasharray="8 12 4 8"
            opacity="0"
          />
        ))}
      </svg>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl">
          <div>
            <p
              className="about-eyebrow section-eyebrow"
              style={{ color: "var(--color-accent)" }}
            >
              About
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold mb-8"
              style={{ color: "var(--color-text-primary)" }}
            >
              GCP Data Architect.
            </h2>
            <div
              ref={bioTextRef}
              className="space-y-3 text-sm leading-relaxed font-light"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {siteConfig.bio.map((paragraph, i) => (
                <p key={i}>{buildCharSpans(paragraph)}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="about-highlights mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
          {[
            { label: "Production GenAI", value: "6+", color: "var(--color-accent)" },
            { label: "RAG Pipelines", value: "12M+", color: "var(--color-accent-secondary)" },
            { label: "Data Platforms", value: "GCP", color: "var(--color-accent-tertiary)" },
            { label: "Latency Cut", value: "60%", color: "var(--color-accent)" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="about-stat rounded-xl border p-4 relative overflow-hidden"
              style={{
                borderColor: "var(--color-glass-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}08, transparent)`,
                }}
              />
              <div
                className="text-2xl md:text-3xl font-black font-mono relative z-10"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div
                className="font-mono text-[10px] tracking-wider uppercase mt-1 relative z-10"
                style={{ color: "var(--color-text-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="arch-diagram mt-14 max-w-4xl mx-auto">
          <svg
            ref={svgRef}
            viewBox="0 0 430 120"
            className="w-full h-auto"
            style={{ filter: "drop-shadow(0 0 8px var(--color-accent))" }}
          >
            {CONNECTIONS.map(({ from, to }) => {
              const fn = ARCH_NODES.find((n) => n.id === from)!;
              const tn = ARCH_NODES.find((n) => n.id === to)!;
              const midX = (fn.x + tn.x) / 2;
              const midY = (fn.y + tn.y) / 2;
              const d =
                from === "bigquery" && to === "insights"
                  ? `M${fn.x + 20},${fn.y + 20} Q${midX},${midY + 10} ${tn.x},${tn.y - 10}`
                  : `M${fn.x + 20},${fn.y + 20} Q${midX},${midY - 20} ${tn.x},${tn.y - 10}`;
              return (
                <path
                  key={`${from}-${to}`}
                  className="arch-conn"
                  d={d}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="1"
                  opacity="0.5"
                  strokeLinecap="round"
                />
              );
            })}
            {ARCH_NODES.map((node) => (
              <g key={node.id} className="arch-node">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="14"
                  fill="var(--color-surface)"
                  stroke="var(--color-accent)"
                  strokeWidth="1.2"
                  style={{ filter: "url(#nodeGlow)" }}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="0.5"
                  opacity="0.3"
                  style={{
                    transformOrigin: `${node.x}px ${node.y}px`,
                    animation: "nodePulse 2.5s ease-in-out infinite",
                  }}
                />
                <text
                  x={node.x}
                  y={node.y + 30}
                  textAnchor="middle"
                  fill="var(--color-accent)"
                  fontSize="5.5"
                  fontWeight="600"
                  fontFamily="monospace"
                  letterSpacing="0.5"
                >
                  {node.label}
                </text>
                <foreignObject
                  className="node-tooltip"
                  x={node.x - 36}
                  y={node.y + 34}
                  width="72"
                  height="18"
                  style={{ opacity: 0, transition: "opacity 0.2s", pointerEvents: "none" }}
                >
                  <div
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-accent)",
                      borderRadius: "4px",
                      padding: "1px 6px",
                      fontSize: "9px",
                      textAlign: "center",
                      color: "var(--color-accent)",
                      fontFamily: "monospace",
                    }}
                  >
                    {node.label}
                  </div>
                </foreignObject>
              </g>
            ))}
            <defs>
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes nodePulse {
          0%, 100% { r: 18; opacity: 0.3; }
          50% { r: 24; opacity: 0.1; }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px var(--color-accent), 0 0 60px var(--color-accent),
                        inset 0 0 20px var(--color-accent-muted);
          }
          50% {
            box-shadow: 0 0 35px var(--color-accent), 0 0 80px var(--color-accent),
                        inset 0 0 30px var(--color-accent-muted);
          }
        }
        .animate-pulse-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .arch-node circle:first-of-type {
          transition: r 0.25s ease;
        }
        .arch-node:hover circle:first-of-type {
          r: 17;
        }
      `}</style>
    </section>
  );
}
