"use client";

import { useEffect, useState, useRef, useCallback, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplineContainer from "@/components/ui/SplineContainer";
import ScrambleText from "@/components/ui/ScrambleText";
import { isPageRevealDone, onPageRevealComplete } from "@/components/ui/PageReveal";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useCursorGlow } from "@/hooks/useCursorGlow";
import { EASE, DUR, STAGGER, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  (window as unknown as { gsap: typeof gsap }).gsap = gsap;
}

const PARTICLE_COUNT = 8;
const PARTICLE_COLOR = "rgba(201, 168, 76, 0.6)";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLDivElement>(null);
  const cameraToX = useRef<((v: number) => void) | null>(null);
  const cameraToY = useRef<((v: number) => void) | null>(null);
  const mainCtxRef = useRef<gsap.Context | null>(null);
  const { normalizedX, normalizedY } = useMousePosition();

  useCursorGlow(contentRef);

  const [particleData] = useState<Array<{ id: number; size: number; startX: number; startY: number }>>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i * 137.508) % 360;
      const radius = 8 + ((i * 17) % 80);
      return {
        id: i,
        size: 2 + ((i * 13) % 28) / 10,
        startX: 50 + Math.cos((angle * Math.PI) / 180) * radius,
        startY: 50 + Math.sin((angle * Math.PI) / 180) * radius,
      };
    })
  );

  const startSubTimeline = useCallback(() => {
    if (!isPageRevealDone()) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EASE.cinematic },
      });

      tl.add("eyebrow-line")
        .fromTo(
          ".hero-eyebrow-line",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: DUR.base, ease: "power4.inOut" },
          "eyebrow-line"
        )
        .add("subtitle", "-=0.3")
        .fromTo(".hero-sub", { opacity: 0, y: 20, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }, "subtitle")
        .add("cta", "-=0.2")
        .fromTo(".hero-cta a", { opacity: 0, y: 12, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: DUR.base, stagger: STAGGER.cards, ease: EASE.snap }, "cta")
        .add("scroll", "-=0.1")
        .fromTo(".scroll-indicator", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: DUR.base }, "scroll");

      tl.call(() => {
        gsap.to(".hero-cta-primary", {
          boxShadow: "0 0 30px var(--color-glow), 0 0 60px var(--color-glow)",
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let microCtx: gsap.Context | null = null;
    const dispose = onPageRevealComplete(() => {
      if (!sectionRef.current) return;
      microCtx = gsap.context(() => {
        gsap.to(".hero-eyebrow-line", {
          opacity: 0.7,
          x: 1,
          y: 1,
          duration: 4.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }, sectionRef);
    });

    return () => {
      dispose();
      microCtx?.revert();
    };
  }, []);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      once: true,
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const dispose = onPageRevealComplete(() => {
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
          (gsap.utils.toArray(particles) as Element[]).forEach((el, i) => {
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

        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=300",
            scrub: 0.8,
            pin: sectionRef.current,
            pinSpacing: true,
            anticipatePin: 1,
            onLeaveBack: () => pinTl.progress(0),
          },
        });

        pinTl
          .to(".scroll-indicator", { opacity: 0, duration: 0.15 }, 0)
          .to(contentRef.current, { y: -60, opacity: 0, ease: "none", duration: 0.8 }, 0)
          .to(splineRef.current, { scale: 1.1, opacity: 0.15, ease: "none", duration: 0.8 }, 0)
          .to(particlesRef.current, { y: 20, opacity: 0.2, ease: "none", duration: 0.8 }, 0);
      }, sectionRef);

      mainCtxRef.current = ctx;
    });

    return () => {
      dispose();
      mainCtxRef.current?.revert();
    };
  }, [particleData]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!contentRef.current) return;
    if (!cameraToX.current) {
      cameraToX.current = gsap.quickTo(contentRef.current, "rotateY", {
        duration: 0.8,
        ease: EASE.soft,
      });
      cameraToY.current = gsap.quickTo(contentRef.current, "rotateX", {
        duration: 0.8,
        ease: EASE.soft,
      });
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const throttleTimeout = setTimeout(() => {
      cameraToX.current?.(normalizedX * 1.0);
      cameraToY.current?.(-normalizedY * 1.0);
    }, 16);
    return () => clearTimeout(throttleTimeout);
  }, [normalizedX, normalizedY]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative min-h-svh flex items-center overflow-hidden isolate"
      style={{ backgroundColor: "transparent" }}
    >
      <div ref={splineRef} className="absolute inset-0 z-[1]">
        <SplineContainer className="opacity-40" intensity={20} />
      </div>

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
              backgroundColor: PARTICLE_COLOR,
              boxShadow: `0 0 ${p.size * 1.5}px rgba(201, 168, 76, 0.4)`,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      <div
        ref={contentRef}
        className="container cursor-glow relative z-10 mx-auto px-4 md:px-6 py-24"
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
                background: "var(--gradient-accent)",
                boxShadow: "0 0 4px rgba(201, 168, 76, 0.15)",
                opacity: 0,
              }}
            />

            <h1
              id="hero-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]"
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
              Enterprise GenAI systems on Google Cloud.
            </p>

            <div className="hero-cta flex flex-wrap gap-4 mt-8 neon-border rounded-2xl p-1">
              <a
                href="#pipeline"
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
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
            textShadow: "0 0 6px rgba(201, 168, 76, 0.3)",
          }}
        >
          scroll
        </span>

        <div
          className="relative w-px h-10"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-accent), transparent)",
            boxShadow: "0 0 4px rgba(201, 168, 76, 0.2)",
          }}
        >
          <div
            className="scroll-dot absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--color-accent)",
              boxShadow: "0 0 4px rgba(201, 168, 76, 0.2)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
