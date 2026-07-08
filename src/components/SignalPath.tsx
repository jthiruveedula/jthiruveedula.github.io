import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/hooks'

// The narrative spine: a vertical transmission rail on the page edge.
// A pulse travels top→bottom as the user scrolls, shifting color through
// the legacy → cloud → AI arc — the same journey the résumé content tells.
// Reduced-motion: rail stays static, no traveling pulse.
export default function SignalPath() {
  const reduced = useReducedMotion()
  const railRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)

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
    <div ref={railRef} className="signal-path" aria-hidden="true">
      <div className="signal-path__rail" />
      {!reduced && <div ref={pulseRef} className="signal-path__pulse" />}
    </div>
  )
}
