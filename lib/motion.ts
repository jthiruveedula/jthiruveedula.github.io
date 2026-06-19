export const EASE = {
  cinematic: "power3.out",
  soft: "power2.out",
  snap: "back.out(1.4)",
  glide: "expo.out",
  settle: "elastic.out(1, 0.7)",
} as const;

export const DUR = {
  micro: 0.3,
  base: 0.6,
  hero: 1.0,
  pin: 0.9,
  ambient: 3,
} as const;

export const STAGGER = {
  tight: 0.06,
  cards: 0.1,
  slow: 0.18,
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;
