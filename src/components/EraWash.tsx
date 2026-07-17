import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Scroll-scrubbed "era wash" — a fixed, decorative layer whose legacy→cloud→ai
 * tint tracks page scroll progress (via the `--era-wash` CSS variable the
 * `.era-wash` gradient reads). Cheap: one ScrollTrigger updating a custom prop.
 * - Reduced motion: pinned to a static mid-wash (no scroll linkage).
 * - Painted at z-index: -1, so it never sits over content or hurts text contrast.
 */
export default function EraWash() {
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const root = document.documentElement
      if (reduced) {
        root.style.setProperty('--era-wash', '0.5')
        return
      }
      gsap.set(root, { '--era-wash': 0 })
      gsap.to(root, {
        '--era-wash': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
        },
      })
    },
    { dependencies: [reduced] },
  )

  return <div className="era-wash" aria-hidden="true" />
}
