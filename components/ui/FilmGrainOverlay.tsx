"use client";

export default function FilmGrainOverlay() {
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" aria-hidden="true">
      <svg className="w-full h-full opacity-[0.03]" viewBox="0 0 256 256">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
