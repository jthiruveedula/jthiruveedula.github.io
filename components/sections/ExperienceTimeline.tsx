"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experience } from "@/lib/data";
import { createHover3DTilt } from "@/lib/gsap-animations";

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const line = timelineRef.current;
      if (line) {
        gsap.fromTo(line,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "#experience",
              start: "top 60%",
              end: "bottom 40%",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      gsap.from(".timeline-card", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#experience",
          start: "top 70%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    const cards = sectionRef.current?.querySelectorAll<HTMLElement>(".timeline-card");
    const cleanups: (() => void)[] = [];
    if (cards) {
      cards.forEach((card) => {
        cleanups.push(createHover3DTilt(card, { scale: 1.02, maxTilt: 3 }));
      });
    }

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section id="experience" ref={sectionRef} aria-label="Experience Timeline" className="relative py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-16">
          <p className="section-eyebrow">Career Timeline</p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Engineering <span style={{ color: "var(--color-accent)" }}>/</span> the Data Supply Chain
          </h2>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
            From industrial automation to enterprise AI — spanning startups, financial services, publishing, and cloud-scale data platforms.
          </p>
        </div>

        <div className="relative">
          <div
            ref={timelineRef}
            className="timeline-line absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5"
            style={{ backgroundColor: "var(--color-glass-border)", transformOrigin: "top center" }}
            aria-hidden="true"
          />

          <div className="space-y-12 md:space-y-16">
            {experience.map((role, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`timeline-card relative flex flex-col md:flex-row gap-6 md:gap-0 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="hidden md:block md:w-1/2" />

                  <div
                    className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full -translate-y-0.5 z-10"
                    style={{ backgroundColor: "var(--color-accent)" }}
                    aria-hidden="true"
                  />

                  <div className={`md:w-1/2 ${isLeft ? "md:pr-10" : "md:pl-10"}`}>
                    <div
                      className="glass rounded-2xl p-6 relative overflow-hidden"
                      style={{ backgroundColor: "var(--color-surface)" }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ backgroundColor: "var(--color-accent)" }}
                        aria-hidden="true"
                      />
                      <div className="pl-2">
                        <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                          {role.company}
                        </p>
                        <p className="text-base font-bold mt-0.5" style={{ color: "var(--color-text-primary)" }}>
                          {role.title}
                        </p>
                        <p className="text-xs font-mono mt-1" style={{ color: "var(--color-text-muted)" }}>
                          {role.period}
                        </p>
                        <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
                          {role.subtitle}
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {role.details.map((detail, di) => (
                            <li key={di} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                              <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-accent)" }} />
                              {detail}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {role.tags.map((tag, ti) => (
                            <span
                              key={ti}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "var(--color-accent-muted)",
                                color: "var(--color-accent)",
                                border: "1px solid var(--color-glass-border)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
