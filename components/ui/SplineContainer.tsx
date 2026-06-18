"use client";

import { useRef } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

interface SplineContainerProps {
  className?: string;
  intensity?: number;
}

export default function SplineContainer({ className = "", intensity = 15 }: SplineContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { normalizedX, normalizedY } = useMousePosition();

  const rotateX = -normalizedY * intensity;
  const rotateY = normalizedX * intensity;

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`,
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="absolute inset-[-5%] rounded-full border animate-pulse" style={{ animationDelay: "0.5s", animationDuration: "4s", borderColor: "color-mix(in srgb, var(--color-accent) 5%, transparent)" }} />
          <div className="absolute inset-0 rounded-full border animate-pulse" style={{ animationDelay: "0s", animationDuration: "4s", borderColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }} />
          <div className="absolute inset-[15%] rounded-full border animate-pulse" style={{ animationDelay: "-1s", animationDuration: "4s", borderColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }} />
          <div className="absolute inset-[30%] rounded-full border animate-pulse" style={{ animationDelay: "-2s", animationDuration: "4s", borderColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }} />
          <div className="absolute inset-[45%] rounded-full border animate-pulse" style={{ animationDelay: "-3s", animationDuration: "4s", borderColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full blur-sm" style={{ backgroundColor: "var(--color-accent)", boxShadow: "0 0 20px var(--color-accent), 0 0 40px var(--color-accent-muted)" }} />
        </div>
      </div>
    </div>
  );
}
