/** Lightweight, zero-dependency text splitter — a free alternative to GSAP SplitText.
 *
 *  Splits a string into words (and optionally lines) wrapped in inline-block spans
 *  so GSAP can animate y/autoAlpha per word without a paid plugin. The output is
 *  plain markup that degrades gracefully when JavaScript is disabled or when the
 *  user prefers reduced motion.
 */

export interface WordSpan {
  word: string
  isAccent: boolean
}

/** Split text into words, preserving trailing spaces as non-breaking spaces. */
export function splitWords(text: string): WordSpan[] {
  return text.split(/(\s+)/).map((part) => ({
    word: part,
    isAccent: false,
  }))
}

/** Split text into words and mark any occurrences of `accent` as accented. */
export function splitWordsWithAccent(text: string, accent?: string | string[]): WordSpan[] {
  const accents = accent ? (Array.isArray(accent) ? accent : [accent]) : []
  return text.split(/(\s+)/).map((part) => ({
    word: part,
    isAccent: accents.some((a) => part.toLowerCase() === a.toLowerCase()),
  }))
}

/** Build React-safe children from word spans.
 *  Each word is wrapped in an overflow-hidden span + an inner inline-block span
 *  so a `yPercent: 100` reveal slides the word up out of its clip mask. */
export function renderSplitWords(
  spans: WordSpan[],
  options?: {
    wordClassName?: string
    accentClassName?: string
    innerClassName?: string
    accentInnerClassName?: string
  },
): { key: string; outerClassName: string; innerClassName: string; text: string }[] {
  const {
    wordClassName = 'inline-block overflow-hidden align-bottom',
    accentClassName,
    innerClassName = 'split-word inline-block',
    accentInnerClassName,
  } = options ?? {}

  return spans.map((span, i) => {
    const isSpace = /^\s+$/.test(span.word)
    const text = isSpace ? '\u00A0' : span.word
    return {
      key: `w-${i}-${span.word}`,
      outerClassName: span.isAccent && accentClassName ? accentClassName : wordClassName,
      innerClassName: span.isAccent && accentInnerClassName ? accentInnerClassName : innerClassName,
      text,
    }
  })
}
