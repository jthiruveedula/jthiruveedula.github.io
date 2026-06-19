"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollSection } from "@/hooks/useScrollSection";
import { useSound } from "@/hooks/useSound";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = navLinks.map((l) => l.href.slice(1));

const TOP_EDGE_PX = 48;
const HIDE_BAR_THRESHOLD = 80;
const HIDE_IDENTITY_THRESHOLD = 200;
const TRANSITION = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease, background-color 200ms ease, box-shadow 200ms ease";

export default function Navbar() {
  const active = useScrollSection(sectionIds);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [isNearTopEdge, setIsNearTopEdge] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovered, setHovered] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const nameRevealRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const wasVisibleRef = useRef(true);
  const { play } = useSound();

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
      if (e.key === "Escape") {
        setMobileOpen(false);
        play("click");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, play]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;

    const tick = () => {
      frame = 0;
      const y = window.scrollY;
      const dir: "up" | "down" = y > lastY ? "down" : y < lastY ? "up" : scrollDirection;
      lastY = y;
      if (y !== scrollY) setScrollY(y);
      if (dir !== scrollDirection) setScrollDirection(dir);
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
  }, [scrollY, scrollDirection]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setIsNearTopEdge(e.clientY <= TOP_EDGE_PX);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const isBarVisible = scrollY <= HIDE_BAR_THRESHOLD || scrollDirection === "up" || isNearTopEdge || mobileOpen;
  const isIdentityVisible = scrollY <= HIDE_IDENTITY_THRESHOLD;
  const isCompact = scrollY > HIDE_BAR_THRESHOLD;
  const barParallaxY = Math.min(scrollY * 0.015, 3);
  const identityParallaxY = Math.min(scrollY * 0.05, 8);

  useEffect(() => {
    if (reducedMotion) return;
    if (wasVisibleRef.current === isBarVisible) return;
    wasVisibleRef.current = isBarVisible;
    if (!isBarVisible) return;
    const tween = gsap.fromTo(
      barRef.current,
      { boxShadow: "0 0 0 0 color-mix(in srgb, var(--color-accent) 0%, transparent)" },
      {
        boxShadow: "0 0 18px 0 color-mix(in srgb, var(--color-accent) 45%, transparent)",
        duration: 0.5,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      }
    );
    return () => { tween.kill(); };
  }, [isBarVisible, reducedMotion]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const intensity = Math.max(75, 98 - scrollY / 15);
    const glowOpacity = Math.max(0.08, 0.35 - scrollY / 500);
    nav.style.backgroundColor = `color-mix(in srgb, var(--color-bg) ${intensity}%, transparent)`;
    nav.style.boxShadow = hovered
      ? `0 1px 0 color-mix(in srgb, var(--color-accent) ${Math.min(glowOpacity * 2.2, 0.85) * 100}%, transparent), 0 0 ${14 + glowOpacity * 28}px color-mix(in srgb, var(--color-accent) ${Math.min(glowOpacity * 1.8, 0.7) * 100}%, transparent), var(--neon-shadow-sm)`
      : `0 1px 0 color-mix(in srgb, var(--color-accent) ${glowOpacity * 100}%, transparent), 0 0 ${10 + glowOpacity * 20}px color-mix(in srgb, var(--color-accent) ${glowOpacity * 60}%, transparent)`;
  }, [scrollY, hovered]);

  useEffect(() => {
    const el = nameRevealRef.current;
    if (!el) return;
    if (reducedMotion) {
      gsap.set(el, { width: "auto" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.set(el, { width: "auto" });
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  useEffect(() => {
    if (!navItemsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".nav-item-btn", {
        y: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.2,
      });
    }, navItemsRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!logoRef.current) return;
    if (reducedMotion) return;
    const tl = gsap.to(logoRef.current, {
      textShadow: "0 0 12px var(--color-accent), 0 0 24px var(--color-accent), 0 0 36px var(--color-accent), 0 0 48px var(--color-accent)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => { tl.kill(); };
  }, [reducedMotion]);

  const handleNavClick = (href: string) => {
    play("click");
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const navStyle: React.CSSProperties = {
    transform: isBarVisible ? `translateY(${barParallaxY}px)` : "translateY(-110%)",
    opacity: isBarVisible ? 1 : 0,
    pointerEvents: isBarVisible ? "auto" : "none",
    transition: reducedMotion ? "none" : TRANSITION,
  };

  return (
    <>
      <nav
        ref={navRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
        style={{
          ...navStyle,
          borderColor: "var(--color-glass-border)",
          backgroundColor: "color-mix(in srgb, var(--color-bg) 80%, transparent)",
          boxShadow: "0 1px 0 color-mix(in srgb, var(--color-accent) 35%, transparent), var(--neon-shadow-sm)",
        }}
        aria-label="Primary"
      >
        <div
          ref={barRef}
          className="container mx-auto px-4 md:px-6"
        >
          <div
            className="flex items-center justify-between"
            style={{ height: isCompact ? 40 : 56, transition: reducedMotion ? "none" : "height 240ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); handleNavClick("#hero"); }}
              className="flex items-center gap-2 group"
              aria-label="Home"
            >
              <span
                ref={logoRef}
                className="font-mono text-base font-bold transition-colors flex items-center"
                style={{
                  color: "var(--color-accent)",
                  textShadow: "0 0 7px var(--color-accent), 0 0 10px var(--color-accent), 0 0 21px var(--color-accent)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "color-mix(in srgb, var(--color-accent) 70%, white)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}
              >
                <span>JT</span>
                <span className="inline-block w-[2px] h-[1em] ml-1 align-text-bottom animate-pulse" style={{ backgroundColor: "var(--color-accent)" }} />
                <span
                  ref={nameRevealRef}
                  className="inline-block overflow-hidden align-middle whitespace-nowrap"
                  style={{ width: 0, verticalAlign: "middle" }}
                >
                  <span
                    className="inline-block pl-2 font-mono text-base font-bold"
                    style={{ color: "var(--color-accent)", textShadow: "0 0 7px var(--color-accent), 0 0 10px var(--color-accent)" }}
                  >
                    <span style={{ opacity: 0.6 }}>Jagadeesh</span>
                    <span className="text-[var(--color-accent-secondary)]" style={{ color: "var(--color-accent-secondary)" }}> Thiruveedula</span>
                  </span>
                </span>
              </span>
            </a>

            <div ref={navItemsRef} className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="nav-item-btn relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200"
                  style={{
                    color: active === link.href.slice(1) ? "var(--color-accent)" : "var(--color-text-secondary)",
                    textShadow: active === link.href.slice(1) ? "0 0 8px var(--color-accent)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    if (active !== link.href.slice(1)) el.style.color = "var(--color-text-primary)";
                    gsap.to(el, { scale: 1.05, duration: 0.2, ease: "power2.out" });
                    el.style.textShadow = "0 0 10px var(--color-accent), 0 0 20px var(--color-accent), 0 0 30px var(--color-accent)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    if (active !== link.href.slice(1)) el.style.color = "var(--color-text-secondary)";
                    gsap.to(el, { scale: 1, duration: 0.2, ease: "power2.out" });
                    el.style.textShadow = active === link.href.slice(1) ? "0 0 8px var(--color-accent)" : "none";
                  }}
                >
                  {link.label}
                  {active === link.href.slice(1) && (
                    <span className="absolute bottom-0 left-3 right-3 h-px" style={{ backgroundColor: "var(--color-accent)" }} />
                  )}
                </button>
              ))}
              <a
                href="https://www.linkedin.com/in/jagadeesh-thiruveedula/"
                target="_blank"
                rel="noopener"
                onClick={() => play("tick")}
                className="nav-item-btn ml-3 px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-semibold transition-all duration-200"
                style={{ borderColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)", color: "var(--color-accent)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--color-accent) 10%, transparent)"; (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--color-accent) 60%, transparent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--color-accent) 40%, transparent)"; }}
              >
                LinkedIn ↗
              </a>
            </div>

            <button
              onClick={() => { setMobileOpen(true); play("whoosh"); }}
              aria-label="Open menu"
              className="md:hidden transition-colors p-1"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="nav-underline absolute left-0 right-0 pointer-events-none"
          style={{
            bottom: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-accent) 65%, transparent) 50%, transparent 100%)",
            boxShadow: hovered
              ? "0 0 10px color-mix(in srgb, var(--color-accent) 70%, transparent), 0 0 18px color-mix(in srgb, var(--color-accent) 35%, transparent)"
              : "0 0 6px color-mix(in srgb, var(--color-accent) 35%, transparent)",
            opacity: hovered ? 1 : 0.7,
            transition: reducedMotion ? "none" : "opacity 240ms ease, box-shadow 240ms ease",
          }}
        />

        <div
          className="nav-light-bleed absolute left-0 right-0 pointer-events-none"
          style={{
            top: "100%",
            height: 24,
            background: "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 100%)",
            opacity: isBarVisible ? 1 : 0,
            transition: reducedMotion ? "none" : "opacity 320ms ease",
          }}
        />

        <div
          ref={identityRef}
          className="overflow-hidden border-t pointer-events-none"
          style={{
            borderColor: "var(--color-glass-border)",
            maxHeight: isIdentityVisible ? 40 : 0,
            opacity: isIdentityVisible ? 1 : 0,
            transform: `translateY(-${identityParallaxY}px)`,
            transition: reducedMotion ? "none" : "max-height 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease, transform 200ms ease",
          }}
          aria-hidden={!isIdentityVisible}
        >
          <div className="container mx-auto px-4 md:px-6 py-2 flex items-center justify-center gap-3">
            <span
              className="font-mono text-[11px] md:text-xs font-semibold tracking-tight whitespace-nowrap"
              style={{
                color: "var(--color-text-primary)",
                textShadow: "0 0 8px var(--color-accent-muted)",
                opacity: isCompact ? 0.6 : 1,
                transition: reducedMotion ? "none" : "opacity 240ms ease",
              }}
            >
              Jagadeesh Thiruveedula
            </span>
            <span
              className="hidden sm:inline-block w-1 h-1 rounded-full"
              style={{ backgroundColor: "var(--color-accent)", boxShadow: "0 0 6px var(--color-accent)" }}
            />
            <span
              className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] uppercase whitespace-nowrap"
              style={{ color: "var(--color-accent)" }}
            >
              Data Architect
            </span>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-2xl md:hidden"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 95%, transparent)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setMobileOpen(false); play("click"); } }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-10">
            <button
              onClick={() => { setMobileOpen(false); play("click"); }}
              className="absolute top-6 right-6 transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
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
                className="text-2xl font-semibold transition-colors"
                style={{ color: active === link.href.slice(1) ? "var(--color-accent)" : "var(--color-text-primary)" }}
                onMouseEnter={(e) => { if (active !== link.href.slice(1)) (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}
                onMouseLeave={(e) => { if (active !== link.href.slice(1)) (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; }}
              >
                {link.label}
              </button>
            ))}

            <a
              href="https://www.linkedin.com/in/jagadeesh-thiruveedula/"
              target="_blank"
              rel="noopener"
              onClick={() => play("tick")}
              className="mt-4 text-base font-mono transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
