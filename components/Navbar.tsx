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
      nav.classList.toggle("shadow-[0_1px_0_rgba(99,102,241,0.15)]", window.scrollY > 10);
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
        className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl transition-shadow duration-300"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); handleNavClick("#hero"); }}
              className="flex items-center gap-2 group"
              aria-label="Home"
            >
              <span className="font-mono text-base font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                JT<span className="inline-block w-[2px] h-[1em] bg-indigo-400 ml-0.5 align-text-bottom animate-pulse" />
              </span>
            </a>

            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 ${
                    active === link.href.slice(1)
                      ? "text-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {link.label}
                  {active === link.href.slice(1) && (
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-cyan-400" />
                  )}
                </button>
              ))}
              <a
                href="https://www.linkedin.com/in/jagadeesh-thiruveedula/"
                target="_blank"
                rel="noopener"
                className="ml-3 px-3.5 py-1.5 rounded-full border border-indigo-500/40 text-indigo-300 text-[11px] font-mono font-semibold hover:bg-indigo-500/10 hover:border-indigo-400/60 transition-all duration-200"
              >
                LinkedIn ↗
              </a>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
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
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl md:hidden"
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="font-mono text-2xl font-bold text-indigo-400">JT</span>

            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-2xl font-semibold transition-colors ${
                  active === link.href.slice(1)
                    ? "text-cyan-400"
                    : "text-slate-200 hover:text-indigo-300"
                }`}
              >
                {link.label}
              </button>
            ))}

            <a
              href="https://www.linkedin.com/in/jagadeesh-thiruveedula/"
              target="_blank"
              rel="noopener"
              className="mt-4 text-base font-mono text-slate-400 hover:text-indigo-300 transition-colors"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
