"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    const spotlight = spotlightRef.current;
    if (!cursor || !spotlight) return;

    let mouseX = 0;
    let mouseY = 0;
    let spotX = 0;
    let spotY = 0;
    let raf = 0;
    let raf2 = 0;
    const dotHistory: { x: number; y: number; el: HTMLDivElement }[] = [];
    const TRAIL_LENGTH = 8;

    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: ${6 - i * 0.5}px;
        height: ${6 - i * 0.5}px;
        border-radius: 50%;
        background: var(--color-accent);
        box-shadow: 0 0 ${8 - i}px var(--color-accent);
        pointer-events: none;
        z-index: 9998;
        opacity: ${0.7 - i * 0.08};
        transform: translate3d(-100px, -100px, 0);
        will-change: transform;
        top: 0;
      `;
      document.body.appendChild(dot);
      dotHistory.push({ x: 0, y: 0, el: dot });
    }

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0)`;
    };

    const tick = () => {
      spotX += (mouseX - spotX) * 0.12;
      spotY += (mouseY - spotY) * 0.12;
      spotlight.style.transform = `translate3d(${spotX - 200}px, ${spotY - 200}px, 0)`;

      let prevX = mouseX;
      let prevY = mouseY;
      for (let i = 0; i < dotHistory.length; i++) {
        const target = dotHistory[i];
        const dx = prevX - target.x;
        const dy = prevY - target.y;
        target.x += dx * 0.35;
        target.y += dy * 0.35;
        target.el.style.transform = `translate3d(${target.x - (6 - i * 0.5) / 2}px, ${target.y - (6 - i * 0.5) / 2}px, 0)`;
        prevX = target.x;
        prevY = target.y;
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mousemove", onMove, { passive: true });

    const styleId = "custom-cursor-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @media (pointer: fine) {
          body, body * { cursor: none !important; }
          input, textarea, [contenteditable] { cursor: text !important; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(raf2);
      dotHistory.forEach((d) => d.el.remove());
      const styleEl = document.getElementById(styleId);
      if (styleEl) styleEl.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={spotlightRef}
        className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[9997] hidden md:block"
        style={{
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(0, 240, 255, 0.03) 30%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{
          backgroundColor: "var(--color-accent)",
          boxShadow: "0 0 12px var(--color-accent), 0 0 24px var(--color-accent), 0 0 36px var(--color-accent-muted)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
