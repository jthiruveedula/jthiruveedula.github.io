"use client";

import { useEffect, useRef } from "react";

interface Particle { // UPGRADE: ambient particle shape
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  phase: number;
}

interface Palette { // UPGRADE: theme-derived color set
  accents: string[];
  line: string;
}

const SMALL_BREAKPOINT = 768;
const LARGE_COUNT = 80;
const SMALL_COUNT = 40;
const MAX_LINK_DIST = 130;
const DPR_CAP = 2;

function readPalette(): Palette { // UPGRADE: sample current theme via CSS variables
  if (typeof window === "undefined") {
    return { accents: ["#00f0ff", "#ff00e5", "#b026ff"], line: "rgba(0,240,255,0.18)" };
  }
  const styles = getComputedStyle(document.documentElement);
  const raw = [
    styles.getPropertyValue("--color-accent").trim(),
    styles.getPropertyValue("--color-accent-secondary").trim(),
    styles.getPropertyValue("--color-accent-tertiary").trim(),
  ].filter(Boolean);
  return { accents: raw.length ? raw : ["#00f0ff"], line: "rgba(0,240,255,0.18)" };
}

function hexToRgba(hex: string, alpha: number): string { // UPGRADE: convert hex to rgba for low-alpha stroke/fill
  const m = hex.replace("#", "");
  if (m.length !== 6) return `rgba(0,240,255,${alpha})`;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function AmbientBackground() { // UPGRADE: global particle-network backdrop
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let palette = readPalette();
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    let particles: Particle[] = [];
    let rafId = 0;
    let lastTime = performance.now();

    const seedParticles = (count: number) => { // UPGRADE: initial particle field
      particles = new Array(count).fill(0).map(() => {
        const speed = 0.08 + Math.random() * 0.18; // sub-pixel drift
        const angle = Math.random() * Math.PI * 2;
        const color = palette.accents[Math.floor(Math.random() * palette.accents.length)];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 0.8 + Math.random() * 1.6,
          color,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < SMALL_BREAKPOINT ? SMALL_COUNT : LARGE_COUNT;
      seedParticles(count);
    };

    const drawStatic = () => { // UPGRADE: single-frame fallback for reduced-motion
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, 0.55);
        ctx.fill();
      }
    };

    const drawFrame = (now: number) => { // UPGRADE: per-frame update + render
      const dt = Math.min((now - lastTime) / 16.67, 2); // normalize to ~60fps tick, clamp large gaps
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Connections: faint lines between nearby particles
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MAX_LINK_DIST * MAX_LINK_DIST) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / MAX_LINK_DIST) * 0.22;
            ctx.strokeStyle = palette.line.replace(/[\d.]+\)$/g, `${alpha.toFixed(3)})`);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Particles: update position, wrap edges, draw
      for (const p of particles) {
        // Mild direction drift via small random acceleration
        p.vx += (Math.random() - 0.5) * 0.01;
        p.vy += (Math.random() - 0.5) * 0.01;
        // Clamp speed for a calm network
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 0.35) { p.vx *= 0.35 / sp; p.vy *= 0.35 / sp; }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap around edges for a continuous field
        if (p.x < -4) p.x = width + 4;
        else if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        else if (p.y > height + 4) p.y = -4;

        p.phase += 0.015;
        const alpha = 0.45 + Math.sin(p.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, alpha);
        ctx.fill();
      }

      rafId = requestAnimationFrame(drawFrame);
    };

    const onVisibility = () => { // UPGRADE: pause RAF when tab is hidden
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId && !reduceMotion) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    const onThemeChange = () => { // UPGRADE: re-sample colors when data-theme changes
      palette = readPalette();
      for (const p of particles) {
        p.color = palette.accents[Math.floor(Math.random() * palette.accents.length)];
      }
    };

    const onResize = () => resize();

    resize();
    if (reduceMotion) {
      drawStatic();
    } else {
      rafId = requestAnimationFrame(drawFrame);
    }

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.5 }} // UPGRADE: sits behind main content (z-10) and AmbientOrbs layer
    />
  );
}
