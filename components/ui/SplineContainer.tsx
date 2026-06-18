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
          <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-pulse" style={{ animationDelay: "0s", animationDuration: "4s" }} />
          <div className="absolute inset-[15%] rounded-full border border-cyan-500/10 animate-pulse" style={{ animationDelay: "-1s", animationDuration: "4s" }} />
          <div className="absolute inset-[30%] rounded-full border border-indigo-500/10 animate-pulse" style={{ animationDelay: "-2s", animationDuration: "4s" }} />
          <div className="absolute inset-[45%] rounded-full border border-cyan-500/10 animate-pulse" style={{ animationDelay: "-3s", animationDuration: "4s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400/30 rounded-full blur-sm" />
        </div>
      </div>
    </div>
  );
}
