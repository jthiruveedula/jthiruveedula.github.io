"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollSection } from "@/hooks/useScrollSection";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = navLinks.map((l) => l.href.slice(1));
const NAME_EXPAND_THRESHOLD = 120;
const TRANSITION = "height 300ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease, box-shadow 200ms ease";

export default function Navbar() {
  const active = useScrollSection(sectionIds);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const nameWrapRef = useRef<HTMLSpanElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = 0;
      setScrollY(window.scrollY);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const intensity = Math.max(80, 96 - scrollY / 12);
    const glowOpacity = Math.max(0.06, 0.3 - scrollY / 600);
    nav.style.backgroundColor = `color-mix(in srgb, var(--color-bg) ${intensity}%, transparent)`;
    nav.style.boxShadow = hovered
      ? `0 1px 0 color-mix(in srgb, var(--color-accent) ${Math.min(glowOpacity * 2.2, 0.8) * 100}%, transparent), 0 0 ${14 + glowOpacity * 28}px color-mix(in srgb, var(--color-accent) ${Math.min(glowOpacity * 1.8, 0.6) * 100}%, transparent), var(--shadow-soft-sm)`
      : `0 1px 0 color-mix(in srgb, var(--color-accent) ${glowOpacity * 100}%, transparent), 0 0 ${8 + glowOpacity * 16}px color-mix(in srgb, var(--color-accent) ${glowOpacity * 50}%, transparent)`;
  }, [scrollY, hovered]);

  const isNameExpanded = scrollY <= NAME_EXPAND_THRESHOLD;
  const isCompact = scrollY > NAME_EXPAND_THRESHOLD;

  useEffect(() => {
    if (reducedMotion) {
      if (nameWrapRef.current) gsap.set(nameWrapRef.current, { width: "auto", opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(".nav-item-btn", {
        y: -16,
        opacity: 0,
        stagger: 0.06,
        duration: 0.5,
        ease: EASE.cinematic,
        delay: 0.3,
      });
      const logoTl = gsap.timeline({ delay: 0.15 });
      logoTl.from(logoRef.current, { opacity: 0, y: -8, duration: 0.4, ease: EASE.soft });
      logoTl.from(dividerRef.current, { scaleY: 0, opacity: 0, duration: 0.4, ease: EASE.soft }, "-=0.2");
      logoTl.from(nameWrapRef.current, { width: 0, opacity: 0, duration: 0.7, ease: EASE.cinematic }, "-=0.25");
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const el = nameWrapRef.current;
    if (!el) return;
    const tween = gsap.to(el, {
      width: isNameExpanded ? "auto" : 0,
      opacity: isNameExpanded ? 1 : 0,
      duration: 0.5,
      ease: EASE.cinematic,
      overwrite: true,
    });
    return () => { tween.kill(); };
  }, [isNameExpanded, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (!logoRef.current) return;
    const tl = gsap.to(logoRef.current, {
      textShadow: "0 0 10px var(--color-accent), 0 0 20px var(--color-accent), 0 0 30px var(--color-accent)",
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => { tl.kill(); };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (!dividerRef.current) return;
    const tl = gsap.to(dividerRef.current, {
      opacity: 0.3,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => { tl.kill(); };
  }, [reducedMotion]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        ref={navRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--color-glass-border)",
          backgroundColor: "color-mix(in srgb, var(--color-bg) 85%, transparent)",
          boxShadow: "0 1px 0 color-mix(in srgb, var(--color-accent) 30%, transparent), var(--shadow-soft-sm)",
          transition: reducedMotion ? "none" : TRANSITION,
        }}
        aria-label="Primary"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div
            className="flex items-center justify-between"
            style={{ height: isCompact ? 44 : 60, transition: reducedMotion ? "none" : "height 300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); handleNavClick("#hero"); }}
              className="flex items-center gap-0 group"
              aria-label="Home"
            >
              <span
                ref={logoRef}
                className="font-mono text-base font-bold flex items-center text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)] transition-colors"
                style={{
                  textShadow: "0 0 6px var(--color-accent), 0 0 12px var(--color-accent)",
                }}
              >
                <span className="relative">
                  JT
                  <span
                    className="absolute -bottom-0.5 left-0 right-0 h-px opacity-30"
                    style={{ background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)" }}
                  />
                </span>
                <span
                  ref={dividerRef}
                  className="inline-block w-[2px] h-[1.1em] mx-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    boxShadow: "0 0 4px var(--color-accent)",
                    transformOrigin: "center",
                    opacity: 0.6,
                  }}
                />
                <span
                  ref={nameWrapRef}
                  className="inline-block overflow-hidden whitespace-nowrap align-middle"
                  style={{ width: isNameExpanded ? "auto" : 0, opacity: isNameExpanded ? 1 : 0, verticalAlign: "middle" }}
                >
                  <span className="inline-block pr-1 font-mono text-sm font-semibold relative">
                    <span style={{ color: "var(--color-text-primary)", opacity: 0.85 }}>Jagadeesh</span>
                    <span style={{ color: "var(--color-accent-secondary)" }}> Thiruveedula</span>
                    <span
                      className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
                        backgroundSize: "200% 100%",
                        animation: reducedMotion ? "none" : "navShimmer 4s ease-in-out infinite",
                      }}
                    />
                  </span>
                </span>
              </span>
            </a>

            <div ref={navItemsRef} className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`nav-item-btn relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 hover:[text-shadow:0_0_8px_var(--color-accent),0_0_16px_var(--color-accent)] ${active === link.href.slice(1) ? "text-[color:var(--color-accent)] [text-shadow:0_0_6px_var(--color-accent)]" : "text-[color:var(--color-text-secondary)] [text-shadow:none] hover:text-[color:var(--color-text-primary)]"}`}
                  onMouseEnter={(e) => { if (!reducedMotion) gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2, ease: EASE.soft }); }}
                  onMouseLeave={(e) => { if (!reducedMotion) gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: EASE.soft }); }}
                >
                  {link.label}
                  {active === link.href.slice(1) && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-px"
                      style={{ backgroundColor: "var(--color-accent)", boxShadow: "0 0 4px var(--color-accent)" }}
                    />
                  )}
                </button>
              ))}
              <a
                href="https://www.linkedin.com/in/jagadeesh-thiruveedula/"
                target="_blank"
                rel="noopener"
                className="nav-item-btn ml-3 px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-semibold transition-all duration-200 border-[color:var(--color-glass-border)] hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-muted)]"
                style={{ color: "var(--color-accent)" }}
              >
                LinkedIn ↗
              </a>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="md:hidden transition-colors p-1 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            bottom: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-accent) 60%, transparent) 50%, transparent 100%)",
            boxShadow: hovered
              ? "0 0 8px color-mix(in srgb, var(--color-accent) 60%, transparent), 0 0 16px color-mix(in srgb, var(--color-accent) 30%, transparent)"
              : "0 0 4px color-mix(in srgb, var(--color-accent) 30%, transparent)",
            opacity: hovered ? 1 : 0.6,
            transition: reducedMotion ? "none" : "opacity 240ms ease, box-shadow 240ms ease",
          }}
        />

        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: "100%",
            height: 20,
            background: "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 100%)",
            opacity: 1,
            transition: reducedMotion ? "none" : "opacity 320ms ease",
          }}
        />
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] backdrop-blur-2xl md:hidden"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 95%, transparent)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 transition-colors text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="font-mono text-2xl font-bold" style={{ color: "var(--color-accent)" }}>JT</span>

            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-2xl font-semibold transition-colors ${active === link.href.slice(1) ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-text-primary)] hover:text-[color:var(--color-accent)]"}`}
              >
                {link.label}
              </button>
            ))}

            <a
              href="https://www.linkedin.com/in/jagadeesh-thiruveedula/"
              target="_blank"
              rel="noopener"
              className="mt-4 text-base font-mono transition-colors text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-accent)]"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes navShimmer {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
