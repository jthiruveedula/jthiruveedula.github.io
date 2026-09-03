import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Meter strip — the band directly under the hero.
 *
 * A printed readout, not a live feed: the ticks are static and deterministic,
 * driven by a smooth envelope so the strip reads as a measurement rather than
 * a decorative row of equal bars. The two labels are real values from
 * `portfolio.ts`; nothing here is invented.
 *
 * DRAW verb (see globals.css's motion-grammar header): every other bar/line in
 * the site — the era bands in #ledger, the stage paths in #systems, the rate
 * bars in #index — reaches its length once, on entry. This was the one
 * left static, sitting immediately below the flight where the eye lands
 * first after the hero. fromTo with an explicit end, once:true, gated on
 * reduced motion — same contract as every other DRAW in the page.
 */
const TICKS = 72

// Composite envelope — a slow sine under a faster one, damped toward both ends.
// Deterministic, so the strip is identical on every render and every visit.
const BARS = Array.from({ length: TICKS }, (_, i) => {
  const t = i / (TICKS - 1)
  const envelope = Math.sin(Math.PI * t) ** 0.6
  const detail = 0.62 + 0.38 * Math.sin(t * Math.PI * 7.3 + 0.6) * Math.sin(t * Math.PI * 2.1)
  const h = Math.max(0.12, envelope * detail)
  return { height: `${(h * 100).toFixed(1)}%`, opacity: 0.28 + h * 0.62 }
})

export default function MeterStrip() {
  const stripRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const bars = gsap.utils.toArray<HTMLElement>('[data-bar]', stripRef.current)
        if (!bars.length) return
        gsap.fromTo(
          bars,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: { each: 0.006, from: 'start' },
            scrollTrigger: { trigger: stripRef.current, start: 'top 85%', once: true },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: stripRef },
  )

  return (
    <aside ref={stripRef} className="meter" aria-label="Production readout">
      <p className="meter__label">uptime · 99.9%</p>
      <div className="meter__bars" aria-hidden="true">
        {BARS.map((bar, i) => (
          <span key={i} data-bar style={{ height: bar.height, opacity: bar.opacity }} />
        ))}
      </div>
      <p className="meter__label">accuracy under HIPAA · 100%</p>
    </aside>
  )
}
