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
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative py-28 bg-slate-900 border-t border-slate-800/40 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-5 gap-12 items-start">
          <div className="about-content md:col-span-3">
            <p className="section-eyebrow text-indigo-400">About</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              GCP Data Architect based in Texas.
            </h2>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              {siteConfig.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {siteConfig.hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-slate-700/40 text-slate-500 bg-slate-800/50"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center md:items-start gap-6">
            <div
              className="photo-placeholder relative w-64 h-64 rounded-2xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
              style={{
                perspective: "800px",
                transform: `rotateX(${-normalizedY * 3}deg) rotateY(${normalizedX * 3}deg)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-20 h-20 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            </div>
            <div className="text-center md:text-left">
              <p className="font-mono text-xs text-slate-500">
                📍 {siteConfig.location}
              </p>
              <p className="font-mono text-[10px] text-slate-600 mt-1">
                Available for consulting & advisory
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
