"use client";

import { useId } from "react";

export default function FilmGrainOverlay() {
  const id = useId();
  const filterId = `grain-${id}`;
  const scanId = `scan-${id}`;
  const scanlineId = `scanline-${id}`;

  return (
    <div className="fixed inset-0 z-[61] pointer-events-none mix-blend-overlay" aria-hidden="true">
      <svg className="w-full h-full opacity-[0.04]" viewBox="0 0 256 256">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      <svg className="absolute inset-0 w-full h-full opacity-[0.015]" viewBox="0 0 256 256">
        <pattern id={scanId} width="100%" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#${scanId})`} />
      </svg>
      <svg className="absolute inset-0 w-full h-full opacity-[0.012]" viewBox="0 0 256 256">
        <pattern id={scanlineId} width="100%" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100%" y2="0" stroke="#000" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#${scanlineId})`} />
      </svg>
    </div>
  );
}
