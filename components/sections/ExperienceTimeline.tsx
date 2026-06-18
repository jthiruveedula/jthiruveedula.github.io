"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { experience } from "@/lib/data";
import { createHover3DTilt } from "@/lib/gsap-helpers";
import { useSound } from "@/hooks/useSound";

gsap.registerPlugin(ScrollTrigger, SplitText);

const highlightAccents: Record<string, string> = {
  Production: "#34d399",
  Enterprise: "#6366f1",
  Pipeline: "#06b6d4",
  "Real-time": "#fbbf24",
};

const highlightIcons: Record<string, React.ReactNode> = {
  Production: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Enterprise: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Pipeline: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
  ),
  "Real-time": (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function extractStartYear(period: string): string {
  const match = period.match(/\b(20\d{2})\b/);
  return match ? match[1] : "";
}

function TimelineDot({ year, highlight }: { year: string; highlight: string }) {
  const accent = highlightAccents[highlight] || "var(--color-accent)";
  return (
    <>
      <div
        className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full -translate-y-0.5 z-10"
        style={{
          backgroundColor: accent,
          boxShadow: `0 0 8px ${accent}, 0 0 16px ${accent}80`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute left-4 md:left-1/2 md:-translate-x-1/2 translate-y-3 mt-1 z-10 select-none"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span
          className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: "var(--color-bg)",
            border: `1px solid ${accent}40`,
            color: accent,
          }}
        >
          {year}
        </span>
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={`ripple-${i}`}
          className="timeline-ripple absolute left-4 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full -translate-y-0.5 pointer-events-none"
          style={{ backgroundColor: "transparent", border: `1px solid ${accent}`, opacity: 0 }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

function Particle({ delay }: { delay: number }) {
  return (
    <div
      className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
      style={{
        backgroundColor: "var(--color-accent)",
        boxShadow: "0 0 6px var(--color-accent), 0 0 12px var(--color-accent-muted)",
        animation: `timelineParticle 5s linear ${delay}s infinite`,
      }}
      aria-hidden="true"
    />
  );
}

export default function ExperienceTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const line = timelineRef.current;
      if (line) {
        gsap.fromTo(
          line,
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
        y: 60,
        rotationX: -5,
        transformPerspective: 600,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#experience",
          start: "top 70%",
          invalidateOnRefresh: true,
          onEnter: () => play("transition"),
        },
      });

      gsap.utils.toArray<HTMLElement>(".timeline-ripple").forEach((el) => {
        gsap.to(el, {
          width: 60,
          height: 60,
          marginLeft: -29,
          marginTop: -29,
          opacity: 0,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el.closest(".timeline-card") as HTMLElement,
            start: "top 80%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".timeline-company").forEach((el) => {
        const split = new SplitText(el, { type: "chars" });
        gsap.from(split.chars, {
          opacity: 0,
          y: 5,
          stagger: 0.03,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el.closest(".timeline-card") as HTMLElement,
            start: "top 80%",
          },
        });
      });

      if (orbsRef.current) {
        const orbs = orbsRef.current.querySelectorAll<HTMLElement>(".parallax-orb");
        orbs.forEach((orb, i) => {
          gsap.to(orb, {
            yPercent: i % 2 === 0 ? -30 : 30,
            xPercent: i % 2 === 0 ? 15 : -15,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
          });
        });
      }
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
  }, [play]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-label="Experience Timeline"
      className="relative py-20 overflow-hidden"
    >
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="parallax-orb absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, rgba(0, 240, 255, 0) 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="parallax-orb absolute top-1/2 -left-40 w-[24rem] h-[24rem] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0) 70%)",
            filter: "blur(24px)",
          }}
        />
        <div
          className="parallax-orb absolute -bottom-40 right-1/3 w-[20rem] h-[20rem] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0) 70%)",
            filter: "blur(22px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-[1]">
        <div className="mb-12">
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
            className="timeline-line absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 overflow-hidden"
            style={{
              backgroundColor: "var(--color-glass-border)",
              transformOrigin: "top center",
              boxShadow: "0 0 4px var(--color-accent)",
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 overflow-hidden">
              <Particle delay={0} />
              <Particle delay={1.2} />
              <Particle delay={2.4} />
              <Particle delay={3.6} />
            </div>
          </div>

          <div className="space-y-10 md:space-y-14">
            {experience.map((role, idx) => {
              const isLeft = idx % 2 === 0;
              const accent = highlightAccents[role.highlight] || "var(--color-accent)";
              const year = extractStartYear(role.period);
              return (
                <div
                  key={idx}
                  className={`timeline-card relative flex flex-col md:flex-row gap-6 md:gap-0 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="hidden md:block md:w-1/2" />

                  <TimelineDot year={year} highlight={role.highlight} />

                  <div className={`md:w-1/2 ${isLeft ? "md:pr-10" : "md:pl-10"}`}>
                    <div
                      className="glass rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ backgroundColor: "var(--color-surface)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `var(--neon-shadow-md)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "";
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}00)` }}
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-700"
                        style={{
                          background:
                            "linear-gradient(105deg, transparent 40%, rgba(0, 240, 255, 0.06) 45%, transparent 50%)",
                          transform: "translateX(-100%)",
                        }}
                        ref={(el) => {
                          if (!el) return;
                          const card = el.closest(".timeline-card");
                          if (!card) return;
                          ScrollTrigger.create({
                            trigger: card as HTMLElement,
                            start: "top 80%",
                            once: true,
                            onEnter: () => {
                              gsap.to(el, {
                                x: "200%",
                                duration: 1.2,
                                ease: "power2.inOut",
                                onComplete: () => {
                                  el.style.opacity = "0";
                                },
                              });
                              el.style.opacity = "1";
                            },
                          });
                        }}
                        aria-hidden="true"
                      />
                      <div className="pl-2 relative z-[1]">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p
                            className="timeline-company text-sm font-semibold"
                            style={{ color: accent }}
                          >
                            {role.company}
                          </p>
                          {role.highlight && (
                            <span
                              className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{
                                backgroundColor: `${accent}1a`,
                                color: accent,
                                border: `1px solid ${accent}40`,
                              }}
                            >
                              {highlightIcons[role.highlight]}
                              {role.highlight}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-base font-bold mt-0.5"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {role.title}
                        </p>
                        <p
                          className="text-xs font-mono mt-1"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {role.period}
                        </p>
                        <p
                          className="text-sm mt-2"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {role.subtitle}
                        </p>
                        <ul className="mt-2.5 space-y-1">
                          {role.details.map((detail, di) => (
                            <li
                              key={di}
                              className="flex items-start gap-2 text-xs"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              <span
                                className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                                style={{ backgroundColor: accent }}
                              />
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

      <style jsx>{`
        @keyframes timelineParticle {
          0% {
            top: -8px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
