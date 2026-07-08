import { useEffect, useRef, useState } from 'react'
import { useReducedMotion, useIsMobile } from '@/lib/hooks'

// FUI custom cursor — a HUD dot + trailing ring that magnetizes toward
// interactive targets. Desktop + fine-pointer only; reduced-motion disables it
// entirely (native cursor stays). Decorative, aria-hidden, never blocks clicks.
export default function CustomCursor() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (reduced || isMobile) return
    const canHover = window.matchMedia('(pointer: fine)').matches
    if (!canHover) return

    let ringX = window.innerWidth / 2
    let ringY = window.innerHeight / 2
    let mouseX = ringX
    let mouseY = ringY
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!active) setActive(true)
      const dot = dotRef.current
      if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`

      const target = e.target as HTMLElement | null
      const interactive = Boolean(target?.closest('a, button, [role="button"], input, summary'))
      setHovering(interactive)
    }

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18
      const ring = ringRef.current
      if (ring) ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onLeave = () => setActive(false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, isMobile])

  if (reduced || isMobile) return null

  return (
    <div className={`cursor-fui ${active ? 'cursor-fui--active' : ''}`} aria-hidden="true">
      <div ref={dotRef} className="cursor-fui__dot" />
      <div ref={ringRef} className={`cursor-fui__ring ${hovering ? 'cursor-fui__ring--hover' : ''}`} />
    </div>
  )
}
