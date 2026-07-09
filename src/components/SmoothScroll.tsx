import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext<Lenis | null>(null)

export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}

interface SmoothScrollProps {
  children: ReactNode
}

/**
 * Lenis smooth-scroll provider.
 *
 * - Disabled under prefers-reduced-motion (native scroll remains).
 * - Integrates with GSAP ScrollTrigger via scrollerProxy/ticker.
 * - Adds a global click listener so anchor links (href="#id") scroll smoothly.
 * - Adds `html.lenis` styling hooks.
 * - Exposes the live Lenis instance through `useLenis()` so progress bars, nav,
 *   and signal-path can subscribe to the smoothed scroll position.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const reduced = useReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return

    const html = document.documentElement
    html.classList.add('lenis', 'lenis-smooth')

    const instance = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    })
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      instance.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!target) return
      const id = target.getAttribute('href')
      if (!id || id === '#') return
      e.preventDefault()
      instance.scrollTo(id, { offset: -72 })
    }
    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      instance.destroy()
      setLenis(null)
      html.classList.remove('lenis', 'lenis-smooth')
      ScrollTrigger.update()
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
