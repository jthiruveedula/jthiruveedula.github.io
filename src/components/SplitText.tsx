import { useMemo, type ReactNode } from 'react'
import { splitWordsWithAccent, type WordSpan } from '@/lib/splitText'
import { useReducedMotion } from '@/lib/hooks'

interface SplitTextProps {
  children: string
  /** CSS class applied to each word's outer overflow-hidden wrapper. */
  className?: string
  /** CSS class applied to each animated inner word span. */
  innerClassName?: string
  /** Word(s) that should receive the accent class(es). */
  accent?: string | string[]
  /** Class applied to the outer wrapper of an accent word. */
  accentClassName?: string
  /** Class applied to the inner span of an accent word. */
  accentInnerClassName?: string
  /** Optional element to render around the whole string. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  /** Reduced-motion: render plain text with no wrappers. */
  reduced?: boolean
  /** Optional additional children rendered after the split text. */
  suffix?: ReactNode
}

/** Zero-dependency word-reveal helper.
 *
 *  Under reduced motion (or when `reduced` is true) the text renders as-is so
 *  screen readers and no-JS users get the canonical content. Otherwise each word
 *  is wrapped in an overflow-hidden mask + inline-block inner span that GSAP can
 *  animate with `yPercent` reveals.
 */
export default function SplitText({
  children,
  className = 'inline-block overflow-hidden align-bottom',
  innerClassName = 'split-word inline-block',
  accent,
  accentClassName,
  accentInnerClassName,
  as: Tag = 'span',
  reduced: reducedProp,
  suffix,
}: SplitTextProps) {
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced

  const spans = useMemo<WordSpan[]>(() => {
    if (reduced) return []
    return splitWordsWithAccent(children, accent)
  }, [children, accent, reduced])

  if (reduced) {
    return (
      <Tag>
        {children}
        {suffix}
      </Tag>
    )
  }

  return (
    <Tag>
      {spans.map((span, i) => {
        const isSpace = /^\s+$/.test(span.word)
        const text = isSpace ? '\u00A0' : span.word
        const outer = span.isAccent && accentClassName ? accentClassName : className
        const inner = span.isAccent && accentInnerClassName ? accentInnerClassName : innerClassName
        return (
          <span key={`${text}-${i}`} className={outer}>
            <span className={inner}>{text}</span>
          </span>
        )
      })}
      {suffix}
    </Tag>
  )
}
