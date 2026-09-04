import { useEffect, useState } from 'react'

import { useInView } from '@/lib/hooks'

interface ActBreakProps {
  /** Basename in public/scenes/ — a plate already graded for the flight. */
  plate: string
  /** The act number, matching the eyebrow of the section directly below. */
  index: string
  /** The act name, matching that same eyebrow. */
  label: string
}

/**
 * The act break — the film's plates, returning between chapters.
 *
 * Below the flight the page ran six text screens in a row. Every one of them is
 * well set, and together they still read as a document stacked under a film,
 * because nothing punctuates them. This is the punctuation: a short full-bleed
 * band carrying the next chapter's plate and its number, in the grammar a film
 * uses to say "act two". The plates are already built, already graded, and were
 * being spent on one hero and a column of 13rem thumbnails.
 *
 * Static on purpose. A scrubbed or parallaxed plate here would be a second
 * camera competing with the flight's, and the flight's is the only camera on
 * this page allowed to move as a function of scroll. The single moving part is
 * the mark's rule, which DRAWs to width once on entry like every other rule in
 * the site — and it draws by *removing* a class, so the authored resting state
 * is the finished one. A dead observer leaves the mark complete rather than
 * stranded, which is the same contract every reveal here is held to.
 *
 * `aria-hidden` is deliberate: the act number and its name are printed again in
 * the eyebrow of the section immediately below, so to a screen reader this band
 * is decoration and repeating it would be noise.
 */
export default function ActBreak({ plate, index, label }: ActBreakProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  // Latched: DRAW means a line reaches its length *once*, on entry. An
  // IntersectionObserver reports leaving as well as arriving, and a rule that
  // un-draws itself on the way back up is the loudest slop tell in the set.
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    if (inView) setDrawn(true)
  }, [inView])

  return (
    <div ref={ref} aria-hidden="true" className="act" data-in={drawn ? 'true' : 'false'}>
      <picture>
        <source
          type="image/avif"
          srcSet={`/scenes/${plate}@sm.avif 1280w, /scenes/${plate}.avif 2048w`}
          sizes="100vw"
        />
        <img src={`/scenes/${plate}@sm.avif`} alt="" loading="lazy" decoding="async" draggable={false} />
      </picture>

      <span className="act__scrim" />
      <span className="act__horizon" />

      <p className="act__mark">
        <span className="act__index">{index}</span>
        <span className="act__rule" />
        <span className="act__label">{label}</span>
      </p>
    </div>
  )
}
