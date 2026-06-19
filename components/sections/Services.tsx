"use client";

import { useEffect, useRef } from "react";
import type React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/lib/data";
import { useCursorGlow } from "@/hooks/useCursorGlow";
import { EASE, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const serviceIcons: Record<string, React.ReactNode> = {
  cloud: (
    <svg className="service-icon-svg w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
  database: (
    <svg className="service-icon-svg w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  brain: (
    <svg className="service-icon-svg w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  "trending-up": (
    <svg className="service-icon-svg w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  code: (
    <svg className="service-icon-svg w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
};

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCursorGlow(cardRef);
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={cardRef}
      className="service-card cursor-glow group relative rounded-2xl border p-6 transition-all duration-400 hover:-translate-y-1 hover:border-[color:var(--color-accent)] hover:shadow-[var(--shadow-soft-md)] overflow-hidden"
      style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-surface)" }}
      data-hoverable
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ background: "linear-gradient(90deg, var(--color-accent), rgba(201,168,76,0.4), transparent)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-12 -right-12 w-32 h-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <span
            className="service-icon inline-flex items-center justify-center w-12 h-12 rounded-xl border transition-transform duration-400 group-hover:scale-110"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-glass-border)",
              backgroundColor: "var(--color-accent-muted)",
              filter: "drop-shadow(0 0 8px rgba(201,168,76,0.25))",
            }}
          >
            {serviceIcons[service.icon] || serviceIcons.code}
          </span>
          <span
            className="font-mono text-[10px] tracking-[0.2em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {num}
          </span>
        </div>
        <h3 className="text-base font-semibold mb-2.5" style={{ color: "var(--color-text-primary)" }}>
          {service.title}
        </h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          {service.description}
        </p>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase translate-x-0 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300"
          style={{ color: "var(--color-accent)" }}
        >
          Explore
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".service-card");
      const icons = gsap.utils.toArray<HTMLElement>(".service-icon-svg path");

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 40 });
      gsap.set(icons, { strokeDasharray: 200, strokeDashoffset: 200 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#services",
          start: "top 72%",
          invalidateOnRefresh: true,
        },
      });

      tl.to(cards, {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: EASE.cinematic,
      })
      .to(icons, {
        strokeDashoffset: 0,
        stagger: 0.12,
        duration: 1.0,
        ease: EASE.soft,
      }, "-=0.6");

      gsap.from(".services-eyebrow", {
        opacity: 0,
        y: 12,
        duration: 0.6,
        ease: EASE.soft,
        scrollTrigger: { trigger: "#services", start: "top 80%" },
      });
      gsap.from(".services-heading", {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: EASE.cinematic,
        scrollTrigger: { trigger: "#services", start: "top 80%" },
      });
      gsap.from(".services-cta", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: EASE.cinematic,
        scrollTrigger: { trigger: ".services-cta", start: "top 90%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-28 border-t"
      style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-14 max-w-xl">
          <p className="services-eyebrow section-eyebrow" style={{ color: "var(--color-accent)" }}>
            Services
          </p>
          <h2
            className="services-heading text-xl md:text-2xl font-semibold tracking-tight mt-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            What I offer.
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Consulting and implementation for data &amp; AI initiatives — from warehouse
            architecture to production GenAI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {services.map((service, i) => (
            <div key={service.title} className="lg:col-span-2 [&:nth-child(4)]:lg:col-start-2 [&:nth-child(5)]:lg:col-start-4">
              <ServiceCard service={service} index={i} />
            </div>
          ))}
        </div>

        <div className="services-cta mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border p-6" style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-surface)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              Not sure where to start?
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Book a 30-minute architecture review — no commitment.
            </p>
          </div>
          <a
            href="#contact"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "var(--gradient-accent)",
              color: "var(--color-bg)",
              boxShadow: "0 0 20px rgba(201,168,76,0.25)",
            }}
          >
            Start a conversation
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
