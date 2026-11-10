import { useEffect, useRef, useState } from 'react'
import { COMPACT } from '@/lib/view'

/** True when the user prefers reduced motion, or the page is in compact view — gate all non-essential animation on this. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => COMPACT || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(COMPACT || mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * IntersectionObserver visibility — pause looping CSS/GSAP animations when a
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
