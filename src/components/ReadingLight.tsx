import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/hooks'
import { useLenis } from '@/components/SmoothScroll'

/**
 * Scroll-linked "reading light" — a soft era-tinted glow whose vertical
 * position tracks scroll progress, so each section is spotlighted as it
 * arrives (HyperFrames `spotlight/dim` primitive: the highlight is swept ON,
 * never pre-applied). Blended `screen` so it only lightens; ambient, not a
 * flashlight. Reduced-motion: a single static glow, no scroll tracking.
 */
export default function ReadingLight() {
  const reduced = useReducedMotion()
  const lenis = useLenis()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const setY = (progress: number) => {
      el.style.setProperty('--spot-y', `${Math.min(Math.max(progress, 0), 1) * 100}%`)
    }

    if (reduced) {
      setY(0.5)
      return
    }

    let raf = 0
    let ticking = false
    const update = () => {
      ticking = false
      const y = lenis ? Math.max(lenis.scroll, 0) : Math.max(window.scrollY, 0)
      const max = lenis ? lenis.limit : document.documentElement.scrollHeight - window.innerHeight
      setY(max > 0 ? y / max : 0)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }

    update()
    if (lenis) lenis.on('scroll', onScroll)
    else window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      if (lenis) lenis.off('scroll', onScroll)
      else window.removeEventListener('scroll', onScroll)
    }
  }, [reduced, lenis])

  return <div ref={ref} aria-hidden="true" className="atmosphere__spotlight" />
}
