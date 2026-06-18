"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { metrics } from "@/lib/data";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import DataMonitor from "@/components/ui/DataMonitor";
import { useSound } from "@/hooks/useSound";

gsap.registerPlugin(ScrollTrigger);

function particleBurst(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const count = gsap.utils.random(8, 12, 1);

  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    const size = gsap.utils.random(3, 6);
    dot.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: var(--color-accent);
      box-shadow: 0 0 6px var(--color-accent), 0 0 14px var(--color-accent-muted);
      pointer-events: none;
      left: ${cx}px; top: ${cy}px;
      z-index: 10;
    `;
    element.appendChild(dot);

    const angle = gsap.utils.random(0, Math.PI * 2);
    const distance = gsap.utils.random(50, 100);
    gsap.to(dot, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
      duration: gsap.utils.random(0.6, 1.1),
      ease: "power3.out",
      onComplete: () => dot.remove(),
    });
  }
}

export default function ProfessionalMetrics() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { play } = useSound();

  const [reducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".metric-card", {
        opacity: 0,
        scale: 0.3,
        rotation: -10,
        filter: "blur(8px)",
      }, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        filter: "blur(0px)",
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: "#metrics",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });

      gsap.to(".metric-border", {
        scaleX: 1,
        stagger: 0.15,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#metrics",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });

      ScrollTrigger.create({
        trigger: "#metrics",
        start: "top 60%",
        onEnter: () => {
          gsap.to(".bg-pulse", {
            opacity: 0.15,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(".bg-pulse", {
                opacity: 0,
                duration: 1,
                ease: "power2.in",
              });
            },
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  const handleCounterComplete = useCallback((index: number) => {
    play("tick");
    const card = cardRefs.current[index];
    if (card) particleBurst(card);
    const counter = counterRefs.current[index];
    if (counter) {
      gsap.fromTo(counter,
        { scale: 1 },
        {
          scale: 1.15,
          duration: 0.15,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(counter, { scale: 1, duration: 0.35, ease: "power2.inOut" });
          },
        }
      );
      gsap.fromTo(counter,
        { textShadow: "0 0 10px var(--color-accent), 0 0 20px var(--color-accent-muted)" },
        {
          textShadow: "0 0 30px var(--color-accent), 0 0 60px var(--color-accent-muted), 0 0 90px var(--color-accent)",
          duration: 0.15,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(counter, {
              textShadow: "0 0 10px var(--color-accent), 0 0 20px var(--color-accent-muted)",
              duration: 0.35,
              ease: "power2.in",
            });
          },
        }
      );
    }
  }, [play]);

  function parseValue(val: string): { num: number; symbol: string } {
    const match = val.match(/^(\d+)(.*)$/);
    if (!match) return { num: 0, symbol: val };
    return { num: parseInt(match[1], 10), symbol: match[2] };
  }

  return (
    <section id="metrics" ref={sectionRef} aria-label="Professional Metrics" className="relative py-20">
      <div
        className="bg-pulse absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--color-accent-muted) 0%, transparent 70%)",
          opacity: 0,
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
        <div className="mb-12">
          <p className="section-eyebrow">By The Numbers</p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Operating at <span style={{ color: "var(--color-accent)" }}>/</span> Production Scale
          </h2>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          {metrics.map((metric, i) => {
            const { num, symbol } = parseValue(metric.value);
            return (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="metric-card glass glass-hover rounded-2xl p-8 text-center relative transition-all duration-300"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--neon-shadow-md)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
              >
                <div
                  className="metric-border absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    transform: reducedMotion ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                    background: "linear-gradient(90deg, transparent, var(--color-accent), var(--color-accent-secondary), transparent)",
                    boxShadow: "0 0 12px var(--color-accent)",
                  }}
                  aria-hidden="true"
                />
                <div
                  ref={(el) => { counterRefs.current[i] = el; }}
                  className="text-5xl md:text-6xl font-black"
                  style={{ color: "var(--color-accent)", textShadow: "0 0 10px var(--color-accent), 0 0 20px var(--color-accent-muted)" }}
                >
                  <AnimatedCounter end={num} suffix={symbol} onComplete={() => handleCounterComplete(i)} />
                </div>
                <p className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {metric.suffix}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  {metric.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <div className="mb-6 text-center">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--color-accent)" }}>
              Live Telemetry
            </p>
            <h3 className="text-lg md:text-xl font-bold mt-1" style={{ color: "var(--color-text-primary)" }}>
              Last 30 minutes of inference
            </h3>
          </div>
          <div
            className="rounded-2xl border p-4 md:p-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-glass-border)",
              boxShadow: "var(--neon-shadow-sm)",
            }}
          >
            <DataMonitor />
          </div>
        </div>
      </div>
    </section>
  );
}
