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

/**
 * Does this browser support WebGL at all? Detected once and cached.
 *
 * A platform capability check, deliberately NOT a context allocation. The previous
 * implementation created a detached canvas and asked it for a context, which is
 * unreliable twice over: a document's live-context budget may already be spent by the
 * scroll-world flight, and a canvas that was never attached to the DOM is refused a
 * context outright in some environments. Both were measured here — with the flight
 * running, a detached probe returns null on hardware whose WebGL plainly works.
 *
 * The consequence of that false negative was visible: the skills section fell back to its
 * text branch and dumped all 154 capabilities on screen beneath the constellation.
 *
 * Whether a SECOND context can actually be created is not answered here, because it is
 * not reliably answerable in advance — a probe can succeed and three.js still fail.
 * Sections that mount a canvas handle that by degrading: a static base layer behind the
 * canvas, plus an ErrorBoundary around it.
 */
function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false
  return typeof WebGL2RenderingContext !== 'undefined' || typeof WebGLRenderingContext !== 'undefined'
}

const webglSupport = detectWebGL()

export function useWebGLSupport(): boolean {
  return webglSupport
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
