import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/hooks'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/'
const DURATION_MS = 500

function scramble(text: string, progress: number) {
  return text
    .split('')
    .map((ch, i) => {
      if (ch === ' ') return ch
      return progress >= i / text.length ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
    })
    .join('')
}

/**
 * Scramble→resolve reveal for short HUD-style text, once per element on scroll entry.
 * Screen readers get the final text immediately via aria-label; the animated span is aria-hidden.
 */
export default function Decrypt({
  text,
  as: Tag = 'span',
  className,
}: {
  text: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [display, setDisplay] = useState(text)
  const resolvedRef = useRef(false)

  useEffect(() => {
    if (reduced) {
      setDisplay(text)
      return
    }
    const el = ref.current
    if (!el) return
    setDisplay(scramble(text, 0))

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || resolvedRef.current) return
        resolvedRef.current = true
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / DURATION_MS)
          setDisplay(scramble(text, progress))
          if (progress < 1) requestAnimationFrame(tick)
          else setDisplay(text)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced, text])

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Tag>
  )
}
