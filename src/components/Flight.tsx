import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { flightScenes, SCENE_BOUNDS } from '@/data/flight'
import { splitWordsWithAccent, renderSplitWords } from '@/lib/splitText'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * The flight — seven rooms passing one lens.
 *
 * The seven plates are not composited as siblings on a page; they are composited as
 * depths in one space. Across the whole flight exactly one number changes: the
 * camera's position. Nothing enters and nothing exits — a room grows until it passes
 * the lens and the next one is already behind it.
 *
 * Two properties keep this safe, and both are reactions to the v5 post-mortem:
 *
 * 1. **No pinning.** A `position: sticky` stage inside an explicit-height runway is
 *    native CSS: correct before JavaScript parses, no pin-spacer, no refresh
 *    ordering, and it cannot strand a blank screen. v5 hand-rolled a scroll driver
 *    that bypassed the ScrollTrigger it was already paying for, and left off-screen
 *    stations in an undefined state — that is the mechanism of the blank frame.
 *
 * 2. **The image scrubs, the type cuts.** The plate dissolves as a smooth function
 *    of scroll, but the headline swaps hard at the crossfade midpoint. So at every
 *    scroll position exactly one headline sits at full opacity. Text legibility is
 *    never a function of scrub position, which is the specific defect that made v5's
 *    scrubbed count-ups unreadable — and why it rendered "$0 saved" on cold load.
 *
 * The resting state, authored in CSS, is scene 1 fully painted with its real copy.
 * A dead timeline, a reverted context, a deep link or a JS failure all land on a
 * true frame rather than an empty one.
 */

/** Fraction of each scene-unit spent crossfading; the remainder is a clean hold. */
const BLEND = 0.35

export default function Flight() {
  const runwayRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const scene = flightScenes[active]

  useGSAP(
    () => {
      const runway = runwayRef.current
      if (!runway) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const planes = gsap.utils.toArray<HTMLElement>('[data-plane]', runway)
        if (!planes.length) return

        const setOpacity = planes.map((p) => gsap.quickSetter(p, 'opacity'))
        const setScale = planes.map((p) => gsap.quickSetter(p, 'scale'))
        // `visibility` is toggled only when a plane crosses in or out of range, never
        // per frame — a permanent lease on seven full-bleed plates costs real VRAM.
        const shown = planes.map((_, i) => i === 0)

        const last = SCENE_BOUNDS.length - 1
        let lastIndex = -1

        // Each scene advances the camera one full scene-unit, except the last, which
        // advances only through its hold — so the flight ends with plane 7 at full
        // opacity rather than one unit past it, off the end of its own fade.
        const HOLD = 1 - BLEND

        const draw = (t: number) => {
          // Map scroll progress onto a fractional scene position via the weighted
          // bounds, so a scene's share of travel is its `weight`, not 1/n.
          let i = 0
          while (i < last && t > SCENE_BOUNDS[i]) i++
          const prev = i === 0 ? 0 : SCENE_BOUNDS[i - 1]
          const span = SCENE_BOUNDS[i] - prev || 1
          const u = (t - prev) / span
          const position = i + u * (i === last ? HOLD : 1)

          for (let j = 0; j < planes.length; j++) {
            const local = position - j
            let opacity = 0
            if (local > -BLEND && local < 1) {
              if (local < 0) {
                // Fading in, on the tail of the scene ahead of it.
                opacity = Math.sin(((local + BLEND) / BLEND) * (Math.PI / 2))
              } else if (local <= 1 - BLEND) {
                opacity = 1
              } else {
                // sin² + cos² = 1 — the constant-energy law, which for additive-over-
                // black compositing is exactly the fix for the crossfade luminance dip.
                opacity = Math.cos(((local - (1 - BLEND)) / BLEND) * (Math.PI / 2))
              }
            }

            const visible = opacity > 0.001
            if (visible !== shown[j]) {
              planes[j].style.visibility = visible ? 'visible' : 'hidden'
              shown[j] = visible
            }
            setOpacity[j](opacity)
            if (!visible) continue

            // Exponential, not linear: a plane doubling in apparent size every
            // scene-unit is what makes a dolly feel linear to the eye. Linear scale
            // reads as a zoom.
            setScale[j](Math.pow(2, local * 0.46))
          }

          // Flip the copy at the crossfade's true midpoint, not at the halfway point
          // of the scene unit. The plate holds for (1 - BLEND) and only then starts
          // dissolving, so the incoming plane overtakes the outgoing one at
          // local = (1 - BLEND) + BLEND/2. Rounding at 0.5 named the next scene while
          // the previous plate was still at 97% opacity — the label led the picture.
          const CROSS_MID = 1 - BLEND / 2
          const index = Math.min(
            flightScenes.length - 1,
            Math.max(0, Math.floor(position + (1 - CROSS_MID))),
          )
          if (index !== lastIndex) {
            lastIndex = index
            setActive(index)
          }
        }

        const trigger = ScrollTrigger.create({
          trigger: runway,
          // `clamp()` is specifically the fix for scrub jumping on load at the top.
          start: 'clamp(top top)',
          end: () => '+=' + (runway.offsetHeight - window.innerHeight),
          scrub: 0.55,
          invalidateOnRefresh: true,
          onUpdate: (self) => draw(self.progress),
          onToggle: (self) => {
            // Lease will-change only while the flight is on screen.
            for (const p of planes) p.style.willChange = self.isActive ? 'transform, opacity' : 'auto'
          },
        })

        draw(trigger.progress)
        return () => {
          for (const p of planes) p.style.willChange = 'auto'
        }
      })

      return () => mm.revert()
    },
    { scope: runwayRef },
  )

  // Headline cut: a per-line mask stagger, fired on index change. Per line, never
  // per character — character stagger on a sentence is the loudest slop tell going,
  // and it creates sixty-odd compositor layers for one heading.
  const copyRef = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = copyRef.current
      if (!el) return
      const parts = el.querySelectorAll<HTMLElement>('[data-cut]')
      if (!parts.length) return
      gsap.fromTo(
        parts,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 0.75,
          ease: 'power4.out',
          stagger: 0.055,
          overwrite: true,
          clearProps: 'transform',
        },
      )
    },
    { dependencies: [active], scope: copyRef },
  )

  const words = renderSplitWords(splitWordsWithAccent(scene.headline, scene.verb), {
    wordClassName: 'inline-block overflow-clip align-bottom',
    innerClassName: 'inline-block',
    accentClassName: 'inline-block overflow-clip align-bottom',
    // Always armed: the hero is on screen at t=0, so mount and "in view" are the
    // same moment here — no useInView needed, unlike every other .verb instance.
    accentInnerClassName: 'verb verb--armed inline-block',
  })

  return (
    <section
      id="top"
      ref={runwayRef}
      className="flight"
      aria-label="Career flight — seven scenes"
    >
      <div className="flight__stage">
        {flightScenes.map((s, i) => (
          <div key={s.id} data-plane className="plane" style={{ zIndex: flightScenes.length - i }}>
            <picture>
              <source
                type="image/avif"
                srcSet={`/scenes/${s.plate}@sm.avif 1280w, /scenes/${s.plate}.avif 2048w`}
                sizes="100vw"
              />
              <img
                src={`/scenes/${s.plate}${i < 2 ? '.jpg' : '.avif'}`}
                alt=""
                aria-hidden="true"
                decoding={i === 0 ? 'sync' : 'async'}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
                draggable={false}
              />
            </picture>
          </div>
        ))}

        {/* Lens furniture. The horizon rule sits at 46% because every plate in the
            set has its vanishing point between 46% and 55% — one match cut held for
            the whole film, for the cost of one div. */}
        <span aria-hidden="true" className="flight__horizon" />
        <span aria-hidden="true" className="flight__vignette" />
        <span aria-hidden="true" className="flight__grain" />

        <div className="flight__copy" ref={copyRef}>
          <p className="eyebrow flight__eyebrow">
            <span data-cut className="inline-block">
              {scene.eyebrow}
            </span>
          </p>

          <h1 className="flight__headline">
            {words.map((w) => (
              <span key={w.key} className={w.outerClassName}>
                <span data-cut className={w.innerClassName}>
                  {w.text}
                </span>
              </span>
            ))}
          </h1>

          {scene.kicker ? (
            <p className="flight__kicker">
              <span data-cut className="inline-block">
                {scene.kicker}
              </span>
            </p>
          ) : null}

          <ul className="flight__readings">
            {scene.readings.map((r) => (
              <li key={r.label}>
                <span className="stat__figure">{r.value}</span>
                <span className="stat__label">{r.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The year you are standing in — scroll position means "which year", not
            "how far through". There is deliberately no shot counter beside it: the
            page already has a scroll-progress bar, and an "01/07" would frame a
            continuous camera move as a slideshow. */}
        <p aria-hidden="true" className="flight__counter">
          <span className="flight__counter-year">{scene.year}</span>
        </p>

        <a href="#arc" className="flight__skip chip">
          Skip the film
        </a>
      </div>
    </section>
  )
}
