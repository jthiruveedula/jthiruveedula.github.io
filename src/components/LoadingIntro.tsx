import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '@/lib/hooks'
import { portfolio } from '@/data/portfolio'

interface LoadingIntroProps {
  onComplete?: () => void
}

/** Cinematic ≤1.5s loading intro — SVG line-draw name + masked text reveal.
 *  Skippable on click/key; disabled entirely under prefers-reduced-motion. */
export default function LoadingIntro({ onComplete }: LoadingIntroProps) {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(!reduced)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const skippedRef = useRef(false)

  useEffect(() => {
    if (reduced) {
      onComplete?.()
      return
    }

    const container = containerRef.current
    const path = pathRef.current
    const text = textRef.current
    if (!container || !path || !text) return

    const pathLen = path.getTotalLength()
    path.style.strokeDasharray = `${pathLen}`
    path.style.strokeDashoffset = `${pathLen}`

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        if (skippedRef.current) return
        gsap.to(container, {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setVisible(false)
            onComplete?.()
          },
        })
      },
    })

    tl.to(path, { strokeDashoffset: 0, duration: 0.9 }, 0)
      .from(text, { yPercent: 120, autoAlpha: 0, duration: 0.6 }, 0.45)
      .to(text, { opacity: 0, y: -16, duration: 0.3 }, 1.2)

    const skip = () => {
      if (skippedRef.current) return
      skippedRef.current = true
      tl.kill()
      gsap.to(container, {
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          setVisible(false)
          onComplete?.()
        },
      })
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        skip()
      }
    }

    const timer = window.setTimeout(skip, 1600)
    container.addEventListener('click', skip)
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(timer)
      container.removeEventListener('click', skip)
      window.removeEventListener('keydown', onKey)
      tl.kill()
    }
  }, [reduced, onComplete])

  if (!visible) return null
  if (reduced) return null

  const initials = portfolio.profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[300] flex cursor-pointer flex-col items-center justify-center bg-void"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="h-28 w-28 md:h-36 md:w-36"
      >
        <path
          ref={pathRef}
          d="M60 10 L110 60 L60 110 L10 60 Z"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-6 overflow-hidden">
        <h2
          ref={textRef}
          className="from-legacy via-cloud to-ai bg-linear-to-r bg-clip-text font-display text-2xl font-semibold tracking-tight text-transparent md:text-4xl"
        >
          {initials}
        </h2>
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        click or press any key to skip
      </p>
    </div>
  )
}
