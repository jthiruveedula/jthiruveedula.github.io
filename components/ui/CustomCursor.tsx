"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const moveDot = gsap.quickTo(dot, "x", { duration: 0, ease: "power3.out" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0, ease: "power3.out" });
    const moveRing = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    const handler = (e: MouseEvent) => {
      moveDot(e.clientX - 4);
      moveDotY(e.clientY - 4);
      moveRing(e.clientX - 14);
      moveRingY(e.clientY - 14);
    };

    const scaleUp = () => gsap.to([dot, ring], { scale: 1.8, duration: 0.25, ease: "power2.out" });
    const scaleDown = () => gsap.to([dot, ring], { scale: 1, duration: 0.25, ease: "power2.out" });

    window.addEventListener("mousemove", handler, { passive: true });

    const hoverables = document.querySelectorAll("a, button, [data-hoverable], input, textarea");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", scaleUp);
      el.addEventListener("mouseleave", scaleDown);
    });

    return () => {
      window.removeEventListener("mousemove", handler);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", scaleUp);
        el.removeEventListener("mouseleave", scaleDown);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-[9999] hidden md:block mix-blend-difference"
        style={{ transform: "translate(0, 0)" }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-7 h-7 border border-indigo-500/60 rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{ transform: "translate(0, 0)" }}
      />
    </>
  );
}
