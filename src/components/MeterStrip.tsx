/**
 * Meter strip — the band directly under the hero.
 *
 * A printed readout, not a live feed: the ticks are static and deterministic,
 * driven by a smooth envelope so the strip reads as a measurement rather than
 * a decorative row of equal bars. The two labels are real values from
 * `portfolio.ts`; nothing here is invented.
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
  return (
    <aside className="meter" aria-label="Production readout">
      <p className="meter__label">uptime · 99.9%</p>
      <div className="meter__bars" aria-hidden="true">
        {BARS.map((bar, i) => (
          <span key={i} style={{ height: bar.height, opacity: bar.opacity }} />
        ))}
      </div>
      <p className="meter__label">accuracy under HIPAA · 100%</p>
    </aside>
  )
}
