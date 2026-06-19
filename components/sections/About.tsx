"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/data";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useSound } from "@/hooks/useSound";

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  // UPGRADE: numeric=null skips CountUp (used for the "GCP" static label card)
  value: number | null;
  prefix: string;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 6, prefix: "", suffix: "+", label: "Production GenAI" },
  { value: 12, prefix: "", suffix: "M+", label: "RAG Pipelines" },
  { value: null, prefix: "GCP", suffix: "", label: "Data Platforms" },
  { value: 60, prefix: "", suffix: "%", label: "Latency Cut" },
];

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

// UPGRADE: visual order of node reveal pulse (left → right pipeline flow)
const REVEAL_ORDER = ["sources", "ingestion", "bigquery", "transform", "aiml", "insights"];

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKMNOPQRSTUVWXYZ0123456789";

// UPGRADE: ScrambleText-style effect driven by rAF — used after CountUp to settle the label
function scrambleTo(el: HTMLElement, final: string, duration = 0.6): void {
  if (typeof window === "undefined") return;
  const start = performance.now();
  const len = final.length;
  function frame(now: number) {
    const elapsed = now - start;
    const t = Math.min(elapsed / (duration * 1000), 1);
    let out = "";
    for (let i = 0; i < len; i++) {
      if (final[i] === " ") {
        out += " ";
        continue;
      }
      // UPGRADE: each char settles at a staggered time (0.3 .. 1.0) for a left-to-right reveal
      const settleAt = 0.3 + (i / Math.max(len - 1, 1)) * 0.7;
      if (t < settleAt) {
        out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      } else {
        out += final[i];
      }
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = final;
  }
  requestAnimationFrame(frame);
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { normalizedX, normalizedY } = useMousePosition();
  const { play } = useSound();
  const svgRef = useRef<SVGSVGElement>(null);
  // UPGRADE: typed refs for the per-card number div, label div, arc path, and packet circle
  const numRefs = useRef<Array<HTMLDivElement | null>>([]);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const connRefs = useRef<Array<SVGPathElement | null>>([]);
  const packetRefs = useRef<Array<SVGCircleElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // UPGRADE: reduced-motion path — render final state synchronously, no motion
      STATS.forEach((stat, i) => {
        const numEl = numRefs.current[i];
        if (numEl) {
          const finalText = stat.value === null
            ? stat.prefix
            : `${stat.prefix}${stat.value}${stat.suffix}`;
          numEl.textContent = finalText;
        }
        const labelEl = labelRefs.current[i];
        if (labelEl) labelEl.textContent = stat.label;
      });
      connRefs.current.forEach((p) => {
        if (p) {
          p.style.strokeDasharray = "none";
          p.style.strokeDashoffset = "0";
        }
      });
      packetRefs.current.forEach((p) => {
        if (p) p.setAttribute("opacity", "0");
      });
      return;
    }

    // UPGRADE: tweens spawned inside masterTl.call callbacks are not auto-collected by
    // gsap.context(), so we track them locally and kill on cleanup.
    const localTweens: gsap.core.Tween[] = [];

    // UPGRADE: pre-hide scroll-driven elements so they don't flash visible before the timeline hides them
    gsap.set(".about-eyebrow", { opacity: 0, y: 20 });
    gsap.set(".bio-char", { opacity: 0 });
    gsap.set(".bg-flow-line", { opacity: 0, x: -60 });

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
          onEnter: () => play("shimmer"),
        },
      });

      // Stage 0 — section content fades in
      // UPGRADE: fromTo with explicit end states — pre-hide via gsap.set above
      // means .from() would record hidden state as end state and never reveal.
      masterTl.fromTo(".about-eyebrow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0);
      masterTl.fromTo(".bio-char", { opacity: 0 }, { opacity: 1, duration: 0.04, stagger: 0.008, ease: "none" }, 0.1);
      masterTl.fromTo(".bg-flow-line", { opacity: 0, x: -60 }, { opacity: 1, x: 0, stagger: 0.06, duration: 1, ease: "power2.out" }, 0.2);

      // Stage 1 — metric cards rise + fade in
      masterTl.add("cards", 0.3);
      masterTl.fromTo(".about-stat", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }, "cards");

      // Stage 2 — CountUp on the numeric stat values
      masterTl.add("countup", "cards+=0.3");
      STATS.forEach((stat, i) => {
        const numEl = numRefs.current[i];
        const labelEl = labelRefs.current[i];
        if (!numEl || !labelEl) return;
        if (stat.value === null) {
          // UPGRADE: "GCP" — no CountUp, render final immediately
          numEl.textContent = stat.prefix;
          return;
        }
        const target = stat.value;
        const obj = { v: 0 };
        masterTl.to(obj, {
          v: target,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: () => {
            numEl.textContent = `${stat.prefix}${Math.floor(obj.v)}${stat.suffix}`;
          },
          onComplete: () => {
            numEl.textContent = `${stat.prefix}${target}${stat.suffix}`;
            // UPGRADE: post-CountUp — settle the label with a brief scramble
            scrambleTo(labelEl, stat.label, 0.5);
          },
        }, "countup");
      });

      // Stage 3 — arch connections draw in via strokeDashoffset
      masterTl.add("conns", "countup+=0.2");
      connRefs.current.forEach((p) => {
        if (!p) return;
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });
      masterTl.to(".arch-conn", {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: "power2.inOut",
      }, "conns");

      // Stage 4 — node pulse reveal L→R (sources → ingestion → bigquery → transform → aiml → insights)
      masterTl.add("nodes", "conns+=0.4");
      REVEAL_ORDER.forEach((id, i) => {
        const node = section.querySelector<SVGGElement>(`.arch-node[data-id="${id}"]`);
        if (!node) return;
        masterTl.to(node, {
          scale: 1.12,
          duration: 0.3,
          ease: "power2.out",
        }, `nodes+=${i * 0.16}`);
        masterTl.to(node, {
          scale: 1,
          duration: 0.4,
          ease: "power2.in",
        }, `nodes+=${i * 0.16 + 0.3}`);
      });

      // Stage 5 — start the looping data-packet motion along each arc
      masterTl.call(() => {
        packetRefs.current.forEach((p) => {
          if (p) p.setAttribute("opacity", "0.7");
        });
        connRefs.current.forEach((path, i) => {
          const packet = packetRefs.current[i];
          if (!path || !packet) return;
          const len = path.getTotalLength();
          const obj = { t: 0 };
          // UPGRADE: per-arc rAF-equivalent tween — staggered durations + delays for organic flow
          const tween = gsap.to(obj, {
            t: 1,
            duration: 2.8 + (i * 0.35),
            repeat: -1,
            ease: "none",
            delay: i * 0.4,
            onUpdate: () => {
              const pt = path.getPointAtLength(obj.t * len);
              packet.setAttribute("cx", String(pt.x));
              packet.setAttribute("cy", String(pt.y));
            },
          });
          localTweens.push(tween);
        });
      }, [], "nodes+=0.9");

      // Stage 6 — subtle infinite breathing glow on the final "Insights" node
      masterTl.call(() => {
        const insights = section.querySelector<SVGGElement>('.arch-node[data-id="insights"]');
        if (!insights) return;
        const tween = gsap.to(insights, {
          scale: 1.04,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        localTweens.push(tween);
      }, [], "nodes+=1.4");
    }, section);

    return () => {
      ctx.revert();
      // UPGRADE: kill any infinite tweens that escaped the gsap.context (packets + insights)
      localTweens.forEach((t) => t.kill());
      localTweens.length = 0;
    };
  }, [play]);

  // UPGRADE: mouse-based tooltip listener preserved (independent of motion paths)
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!svgRef.current) return;
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
          {STATS.map((stat, i) => (
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
                  background: `linear-gradient(135deg, var(--color-accent) 8, transparent)`,
                }}
              />
              <div
                ref={(el) => { numRefs.current[i] = el; }}
                className="text-2xl md:text-3xl font-black font-mono relative z-10"
                style={{
                  color: stat.value === null
                    ? "var(--color-accent-tertiary)"
                    : "var(--color-accent)",
                }}
              >
                {/* UPGRADE: initial render shows 0 (or static prefix for GCP); CountUp overrides */}
                {stat.value === null ? stat.prefix : `0${stat.suffix}`}
              </div>
              <div
                ref={(el) => { labelRefs.current[i] = el; }}
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
            {CONNECTIONS.map(({ from, to }, i) => {
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
                  ref={(el) => { connRefs.current[i] = el; }}
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
            {/* UPGRADE: data packet circles that travel along each connection via rAF-equivalent tween */}
            {CONNECTIONS.map(({ from, to }, i) => (
              <circle
                key={`packet-${from}-${to}`}
                ref={(el) => { packetRefs.current[i] = el; }}
                className="arch-packet"
                r="2.2"
                fill="var(--color-accent)"
                opacity="0"
                filter="url(#nodeGlow)"
                aria-hidden="true"
              />
            ))}
            {ARCH_NODES.map((node) => (
              <g
                key={node.id}
                className="arch-node"
                data-id={node.id}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
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
          0%, 100% { r: 18; opacity: 0.2; }
          50% { r: 24; opacity: 0.08; }
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
