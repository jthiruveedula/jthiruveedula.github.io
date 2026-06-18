"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { archPipeline } from "@/lib/data";
import { createHover3DTilt } from "@/lib/gsap-animations";

gsap.registerPlugin(ScrollTrigger);

const stepIcons: Record<string, string> = {
  database: "\u{1F4E6}",
  brain: "\u{1F9E0}",
  code: "\u{1F4C1}",
  "trending-up": "\u{1F4C8}",
  cloud: "\u{2601}\uFE0F",
};

function ConnectorArrow() {
  return (
    <div className="hidden md:flex shrink-0 items-center justify-center w-8 pt-10" aria-hidden>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--color-accent)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </div>
  );
}

function PipelineCard({ step, icon, title, subtitle, description, tags, index }: {
  step: number;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  index: number;
}) {
  return (
    <div
      className="pipeline-card glass rounded-2xl overflow-hidden relative flex-1 min-w-0"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-glass-border)" }}
      data-hoverable
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "var(--color-accent)" }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
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
        <p className="text-xs font-medium mb-1" style={{ color: "var(--color-accent)" }}>
          {subtitle}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {description}
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
    </div>
  );
}

export default function ArchPipeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const mobileProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".pipeline-card", {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#pipeline",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "#pipeline",
              start: "top 60%",
              end: "bottom 40%",
              scrub: 1,
            },
          }
        );
      }
      if (mobileProgressRef.current) {
        gsap.fromTo(
          mobileProgressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "#pipeline",
              start: "top 60%",
              end: "bottom 40%",
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".pipeline-card");
    if (!cards || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];
    cards.forEach((card) => {
      cleanups.push(createHover3DTilt(card as HTMLElement, { scale: 1.03, maxTilt: 4 }));
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section id="pipeline" ref={sectionRef} className="relative py-28" style={{ backgroundColor: "var(--color-bg)", borderTop: "1px solid var(--color-glass-border)" }} aria-label="Architecture Pipeline">
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

        {/* Desktop progress line */}
        <div className="hidden md:block absolute left-0 right-0 h-[2px] top-[184px]" style={{ backgroundColor: "var(--color-glass-border)" }}>
          <div
            ref={progressRef}
            className="h-full origin-left"
            style={{ backgroundColor: "var(--color-accent)", transform: "scaleX(0)" }}
          />
        </div>

        {/* Desktop horizontal flow */}
        <div className="hidden md:flex items-start justify-center gap-0 relative" style={{ paddingTop: "28px" }}>
          {archPipeline.map((step, i) => (
            <div key={step.step} className="flex items-start">
              <PipelineCard
                step={step.step}
                icon={step.icon}
                title={step.title}
                subtitle={step.subtitle}
                description={step.description}
                tags={step.tags}
                index={i}
              />
              {i < archPipeline.length - 1 && <ConnectorArrow />}
            </div>
          ))}
        </div>

        {/* Mobile vertical stack */}
        <div className="md:hidden relative">
          {/* Mobile progress line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px]" style={{ backgroundColor: "var(--color-glass-border)" }}>
            <div
              ref={mobileProgressRef}
              className="w-full origin-top"
              style={{ backgroundColor: "var(--color-accent)", transform: "scaleY(0)" }}
            />
          </div>

          <div className="space-y-6">
            {archPipeline.map((step, i) => (
              <div key={step.step} className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold -ml-[17px]" style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>
                  {step.step}
                </div>
                <PipelineCard
                  step={step.step}
                  icon={step.icon}
                  title={step.title}
                  subtitle={step.subtitle}
                  description={step.description}
                  tags={step.tags}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
