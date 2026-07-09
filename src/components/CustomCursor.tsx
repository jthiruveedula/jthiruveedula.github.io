import { useEffect, useRef, useState } from 'react'
import { useReducedMotion, useIsMobile } from '@/lib/hooks'

const MAGNET_SELECTOR = 'a, button, [role="button"], input, summary, [data-magnetic]'
const MAGNET_STRENGTH = 0.35

/** Read a contextual cursor label from the hovered element. */
function cursorLabelFor(el: HTMLElement | null): string | null {
  if (!el) return null
  const labeled = el.closest<HTMLElement>('[data-cursor-label]')
  return labeled?.dataset.cursorLabel ?? null
}

// FUI custom cursor — a HUD dot + trailing ring that magnetizes toward
// interactive targets, stretches with velocity, pulses a ripple on click,
// and displays contextual labels for links/buttons. Desktop + fine-pointer
// only; reduced-motion disables it entirely (native cursor stays).
// Decorative, aria-hidden, never blocks clicks.
export default function CustomCursor() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const rippleLayerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (reduced || isMobile) return
    const canHover = window.matchMedia('(pointer: fine)').matches
    if (!canHover) return

    let ringX = window.innerWidth / 2
    let ringY = window.innerHeight / 2
    let mouseX = ringX
    let mouseY = ringY
    let prevRingX = ringX
    let prevRingY = ringY
    let targetX = 0
    let targetY = 0
    let magnetized: HTMLElement | null = null
    let raf = 0

    const findMagnet = (target: HTMLElement | null) => {
      const el = target?.closest<HTMLElement>(MAGNET_SELECTOR) ?? null
      if (!el) return null
      const rect = el.getBoundingClientRect()
      // Skip oversized elements (nav bars, sections) — magnetism is for pill/icon-sized targets
      if (rect.width > 220 || rect.height > 220) return null
      return { el, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
    }

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!active) setActive(true)

      const target = e.target as HTMLElement | null
      const magnet = findMagnet(target)
      const interactive = Boolean(target?.closest('a, button, [role="button"], input, summary'))
      setHovering(interactive)
      setLabel(cursorLabelFor(target))
      magnetized = magnet?.el ?? null
      targetX = magnet ? magnet.cx : mouseX
      targetY = magnet ? magnet.cy : mouseY

      const dot = dotRef.current
      if (dot) dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
    }

    const tick = () => {
      const pull = magnetized ? MAGNET_STRENGTH : 0.18
      ringX += (targetX - ringX) * pull
      ringY += (targetY - ringY) * pull

      const vx = ringX - prevRingX
      const vy = ringY - prevRingY
      const speed = Math.min(Math.hypot(vx, vy), 40)
      const angle = speed > 0.5 ? (Math.atan2(vy, vx) * 180) / Math.PI : 0
      const stretch = 1 + speed / 55

      const ring = ringRef.current
      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) rotate(${angle}deg) scaleX(${stretch})`
      }
      const labelEl = labelRef.current
      if (labelEl) {
        labelEl.style.transform = `translate3d(${ringX}px, ${ringY + 28}px, 0)`
      }
      prevRingX = ringX
      prevRingY = ringY
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onDown = (e: PointerEvent) => {
      const layer = rippleLayerRef.current
      if (!layer) return
      const ripple = document.createElement('span')
      ripple.className = 'cursor-fui__ripple'
      ripple.style.left = `${e.clientX}px`
      ripple.style.top = `${e.clientY}px`
      layer.appendChild(ripple)
      window.setTimeout(() => ripple.remove(), 500)
    }

    const onLeave = () => setActive(false)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [reduced, isMobile])

  if (reduced || isMobile) return null

  return (
    <div className={`cursor-fui ${active ? 'cursor-fui--active' : ''}`} aria-hidden="true">
      <div ref={dotRef} className="cursor-fui__dot" />
      <div ref={ringRef} className={`cursor-fui__ring ${hovering ? 'cursor-fui__ring--hover' : ''}`} />
      <span
        ref={labelRef}
        className={`cursor-fui__label ${label ? 'cursor-fui__label--visible' : ''}`}
      >
        {label}
      </span>
      <div ref={rippleLayerRef} className="cursor-fui__ripple-layer" />
    </div>
  )
}
