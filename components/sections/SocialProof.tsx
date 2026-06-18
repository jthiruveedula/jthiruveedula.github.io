"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { testimonials, certifications } from "@/lib/data";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

gsap.registerPlugin(ScrollTrigger);

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < rating ? "text-amber-400" : "text-slate-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".proof-item", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#social-proof",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="social-proof" ref={sectionRef} className="relative py-28 bg-slate-950 border-t border-slate-800/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16">
          <p className="section-eyebrow text-emerald-400">Social Proof</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Trusted by peers.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="proof-item rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 flex flex-col gap-4"
            >
              <StarRating rating={t.rating} />
              <p className="text-sm text-slate-400 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-auto">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="font-mono text-[10px] text-slate-500">{t.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-16 proof-item">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-center">
            <div className="font-mono text-3xl font-bold text-emerald-400">
              <AnimatedCounter end={50} suffix="+" duration={2.5} />
            </div>
            <p className="font-mono text-xs text-slate-500 mt-1">GitHub Repositories</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-center">
            <div className="font-mono text-3xl font-bold text-cyan-400">
              <AnimatedCounter end={1000} suffix="+" duration={2.5} />
            </div>
            <p className="font-mono text-xs text-slate-500 mt-1">GitHub Commits</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-center">
            <div className="font-mono text-3xl font-bold text-indigo-400">
              <AnimatedCounter end={6} suffix="+" duration={2} />
            </div>
            <p className="font-mono text-xs text-slate-500 mt-1">Production GenAI Systems</p>
          </div>
        </div>

        <div className="proof-item">
          <p className="font-mono text-xs text-slate-600 tracking-widest uppercase mb-4">
            Certifications
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 flex items-center gap-3"
              >
                <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-white font-medium">{cert.name}</p>
                  <p className="font-mono text-[9px] text-slate-500">{cert.issuer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
