"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface ArchNode {
  id: string;
  label: string;
  icon: "layers" | "download" | "database" | "cycle" | "brain" | "sparkles" | "chart";
  x: number;
  y: number;
  r?: number;
  desc: string;
  central?: boolean;
}

const NODES: ArchNode[] = [
  { id: "sources", label: "Sources", icon: "layers", x: 80, y: 80, desc: "APIs · Streams · Batch · Drive" },
  { id: "ingest", label: "Ingest", icon: "download", x: 230, y: 80, desc: "Pub/Sub · Dataflow" },
  { id: "bigquery", label: "BigQuery", icon: "database", x: 400, y: 170, r: 28, desc: "Warehouse · Analytics Engine", central: true },
  { id: "transform", label: "Transform", icon: "cycle", x: 230, y: 270, desc: "Airflow · Dataform · SQL" },
  { id: "vertex", label: "Vertex AI", icon: "brain", x: 570, y: 170, desc: "Embeddings · Training" },
  { id: "gemini", label: "Gemini", icon: "sparkles", x: 570, y: 80, desc: "LLM Inference · RAG" },
  { id: "insights", label: "Insights", icon: "chart", x: 710, y: 230, desc: "Dashboards · Agents · APIs" },
];

const CONNECTIONS = [
  { from: "sources", to: "ingest" },
  { from: "ingest", to: "bigquery" },
  { from: "bigquery", to: "transform" },
  { from: "transform", to: "vertex" },
  { from: "vertex", to: "gemini" },
  { from: "gemini", to: "insights" },
  { from: "bigquery", to: "insights", dashed: true },
];

const REVEAL_ORDER = ["sources", "ingest", "bigquery", "transform", "vertex", "gemini", "insights"];

const ICON_PATHS: Record<string, React.ReactNode> = {
  layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.5L4 10l8 3.5L20 10l-8-3.5zM4 14l8 3.5L20 14" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" />,
  database: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-4.4 0-8 1.3-8 3v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6c0-1.7-3.6-3-8-3zm0 0v18M4 9c0 1.7 3.6 3 8 3s8-1.3 8-3" />,
  cycle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M18 4v3h-3M6 20v-3h3" />,
  brain: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.5 8a2.5 2.5 0 010 5H9m5.5-5a2.5 2.5 0 000 5H15M9 13v4a2 2 0 002 2h2a2 2 0 002-2v-4M12 6V4" />,
  sparkles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />,
  chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 19V5m0 14h16M8 15l3-4 3 3 4-6" />,
};

function buildPath(from: ArchNode, to: ArchNode): string {
  const fx = from.x + (from.r || 18);
  const fy = from.y;
  const tx = to.x - (to.r || 18);
  const ty = to.y;
  const dx = tx - fx;
  const midX = fx + dx * 0.5;
  const curveOffset = Math.abs(ty - fy) > 40 ? (ty > fy ? 35 : -35) : 0;
  return `M${fx},${fy} C${midX},${fy + curveOffset} ${midX},${ty - curveOffset} ${tx},${ty}`;
}

export default function ArchDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;
    const reduced = prefersReducedMotion();

    if (reduced) {
      svg.querySelectorAll<SVGPathElement>(".conn-draw").forEach((p) => {
        p.style.strokeDasharray = "none";
        p.style.strokeDashoffset = "0";
      });
      return;
    }

    const localTweens: gsap.core.Tween[] = [];
    let ambientStarted = false;
    const ctx = gsap.context(() => {
      const drawPaths = svg.querySelectorAll<SVGPathElement>(".conn-draw");
      const cometPaths = svg.querySelectorAll<SVGPathElement>(".conn-comet");
      const nodes = svg.querySelectorAll<SVGGElement>(".arch-node");
      const ripples = svg.querySelectorAll<SVGCircleElement>(".node-ripple");

      gsap.set(nodes, { opacity: 0, scale: 0.3, transformOrigin: "center", transformBox: "fill-box" });
      gsap.set(cometPaths, { opacity: 0 });
      gsap.set(ripples, { scale: 0.3, opacity: 0, transformOrigin: "center", transformBox: "fill-box" });

      drawPaths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });

      REVEAL_ORDER.forEach((id, i) => {
        const node = svg.querySelector<SVGGElement>(`.arch-node[data-id="${id}"]`);
        const ripple = svg.querySelector<SVGCircleElement>(`.node-ripple[data-id="${id}"]`);
        if (!node) return;
        const delay = i * 0.15;

        tl.to(node, {
          opacity: 1,
          scale: 1,
          duration: DUR.base,
          ease: EASE.snap,
        }, delay);

        if (ripple) {
          tl.to(ripple, {
            scale: 2.8,
            opacity: 0.5,
            duration: DUR.micro,
            ease: EASE.soft,
          }, delay + 0.15)
          .to(ripple, {
            scale: 4,
            opacity: 0,
            duration: DUR.base,
            ease: "power2.in",
          }, delay + 0.35);
        }

        if (i < CONNECTIONS.length) {
          const conn = CONNECTIONS[i];
          const drawPath = svg.querySelector<SVGPathElement>(`.conn-draw[data-pair="${conn.from}-${conn.to}"]`);
          const cometPath = svg.querySelector<SVGPathElement>(`.conn-comet[data-pair="${conn.from}-${conn.to}"]`);
          if (drawPath) {
            tl.to(drawPath, {
              strokeDashoffset: 0,
              duration: 0.6,
              ease: "power2.inOut",
            }, delay + 0.2);
          }
          if (cometPath) {
            tl.to(cometPath, { opacity: 1, duration: DUR.micro }, delay + 0.5);
          }
        }
      });

      tl.call(() => {
        if (ambientStarted) return;
        ambientStarted = true;

        cometPaths.forEach((path, i) => {
          const len = path.getTotalLength();
          const segmentLen = 28;
          path.style.strokeDasharray = `${segmentLen} ${len + segmentLen}`;
          const tween = gsap.to(path, {
            strokeDashoffset: -(len + segmentLen),
            duration: 2.2 + (i * 0.3),
            repeat: -1,
            ease: "none",
            delay: i * 0.25,
          });
          localTweens.push(tween);
        });

        const bqNode = svg.querySelector<SVGGElement>('.arch-node[data-id="bigquery"]');
        if (bqNode) {
          const tween = gsap.to(bqNode, {
            scale: 1.05,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: "center",
            transformBox: "fill-box",
          });
          localTweens.push(tween);
        }

        const insightsNode = svg.querySelector<SVGGElement>('.arch-node[data-id="insights"]');
        if (insightsNode) {
          const rippleClone = svg.querySelector<SVGCircleElement>('.node-ripple[data-id="insights"]');
          if (rippleClone) {
            const tween = gsap.to(rippleClone, {
              scale: 4,
              opacity: 0,
              duration: 2.5,
              repeat: -1,
              ease: "power1.out",
              transformOrigin: "center",
              transformBox: "fill-box",
              repeatDelay: 1.5,
            });
            localTweens.push(tween);
          }
        }
      }, [], "+=0.3");
    }, section);

    return () => {
      ctx.revert();
      localTweens.forEach((t) => t.kill());
    };
  }, []);

  const connectedTo = (id: string): Set<string> => {
    const result = new Set<string>();
    CONNECTIONS.forEach((c) => {
      if (c.from === id) result.add(`${c.from}-${c.to}`);
      if (c.to === id) result.add(`${c.from}-${c.to}`);
    });
    return result;
  };

  const highlightedConns = hovered ? connectedTo(hovered) : null;

  return (
    <div ref={sectionRef} className="arch-diagram relative">
      <svg
        ref={svgRef}
        viewBox="0 0 780 320"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 0 8px rgba(201,168,76,0.12))" }}
      >
        <defs>
          <filter id="arch-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="arch-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="conn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="node-fill" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(201,168,76,0.1)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </radialGradient>
          <radialGradient id="node-fill-central" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(201,168,76,0.2)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </radialGradient>
        </defs>

        {CONNECTIONS.map(({ from, to, dashed }) => {
          const fn = NODES.find((n) => n.id === from)!;
          const tn = NODES.find((n) => n.id === to)!;
          const d = buildPath(fn, tn);
          const pair = `${from}-${to}`;
          const isHighlighted = highlightedConns?.has(pair);
          const isDimmed = highlightedConns && !isHighlighted;

          return (
            <g key={pair}>
              <path
                d={d}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={isHighlighted ? 1.5 : 0.8}
                strokeOpacity={isDimmed ? 0.08 : 0.18}
                strokeDasharray={dashed ? "4 6" : undefined}
                strokeLinecap="round"
              />
              <path
                className="conn-draw"
                data-pair={pair}
                d={d}
                fill="none"
                stroke="url(#conn-gradient)"
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeOpacity={isDimmed ? 0.08 : 0.6}
                strokeLinecap="round"
                filter="url(#arch-glow)"
              />
              <path
                className="conn-comet"
                data-pair={pair}
                d={d}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={3}
                strokeLinecap="round"
                filter="url(#arch-glow-strong)"
                opacity={0}
              />
            </g>
          );
        })}

        {NODES.map((node) => {
          const r = node.r || 18;
          const isHovered = hovered === node.id;
          const isDimmed = hovered && !isHovered && !highlightedConns?.has(`${node.id}`) && !CONNECTIONS.some(c => (c.from === node.id || c.to === node.id) && highlightedConns?.has(`${c.from}-${c.to}`));
          return (
            <g
              key={node.id}
              className="arch-node"
              data-id={node.id}
              style={{ transformBox: "fill-box", transformOrigin: "center", cursor: "pointer" }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              opacity={isDimmed ? 0.25 : 1}
            >
              <circle
                className="node-ripple"
                data-id={node.id}
                cx={node.x}
                cy={node.y}
                r={r}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={1}
                opacity={0}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={r + 6}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={0.4}
                opacity={isHovered ? 0.5 : 0.12}
                style={{ transition: "opacity 0.3s" }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={r + 3}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={0.3}
                opacity={isHovered ? 0.3 : 0.08}
                style={{ transition: "opacity 0.3s" }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={node.central ? "url(#node-fill-central)" : "url(#node-fill)"}
                stroke="var(--color-accent)"
                strokeWidth={node.central ? 2 : 1.2}
                filter={isHovered ? "url(#arch-glow-strong)" : "url(#arch-glow)"}
                style={{ transition: "stroke-width 0.3s" }}
              />
              <g
                transform={`translate(${node.x - 9}, ${node.y - 9})`}
                style={{ color: "var(--color-accent)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  {ICON_PATHS[node.icon]}
                </svg>
              </g>
              <text
                x={node.x}
                y={node.y + r + 14}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize="7"
                fontWeight="500"
                fontFamily="var(--font-mono)"
                letterSpacing="0.3"
                opacity={isHovered ? 1 : 0.65}
                style={{ transition: "opacity 0.3s" }}
              >
                {node.label}
              </text>
              {isHovered && (
                <foreignObject
                  x={node.x - 60}
                  y={node.y - r - 32}
                  width="120"
                  height="22"
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-accent)",
                      borderRadius: "4px",
                      padding: "3px 10px",
                      fontSize: "8px",
                      textAlign: "center",
                      color: "var(--color-accent)",
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                    }}
                  >
                    {node.desc}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
