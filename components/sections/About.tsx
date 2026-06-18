"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/data";
import { useMousePosition } from "@/hooks/useMousePosition";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { normalizedX, normalizedY } = useMousePosition();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".about-content > *", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#about",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
      gsap.to(".photo-placeholder", {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative py-28 border-t overflow-hidden" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-5 gap-12 items-start">
          <div className="about-content md:col-span-3">
            <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>About</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: "var(--color-text-primary)" }}>
              GCP Data Architect based in Texas.
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {siteConfig.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {siteConfig.hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-full border" style={{ borderColor: "var(--color-glass-border)", color: "var(--color-text-muted)", backgroundColor: "var(--color-surface)" }}
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center md:items-start gap-6">
            <div
              className="photo-placeholder relative w-64 h-64 rounded-2xl border overflow-hidden"
              style={{
                borderColor: "var(--color-glass-border)",
                backgroundColor: "var(--color-surface)",
                perspective: "800px",
                transform: `rotateX(${-normalizedY * 3}deg) rotateY(${normalizedX * 3}deg)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--color-text-muted)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--color-bg) 80%, transparent), transparent, transparent)" }} />
            </div>
            <div className="text-center md:text-left">
              <p className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                📍 {siteConfig.location}
              </p>
              <p className="font-mono text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                Available for consulting & advisory
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
