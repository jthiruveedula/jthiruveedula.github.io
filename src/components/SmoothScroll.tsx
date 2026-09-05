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

    // Named so it can actually be removed. The anonymous version leaked: in
    // StrictMode dev the stale callback kept calling .raf() on a destroyed Lenis
    // every frame, and this build adds per-frame scroll work on top of it.
    const tick = (time: number) => {
      instance.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Deep-link and restored-scroll correctness. The browser restoring a scroll
    // position before triggers exist is one half of how v5 landed on a blank
    // frame; a lazy chunk resolving and changing document height — firing neither
    // scroll nor resize — is the other.
    history.scrollRestoration = 'manual'
    const hash = window.location.hash
    const raf = requestAnimationFrame(() => {
      if (hash && document.querySelector(hash)) {
        instance.scrollTo(hash, { immediate: true, offset: -72 })
      }
      ScrollTrigger.refresh()
    })
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!target) return
      const id = target.getAttribute('href')
      if (!id || id === '#') return
      e.preventDefault()
      instance.scrollTo(id, { offset: -72 })
      // Lenis intercepts the click, so native fragment navigation — the browser
      // moving focus to the target — never fires. Without this, a keyboard
      // visitor's tab order snaps back to the top of the page after every jump.
      let dest: Element | null = null
      try {
        dest = document.querySelector(id)
      } catch {
        // id came straight off an href and can be CSS-invalid (e.g. a numeric
        // id) even though it's a valid HTML id — don't crash the click handler.
      }
      if (dest instanceof HTMLElement) {
        dest.setAttribute('tabindex', '-1')
        dest.focus({ preventScroll: true })
      }
    }
    document.addEventListener('click', handleAnchorClick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
      gsap.ticker.remove(tick)
      document.removeEventListener('click', handleAnchorClick)
      instance.destroy()
      setLenis(null)
      html.classList.remove('lenis', 'lenis-smooth')
      ScrollTrigger.update()
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
