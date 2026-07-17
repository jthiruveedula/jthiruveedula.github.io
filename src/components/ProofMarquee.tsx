import { useMemo } from 'react'
import { useReducedMotion } from 'motion/react'

/** Continuous proof band: a hallmark of cinematic portfolios. Loops real,
 *  evidence-grade figures to keep authority visible while scrolling.
 *  Decorative (content is duplicated from the hero proof ribbon / metrics),
 *  so it is hidden from assistive tech; paused on hover and under reduced motion. */
const TOKENS = [
  '$2M+ COST SAVED',
  '500+ TIB MIGRATED',
  '1B+ EVENTS STREAMED DAILY',
  '50M+ DOCS IN PROD RAG',
  '95% GROUNDED ACCURACY',
  '60% TIER-1 DEFLECTION',
  '11+ YRS ACROSS DATA & AI',
  '99.9% UPTIME',
]

const MARQUEE_COLORS = [
  'var(--color-legacy)',
  'var(--color-cloud)',
  'var(--color-ai)',
]

export default function ProofMarquee() {
  const reduced = useReducedMotion()
  const loop = useMemo(() => [...TOKENS, ...TOKENS], [])

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-y border-[var(--color-panel-edge)] bg-[var(--color-void)]/60 py-3.5"
    >
      <div
        className="flex w-max gap-10 whitespace-nowrap will-change-transform motion-reduce:transform-none"
        style={
          reduced
            ? undefined
            : { animation: 'proof-marquee 38s linear infinite' }
        }
      >
        {loop.map((token, i) => (
          <span key={i} className="flex items-center gap-10" style={{ color: MARQUEE_COLORS[i % 3] }}>
            <span className="hud-label tracking-[0.18em]">
              {token}
            </span>
            <span className="inline-block h-1.5 w-1.5 rotate-45 opacity-70" style={{ background: MARQUEE_COLORS[i % 3] }} />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--color-void)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--color-void)] to-transparent" />
    </div>
  )
}
