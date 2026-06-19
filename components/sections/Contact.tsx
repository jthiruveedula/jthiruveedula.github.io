"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/data";
import { EASE, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const message = String(formData.get("message") || "");
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailtoUrl = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    if (typeof window !== "undefined") {
      const a = document.createElement("a");
      a.href = mailtoUrl;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => a.remove(), 0);
    }
    window.setTimeout(() => setSubmitted(false), 5000);
  };

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".contact-form > *", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: EASE.cinematic,
        scrollTrigger: {
          trigger: "#contact",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
      gsap.from(".contact-info > *", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: EASE.cinematic,
        scrollTrigger: {
          trigger: "#contact",
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [submitted]);

  return (
    <section id="contact" ref={sectionRef} className="relative py-28 border-t" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-glass-border)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12">
          <p className="section-eyebrow" style={{ color: "var(--color-accent)" }}>Contact</p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>Let&apos;s build something.</h2>
          <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-secondary)" }}>
            Available for architectural advisory, systems design, and production AI engagements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            {submitted ? (
              <div className="rounded-2xl border p-8 text-center" style={{ borderColor: "var(--color-accent)", backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }}>
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--color-accent)", filter: "drop-shadow(0 0 8px var(--color-accent))" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold" style={{ color: "var(--color-accent)" }}>Message sent!</p>
                <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>I&apos;ll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form space-y-4">
                <div>
                  <label htmlFor="name" className="block font-mono text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-[color:var(--color-text-muted)] border-[color:var(--color-glass-border)] focus:border-[color:var(--color-accent)] focus:ring-[color:var(--color-accent)]"
                    style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)" }}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-mono text-xs text-slate-500 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-[color:var(--color-text-muted)] border-[color:var(--color-glass-border)] focus:border-[color:var(--color-accent)] focus:ring-[color:var(--color-accent)]"
                    style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)" }}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block font-mono text-xs text-slate-500 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-all resize-none placeholder:text-[color:var(--color-text-muted)] border-[color:var(--color-glass-border)] focus:border-[color:var(--color-accent)] focus:ring-[color:var(--color-accent)]"
                    style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)" }}
                    placeholder="Tell me about your project..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-slate-950 hover:scale-[1.01] transition-all duration-200 shadow-[0_0_20px_var(--color-accent),0_0_40px_var(--color-accent-muted)] hover:shadow-[0_0_32px_var(--color-accent),0_0_60px_var(--color-accent-muted)]"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          <div className="contact-info flex flex-col gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
                Direct Contact
              </p>
              <div className="space-y-3">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 text-sm transition-colors text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-accent)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {siteConfig.email}
                </a>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-3 text-sm transition-colors text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-accent)]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-3 text-sm transition-colors text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-accent)]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="/resume.html"
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-3 text-sm transition-colors text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-accent)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Download Resume
                </a>
              </div>
            </div>

            <div
              className="rounded-2xl border p-6 transition-all duration-300 border-[color:var(--color-glass-border)] hover:border-[color:var(--color-accent)] hover:shadow-[var(--shadow-soft-sm)]"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--color-accent)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Location</p>
              </div>
              <p className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>{siteConfig.location}</p>
              <p className="font-mono text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>Available for remote & onsite engagements</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Advisory", "Architecture Review", "Full Engagement", "Fractional CTO"].map(
                (mode) => (
                  <span
                    key={mode}
                    className="font-mono text-[10px] px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--color-glass-border)", color: "var(--color-text-muted)" }}
                  >
                    {mode}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
