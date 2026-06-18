"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const ORB_COUNT = [0, 1, 2] as const;

export default function AmbientOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!container) return;

    const orbs = container.querySelectorAll<HTMLElement>(".ambient-orb");
    const ctx = gsap.context(() => {
      orbs.forEach((orb) => {
        const startX = gsap.utils.random(5, 95);
        const startY = gsap.utils.random(5, 95);
        const dur = gsap.utils.random(12, 20);
        const driftX = gsap.utils.random(-40, 40);
        const driftY = gsap.utils.random(-40, 40);

        gsap.set(orb, { left: `${startX}%`, top: `${startY}%` });

        gsap.to(orb, {
          x: driftX,
          y: driftY,
          duration: dur,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {ORB_COUNT.map((i) => (
        <div
          key={i}
          className="ambient-orb absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full"
          style={{
            background: `var(--color-orb-${i + 1})`,
            filter: "blur(80px)",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
