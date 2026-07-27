import { useEffect, useRef, useState } from 'react'
import { useLenis } from '@/components/SmoothScroll'
import { useReducedMotion } from '@/lib/hooks'

const STOPS: { id: string; label: string }[] = [
  { id: 'hero', label: 'Origin' },
  { id: 'timeline', label: 'Legacy' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'impact', label: 'Impact' },
  { id: 'contact', label: 'Signal' },
]

// The narrative spine: a vertical transmission rail on the page edge.
// A pulse travels top→bottom as the user scrolls, shifting color through
// the legacy → cloud → AI arc — the same journey the résumé content tells.
// Tick marks map to section boundaries; nearest tick's label fades in.
// Reduced-motion: rail + static ticks only, no traveling pulse.
// Syncs to Lenis when available so the pulse tracks the smoothed scroll.
export default function SignalPath() {
  const reduced = useReducedMotion()
  const lenis = useLenis()
  const pulseRef = useRef<HTMLDivElement>(null)
  const [ticks, setTicks] = useState<{ id: string; label: string; top: number }[]>([])
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  useEffect(() => {
    const doc = document.documentElement
    let lastSignature = ''

    const measure = () => {
      const total = doc.scrollHeight - doc.clientHeight
      if (total <= 0) return
      const found = STOPS.map((stop) => {
        const el = document.getElementById(stop.id)
        return { ...stop, el, top: el ? el.offsetTop / doc.scrollHeight : null }
      })
      // Only publish once the positions actually differ from each other. Every section
      // below the flight is a lazy chunk, so a single measure on mount resolved every
      // `getElementById` to null and pinned all six ticks to 0% — six labels stacked in
      // one spot at the top of the rail.
      const signature = found.map((t) => (t.top === null ? 'x' : t.top.toFixed(4))).join('|')
      if (signature === lastSignature) return
      lastSignature = signature
      setTicks(found.filter((t): t is typeof t & { top: number } => t.top !== null).map(({ id, label, top }) => ({ id, label, top })))
    }

    measure()
    // Body resizes as the lazy sections mount, which is the signal that the section
    // offsets are finally real.
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const progress = lenis ? lenis.progress : (() => {
        const max = doc.scrollHeight - doc.clientHeight
        return max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
      })()
      const pulse = pulseRef.current
      if (pulse) {
        pulse.style.setProperty('--signal-progress', String(progress))
      }
      let nearestId: string | null = null
      let nearestDist = Infinity
      for (const stop of STOPS) {
        const el = document.getElementById(stop.id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const dist = Math.abs(rect.top)
        if (rect.top < window.innerHeight * 0.6 && dist < nearestDist) {
          nearestDist = dist
          nearestId = stop.id
        }
      }
      setActiveLabel(nearestId)
    }

    if (lenis) {
      lenis.on('scroll', update)
      update()
      return () => {
        lenis.off('scroll', update)
      }
    }

    // Fallback for reduced-motion / no Lenis.
    let raf = 0
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [lenis])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) {
      lenis.scrollTo(el, { offset: -72 })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="signal-path">
      <div className="signal-path__rail" />
      {ticks.map((tick) => (
        <div
          key={tick.id}
          className={`signal-path__tick${activeLabel === tick.id ? ' signal-path__tick--active' : ''}`}
          style={{ top: `${tick.top * 100}%` }}
        >
          <button
            type="button"
            onClick={() => scrollTo(tick.id)}
            className="signal-path__tick-label"
            aria-label={`Scroll to ${tick.label}`}
          >
            {tick.label}
          </button>
        </div>
      ))}
      {!reduced && <div ref={pulseRef} className="signal-path__pulse" />}
    </div>
  )
}
