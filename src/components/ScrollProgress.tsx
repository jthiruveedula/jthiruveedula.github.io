import { useEffect, useRef } from 'react'
import { useLenis } from '@/components/SmoothScroll'

/** Thin top-of-page bar reflecting scroll progress through the document.
 *  Syncs to Lenis when available, otherwise falls back to native scroll. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    const update = () => {
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
      }
    }

    // Fallback for reduced-motion / no Lenis.
    let raf = 0
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [lenis])

  return <div ref={barRef} aria-hidden="true" className="scroll-progress" />
}
