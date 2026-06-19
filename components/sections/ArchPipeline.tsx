"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { archPipeline } from "@/lib/data";
import { createHover3DTilt } from "@/lib/gsap-helpers";

gsap.registerPlugin(ScrollTrigger);

const stepIconSvgs: Record<string, React.ReactNode> = {
  database: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  brain: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  code: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  "trending-up": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  cloud: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
};

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
      const path = pathRef.current;
      if (path) {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
      }
      packetRefs.current.forEach((p) => { if (p) p.setAttribute("opacity", "0"); });
      return;
    }

    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    packetRefs.current.forEach((p) => { if (p) p.setAttribute("opacity", "0"); });

    const onDraw = (e: Event) => {
      const detail = (e as CustomEvent<{ index: number }>).detail;
      if (detail?.index !== index) return;
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 0.45,
        ease: "power2.out",
      });
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
        (svg as unknown as { __tweens?: gsap.core.Tween[] }).__tweens = (
          svg as unknown as { __tweens?: gsap.core.Tween[] }
        ).__tweens || [];
        (svg as unknown as { __tweens: gsap.core.Tween[] }).__tweens.push(tween);
      });
    };
    window.addEventListener("pipeline:connector-draw", onDraw as EventListener);

    return () => {
      window.removeEventListener("pipeline:connector-draw", onDraw as EventListener);
      const tweens = (svg as unknown as { __tweens?: gsap.core.Tween[] }).__tweens;
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
          style={{ filter: "drop-shadow(0 0 2px rgba(201, 168, 76, 0.2))" }}
        />
        {Array.from({ length: packetCount }).map((_, i) => (
          <circle
            key={i}
            ref={(el) => { packetRefs.current[i] = el; }}
            r="1.6"
            fill="var(--color-accent)"
            opacity="0"
            style={{ filter: "drop-shadow(0 0 2px rgba(201, 168, 76, 0.2))" }}
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
}: {
  step: number;
  icon: string;
  title: string;
  subline: string;
  details: string;
  tags: string[];
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

  const handleEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setTooltipOpen(true);
  };
  const handleLeave = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setTooltipOpen(false), 120);
  };
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget.dataset.hoverOnly === "true") return;
    setTooltipOpen((v) => !v);
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
      <div className="absolute left-0 top-0 bottom-0 w-[3px] pipeline-card-bar" style={{ background: "var(--gradient-accent)" }} />
      <div className="p-5 relative z-[2]">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 pipeline-step-num"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "0 0 6px rgba(201, 168, 76, 0.2)" }}
          >
            {step}
          </span>
          <span className="text-lg" style={{ color: "var(--color-accent)" }} aria-hidden>
            {stepIconSvgs[icon] || stepIconSvgs.code}
          </span>
        </div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </h3>
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const localTweens: gsap.core.Tween[] = [];

    if (reduced) {
      gsap.set(".pipeline-card", { opacity: 1, scale: 1, clearProps: "filter" });
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 0 } }));
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 1 } }));
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 2 } }));
      window.dispatchEvent(new CustomEvent("pipeline:connector-draw", { detail: { index: 3 } }));
      return;
    }

    gsap.set(".pipeline-card", { opacity: 0, scale: 0.94, filter: "blur(6px)" });

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".pipeline-card");
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true,
        },
      });

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
  }, []);

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
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            From Raw Data to <span style={{ color: "var(--color-accent)" }}>/</span> Production Intelligence
          </h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Five-stage pipeline from ingestion to production serving with enterprise governance.
          </p>
        </div>

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
              />
              {i < archPipeline.length - 1 && <PipelineConnector index={i} horizontal packetCount={4} />}
            </div>
          ))}
        </div>

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
