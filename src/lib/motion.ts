// Shared motion rhythm — every GSAP/CSS animation in the app draws from these.
export const DUR = {
  fast: 0.2,
  reveal: 0.7,
  exit: 0.45, // ~65% of reveal
} as const

export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  spring: 'back.out(1.6)',
} as const

export const STAGGER = 0.04
