"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollSection } from "@/hooks/useScrollSection";

const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = navLinks.map((l) => l.href.slice(1));

export default function Navbar() {
  const active = useScrollSection(sectionIds);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      nav.style.boxShadow = window.scrollY > 10 ? "0 1px 0 color-mix(in srgb, var(--color-accent) 15%, transparent)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-shadow duration-300"
        style={{ borderColor: "var(--color-glass-border)", backgroundColor: "color-mix(in srgb, var(--color-bg) 80%, transparent)" }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); handleNavClick("#hero"); }}
              className="flex items-center gap-2 group"
              aria-label="Home"
            >
              <span className="font-mono text-base font-bold transition-colors" style={{ color: "var(--color-accent)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "color-mix(in srgb, var(--color-accent) 70%, white)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}>
                JT<span className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom animate-pulse" style={{ backgroundColor: "var(--color-accent)" }} />
              </span>
            </a>

            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 ${
                    active === link.href.slice(1)
                      ? ""
                      : ""
                  }`}
                  style={{ color: active === link.href.slice(1) ? "var(--color-accent)" : "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => { if (active !== link.href.slice(1)) (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; }}
                  onMouseLeave={(e) => { if (active !== link.href.slice(1)) (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
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
                className="ml-3 px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-semibold transition-all duration-200"
                style={{ borderColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)", color: "var(--color-accent)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--color-accent) 10%, transparent)"; (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--color-accent) 60%, transparent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--color-accent) 40%, transparent)"; }}
              >
                LinkedIn ↗
              </a>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
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
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-2xl md:hidden"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 95%, transparent)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-10">
            <button
              onClick={() => setMobileOpen(false)}
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
                className={`text-2xl font-semibold transition-colors`}
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
