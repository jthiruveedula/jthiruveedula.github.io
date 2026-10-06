import { useEffect, useRef } from 'react'
import { useLenis } from '@/components/SmoothScroll'
import '@/styles/hero-track.css'

/** Thin top-of-page bar reflecting scroll progress through the document.
 *  Syncs to Lenis when available, otherwise falls back to native scroll. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    // Velocity glow: spikes with scroll speed, decays per frame; stops its RAF at 0.
    const mqStill = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lastY = window.scrollY
    let glow = 0
    let glowRaf = 0
    const decay = () => {
      glow *= 0.9
      if (glow < 0.02) glow = 0
      barRef.current?.style.setProperty('--scroll-glow', glow.toFixed(3))
      glowRaf = glow ? requestAnimationFrame(decay) : 0
    }
    const pulse = () => {
      if (mqStill.matches) return
      const y = window.scrollY
      glow = Math.max(glow, Math.min(1, Math.abs(y - lastY) / 80))
      lastY = y
      if (!glowRaf) glowRaf = requestAnimationFrame(decay)
    }

    const update = () => {
      pulse()
      const progress = lenis ? lenis.progress : (() => {
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        return max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
      })()
      barRef.current?.style.setProperty('--scroll-progress', String(progress))
    }

    if (lenis) {
      lenis.on('scroll', update)
      update()
      return () => {
        lenis.off('scroll', update)
        cancelAnimationFrame(glowRaf)
      }
    }

    // Fallback for reduced-motion / no Lenis.
    let raf = 0
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0
        update()
      })
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      cancelAnimationFrame(glowRaf)
    }
  }, [lenis])

  return <div ref={barRef} aria-hidden="true" className="scroll-progress" />
}
