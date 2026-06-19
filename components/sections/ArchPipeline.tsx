"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { archPipeline } from "@/lib/data";
import { createHover3DTilt } from "@/lib/gsap-helpers";
import { useSound } from "@/hooks/useSound";

gsap.registerPlugin(ScrollTrigger);

const stepIcons: Record<string, string> = {
  database: "\u{1F4E6}",
  brain: "\u{1F9E0}",
  code: "\u{1F4C1}",
  "trending-up": "\u{1F4C8}",
  cloud: "\u2601\uFE0F",
};

// UPGRADE: visual storytelling — connector carries a drawn SVG path + animated data packets
function PipelineConnector({
  index,
  horizontal = true,
  packetCount = 4,
}: {
  index: number;
  horizontal?: boolean;
  packetCount?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const packetRefs = useRef<Array<SVGCircleElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // UPGRADE: static fallback — path drawn, packets hidden
      const path = pathRef.current;
      if (path) {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
      }
      packetRefs.current.forEach((p) => { if (p) p.setAttribute("opacity", "0"); });
      return;
    }

    // UPGRADE: register this connector with the parent's master timeline via a custom event
    // so the parent can drive draw-in + packet ignition in sequence.
    const path = pathRef.current;
    if (!path || !svgRef.current) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    packetRefs.current.forEach((p) => { if (p) p.setAttribute("opacity", "0"); });

    const onDraw = (e: Event) => {
      const detail = (e as CustomEvent<{ index: number }>).detail;
      if (detail?.index !== index) return;
      // UPGRADE: draw-in tween on the path
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 0.45,
        ease: "power2.out",
      });
      // UPGRADE: ignite looping packets on this connector
      packetRefs.current.forEach((p, pi) => {
        if (!p) return;
        gsap.to(p, { opacity: 0.85, duration: 0.2, delay: pi * 0.05 });
        const obj = { t: 0 };
        const tween = gsap.to(obj, {
          t: 1,
          duration: 2.4 + pi * 0.3,
          delay: pi * 0.4,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            const pt = path.getPointAtLength(obj.t * len);
            p.setAttribute("cx", String(pt.x));
            p.setAttribute("cy", String(pt.y));
          },
        });
        // UPGRADE: register the tween for cleanup via a ref on the svg element
        (svgRef.current as unknown as { __tweens?: gsap.core.Tween[] }).__tweens = (
          svgRef.current as unknown as { __tweens?: gsap.core.Tween[] }
        ).__tweens || [];
        (svgRef.current as unknown as { __tweens: gsap.core.Tween[] }).__tweens.push(tween);
      });
    };
    window.addEventListener("pipeline:connector-draw", onDraw as EventListener);

    return () => {
      window.removeEventListener("pipeline:connector-draw", onDraw as EventListener);
      const tweens = (svgRef.current as unknown as { __tweens?: gsap.core.Tween[] })?.__tweens;
      tweens?.forEach((t) => t.kill());
    };
  }, [index]);

  const pathD = horizontal ? "M 2 14 Q 32 2 62 14" : "M 14 2 Q 2 24 14 46";
  const dims = horizontal
    ? { width: 64, height: 16 }
    : { width: 28, height: 48 };

  return (
    <div
      className={horizontal ? "shrink-0 w-16 self-center" : "self-center ml-1"}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        className={horizontal ? "w-16 h-4" : "w-7 h-12"}
        style={{ overflow: "visible" }}
      >
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
          style={{ filter: "drop-shadow(0 0 4px var(--color-accent))" }}
        />
        {Array.from({ length: packetCount }).map((_, i) => (
          <circle
            key={i}
            ref={(el) => { packetRefs.current[i] = el; }}
            r="1.6"
            fill="var(--color-accent)"
            opacity="0"
            style={{ filter: "drop-shadow(0 0 4px var(--color-accent))" }}
          />
        ))}
      </svg>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  subline,
  details,
  tags,
  onActivate,
}: {
  step: number;
  icon: string;
  title: string;
  subline: string;
  details: string;
  tags: string[];
  onActivate?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanup = createHover3DTilt(el, { scale: 1.03, maxTilt: 3 });
    return () => { cleanup(); };
  }, []);

  // UPGRADE: hover opens tooltip; mouseleave closes after a small grace period
  // so a fast mouse move to the tooltip itself doesn't blink it off
  const handleEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setTooltipOpen(true);
  };
  const handleLeave = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setTooltipOpen(false), 120);
  };
  // UPGRADE: tap (mobile) toggles tooltip — no hover reliance on coarse pointers
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget.dataset.hoverOnly === "true") return;
    setTooltipOpen((v) => !v);
    onActivate?.();
  };

  return (
    <div
      ref={cardRef}
      data-hoverable
      data-step={step}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className="pipeline-card glass rounded-2xl overflow-hidden relative flex-1 min-w-0 scanline cursor-pointer"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-glass-border)",
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] pipeline-card-bar" style={{ background: "var(--gradient-neon)" }} />
      <div className="p-5 relative z-[2]">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 pipeline-step-num"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "0 0 10px var(--color-accent)" }}
          >
            {step}
          </span>
          <span className="text-lg" style={{ color: "var(--color-accent)" }} aria-hidden>
            {stepIcons[icon] || stepIcons.code}
          </span>
        </div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </h3>
        {/* UPGRADE: minimal subline by default — long copy lives in the tooltip */}
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {subline}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono"
                style={{ backgroundColor: "var(--color-accent-muted)", color: "var(--color-text-muted)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* UPGRADE: tooltip — 1-2 lines, hover (desktop) / tap (mobile) */}
      <div
        className="pipeline-tooltip absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 z-20 pointer-events-none"
        style={{
          opacity: tooltipOpen ? 1 : 0,
          transform: `translate(-50%, ${tooltipOpen ? 0 : 4}px)`,
          transition: "opacity 180ms ease, transform 180ms ease",
        }}
        aria-hidden={!tooltipOpen}
      >
        <div
          className="rounded-lg p-3 text-[11px] leading-relaxed"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-bg) 95%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 50%, transparent)",
            color: "var(--color-text-secondary)",
            boxShadow: "0 0 16px color-mix(in srgb, var(--color-accent) 25%, transparent)",
            backdropFilter: "blur(8px)",
          }}
        >
          {details}
        </div>
      </div>
    </div>
  );
}

export default function ArchPipeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // UPGRADE: localTweens holds any infinite tween that escapes the master gsap.context
    // so we can clean them up on unmount.
    const localTweens: gsap.core.Tween[] = [];

    if (reduced) {
      // UPGRADE: static fallback — all cards powered on, all paths drawn, no packets
      gsap.set(".pipeline-card", { opacity: 1, scale: 1, clearProps: "filter" });
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 0 } }));
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 1 } }));
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 2 } }));
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 3 } }));
      return;
    }

    // UPGRADE: pre-hide cards (they'll power on in sequence)
    gsap.set(".pipeline-card", { opacity: 0, scale: 0.94, filter: "blur(6px)" });

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".pipeline-card");
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true,
          onEnter: () => play("sweep"),
        },
      });

      // UPGRADE: each card "powers on" with a glow + scale-in, then a connector draws,
      // and the next card powers on — left → right story flow.
      cards.forEach((card, i) => {
        masterTl.to(
          card,
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power2.out",
            onStart: () => {
              // UPGRADE: neon border pulse on activation
              gsap.fromTo(
                card,
                { boxShadow: "0 0 0 0 color-mix(in srgb, var(--color-accent) 0%, transparent)" },
                {
                  boxShadow: "0 0 24px 0 color-mix(in srgb, var(--color-accent) 45%, transparent)",
                  duration: 0.6,
                  yoyo: true,
                  repeat: 1,
                  ease: "power2.out",
                }
              );
            },
          },
          i * 0.4
        );
        if (i < cards.length - 1) {
          masterTl.call(() => {
            // UPGRADE: signal the next connector to draw + ignite its packets
            window.dispatchEvent(
              new CustomEvent("pipeline:connector-draw", { detail: { index: i } })
            );
          }, [], i * 0.4 + 0.3);
        }
      });
    }, section);

    return () => {
      ctx.revert();
      localTweens.forEach((t) => t.kill());
      localTweens.length = 0;
    };
  }, [play]);

  return (
    <section
      id="pipeline"
      ref={sectionRef}
      className="relative py-28"
      style={{ backgroundColor: "var(--color-bg)", borderTop: "1px solid var(--color-glass-border)" }}
      aria-label="Architecture Pipeline"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 max-w-3xl mx-auto text-center">
          <p className="section-eyebrow">Architecture Pipeline</p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            From Raw Data to <span style={{ color: "var(--color-accent)" }}>/</span> Production Intelligence
          </h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Five-stage pipeline from ingestion to production serving with enterprise governance.
          </p>
        </div>

        {/* UPGRADE: desktop — horizontal story strip with SVG connectors between cards */}
        <div
          ref={cardsContainerRef}
          className="hidden md:flex items-stretch justify-center gap-0 relative"
        >
          {archPipeline.map((step, i) => (
            <div key={step.step} className="flex items-stretch" style={{ flex: 1 }}>
              <StepCard
                step={step.step}
                icon={step.icon}
                title={step.title}
                subline={step.subline}
                details={step.details}
                tags={step.tags}
                onActivate={() => play("tick")}
              />
              {i < archPipeline.length - 1 && <PipelineConnector index={i} horizontal packetCount={4} />}
            </div>
          ))}
        </div>

        {/* UPGRADE: mobile — vertical story with shorter connectors + 50% fewer packets */}
        <div className="md:hidden">
          {archPipeline.map((step, i) => (
            <div key={step.step}>
              <StepCard
                step={step.step}
                icon={step.icon}
                title={step.title}
                subline={step.subline}
                details={step.details}
                tags={step.tags}
                onActivate={() => play("tick")}
              />
              {i < archPipeline.length - 1 && (
                <div className="pl-3 py-2">
                  <PipelineConnector index={i} horizontal={false} packetCount={2} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
