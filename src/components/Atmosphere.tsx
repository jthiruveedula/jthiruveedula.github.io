import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * The wash — one lamp, travelling the length of the document.
 *
 * Everything below the flight used to sit on one flat near-black from y=4000 to the
 * footer: ten thousand pixels of identical paper. The film ended at the hero and the
 * rest of the page read as a PDF stacked underneath it. This is the fix, and it is a
 * grade, not an effect — a fixed light field behind the content whose colour travels
 * the same legacy → cloud → AI ramp the rest of the page argues in text.
 *
 * Three properties keep it honest:
 *
 * 1. **One custom property, everything else derived in CSS.** Scroll writes
 *    `--atmos-p` once per frame; opacity and translate are `calc()` off it. No
 *    per-frame gradient recomputation, which is a full-viewport repaint, and no
 *    second source of truth to drift.
 *
 * 2. **Transform and opacity only, on a fixed layer.** The lamps never move in
 *    layout and never repaint — they translate. The layer is behind `<main>`, so it
 *    cannot cover content even if a rule below it changes.
 *
 * 3. **The resting state is authored in CSS.** `--atmos-p: 0.5` renders a real,
 *    balanced frame before JavaScript parses, under reduced motion, and after any
 *    context revert. Nothing here can strand the page dark — the failure mode is
 *    "the light stops travelling", never "the light goes out".
 */
export default function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const trigger = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            el.style.setProperty('--atmos-p', self.progress.toFixed(4))
          },
        })
        el.style.setProperty('--atmos-p', trigger.progress.toFixed(4))
        return () => {
          // Back to the authored mid-frame rather than wherever the scroll left it.
          el.style.removeProperty('--atmos-p')
        }
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} aria-hidden="true" className="atmos">
      <span className="atmos__lamp atmos__lamp--legacy" />
      <span className="atmos__lamp atmos__lamp--ai" />
      <span className="atmos__grain" />
    </div>
  )
}
