"use client";

import { useEffect, useState, useRef, useCallback, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplineContainer from "@/components/ui/SplineContainer";
import ScrambleText from "@/components/ui/ScrambleText";
import { useSound } from "@/hooks/useSound";
import { useMousePosition } from "@/hooks/useMousePosition";

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  (window as unknown as { gsap: typeof gsap }).gsap = gsap;
}

const PARTICLE_COUNT = 35;
const PARTICLE_COLORS = ["#00ffff", "#ff00ff", "#8b5cf6", "#06b6d4", "#d946ef"];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const cameraToX = useRef<((v: number) => void) | null>(null);
  const cameraToY = useRef<((v: number) => void) | null>(null);
  const { play } = useSound();
  const { normalizedX, normalizedY } = useMousePosition();

  const [particleData] = useState<Array<{ id: number; size: number; color: string; startX: number; startY: number }>>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i * 137.508) % 360;
      const radius = 8 + ((i * 17) % 80);
      return {
        id: i,
        size: 2 + ((i * 13) % 28) / 10,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        startX: 50 + Math.cos((angle * Math.PI) / 180) * radius,
        startY: 50 + Math.sin((angle * Math.PI) / 180) * radius,
      };
    })
  );

  const startSubTimeline = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => play("reveal"),
      });

      tl.add("eyebrow-line")
        .fromTo(
          ".hero-eyebrow-line",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.6, ease: "power4.inOut" },
          "eyebrow-line"
        )
        .add("subtitle", "-=0.3")
        .fromTo(".hero-sub", { opacity: 0, y: 20, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }, "subtitle")
        .add("tags", "-=0.3")
        .fromTo(".hero-tags", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, "tags")
        .add("cta", "-=0.2")
        .fromTo(".hero-cta a", { opacity: 0, y: 12, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1, ease: "back.out(1.4)" }, "cta")
        .add("scroll", "-=0.1")
        .fromTo(".scroll-indicator", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, "scroll");

      tl.call(() => {
        gsap.to(".hero-cta-primary", {
          boxShadow: "0 0 30px var(--color-glow), 0 0 60px var(--color-glow)",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [play]);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      onEnter: () => play("shimmer"),
      once: true,
    });
    return () => trigger.kill();
  }, [play]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(".scroll-dot", {
        y: 36,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      const autoFloat = gsap.timeline({ repeat: -1, yoyo: true, ease: "sine.inOut" });
      autoFloat.to(contentInnerRef.current, { y: -8, duration: 3 });

      const particles = particlesRef.current?.children;
      if (particles) {
        gsap.utils.toArray(particles).forEach((el: any, i: number) => {
          const data = particleData[i];
          gsap.set(el, {
            x: (data.startX / 100) * window.innerWidth,
            y: (data.startY / 100) * window.innerHeight,
          });

          const animateParticle = () => {
            gsap.to(el, {
              x: () => Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.15,
              y: () => Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2,
              duration: 3 + Math.random() * 4,
              ease: "sine.inOut",
              onComplete: animateParticle,
            });
          };
          animateParticle();
        });
      }

      const container = sectionRef.current?.querySelector(".hero-content");
      if (container) {
        gsap.to(container, {
          y: -80,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });
      }


    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [play, particleData]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!contentRef.current) return;
    if (!cameraToX.current) {
      cameraToX.current = gsap.quickTo(contentRef.current, "rotateY", {
        duration: 0.8,
        ease: "power2.out",
      });
      cameraToY.current = gsap.quickTo(contentRef.current, "rotateX", {
        duration: 0.8,
        ease: "power2.out",
      });
    }
  }, []);

  useEffect(() => {
    cameraToX.current?.(normalizedX * 2);
    cameraToY.current?.(-normalizedY * 2);
  }, [normalizedX, normalizedY]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative min-h-svh flex items-center overflow-hidden isolate"
      style={{ backgroundColor: "transparent" }}
    >
      <SplineContainer className="opacity-40" intensity={20} />

      <div
        ref={particlesRef}
        className="parallax-layer absolute inset-0 z-[3] pointer-events-none"
        aria-hidden="true"
      >
        {particleData.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 left-0 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}`,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      <div
        ref={contentRef}
        className="container relative z-10 mx-auto px-4 md:px-6 py-24"
        style={{ perspective: "800px" }}
      >
        <div ref={contentInnerRef} className="hero-content">
          <div className="max-w-2xl">
            <p className="hero-eyebrow section-eyebrow" style={{ color: "var(--color-accent)" }}>
              <ScrambleText
                text="Data · RAG · Agents · Guardrails"
                duration={0.8}
                stagger={0.02}
                triggerOnScroll={false}
              />
            </p>

            <div
              className="hero-eyebrow-line w-32 h-px mt-3 mb-1"
              style={{
                background: "var(--gradient-neon)",
                boxShadow: "var(--neon-shadow-sm)",
                opacity: 0,
              }}
            />

            <h1
              id="hero-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
              style={{ color: "var(--color-text-primary)" }}
            >
              <ScrambleText
                text="Data Architect"
                className="hero-line block"
                duration={1.0}
                stagger={0.03}
                triggerOnScroll={false}
              />
              <ScrambleText
                text="Generative AI"
                className="hero-line block neon-gradient-text"
                duration={1.0}
                stagger={0.03}
                triggerOnScroll={false}
                onComplete={startSubTimeline}
              />
            </h1>

            <p
              className="hero-sub mt-6 max-w-xl text-base md:text-lg font-light leading-relaxed"
              style={{ color: "var(--color-text-secondary)", opacity: 0 }}
            >
              Private LLM applications, enterprise-grade RAG pipelines, and
              governed agentic workflows on GCP — built for teams that need
              performance, security, and operational clarity.
            </p>

            <div className="hero-tags flex flex-wrap gap-2 mt-4" style={{ opacity: 0 }}>
              {[
                "GCP-native",
                "Vertex AI",
                "Token-efficient",
                "Governed workflows",
              ].map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-glass-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="hero-cta flex flex-wrap gap-4 mt-8 neon-border rounded-2xl p-1">
              <a
                href="#pipeline"
                onMouseEnter={() => play("click")}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  play("whoosh");
                  document
                    .querySelector("#pipeline")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hero-cta-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                style={{
                  background: "var(--gradient-accent)",
                  color: "var(--color-bg)",
                  boxShadow: "0 0 18px var(--color-glow)",
                  opacity: 0,
                }}
              >
                See the systems
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="#contact"
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  document
                    .querySelector("#contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="glass glass-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                style={{ color: "var(--color-text-secondary)", opacity: 0 }}
              >
                Discuss a system
              </a>

              <a
                href="/resume.html"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download resume (opens in new tab)"
                className="glass glass-hover inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
                style={{
                  color: "var(--color-text-muted)",
                  opacity: 0,
                  fontSize: "0.8rem",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Resume
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        aria-hidden="true"
        style={{ opacity: 0 }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.3em] uppercase"
          style={{
            color: "var(--color-accent)",
            textShadow: "0 0 8px var(--color-accent)",
          }}
        >
          scroll
        </span>

        <div
          className="relative w-px h-10"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-accent), transparent)",
            boxShadow: "0 0 6px var(--color-accent)",
          }}
        >
          <div
            className="scroll-dot absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--color-accent)",
              boxShadow:
                "0 0 6px var(--color-accent), 0 0 12px var(--color-accent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
