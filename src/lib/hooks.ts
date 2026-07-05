import { useEffect, useRef, useState } from 'react'

/** True when the user prefers reduced motion — gate all non-essential animation on this. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** WebGL availability — false means render the 2D fallback instead of a Canvas. */
export function useWebGLSupport(): boolean {
  const [supported] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      return false
    }
  })
  return supported
}

/** Coarse device heuristic — used to cut particle counts / geometry on mobile. */
export function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])
  return mobile
}

/**
 * IntersectionObserver visibility — pause R3F frameloops / GSAP tickers when a
 * section is offscreen. Returns [ref, isInView].
 */
export function useInView<T extends HTMLElement>(rootMargin = '200px'): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])
  return [ref, inView]
}
