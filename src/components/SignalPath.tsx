import { useEffect, useRef, useState } from 'react'
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
export default function SignalPath() {
  const reduced = useReducedMotion()
  const pulseRef = useRef<HTMLDivElement>(null)
  const [ticks, setTicks] = useState<{ id: string; label: string; top: number }[]>([])
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  useEffect(() => {
    const measure = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      if (total <= 0) return
      const next = STOPS.map((stop) => {
        const el = document.getElementById(stop.id)
        const top = el ? el.offsetTop / doc.scrollHeight : 0
        return { ...stop, top }
      })
      setTicks(next)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
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
  }, [])

  return (
    <div className="signal-path" aria-hidden="true">
      <div className="signal-path__rail" />
      {ticks.map((tick) => (
        <div
          key={tick.id}
          className={`signal-path__tick${activeLabel === tick.id ? ' signal-path__tick--active' : ''}`}
          style={{ top: `${tick.top * 100}%` }}
        >
          <span className="signal-path__tick-label">{tick.label}</span>
        </div>
      ))}
      {!reduced && <div ref={pulseRef} className="signal-path__pulse" />}
    </div>
  )
}
