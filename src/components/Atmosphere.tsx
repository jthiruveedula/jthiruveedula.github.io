import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { getPointer, subscribePointer } from '@/lib/pointer'
import { flightScenes } from '@/data/flight'
import { COMPACT, MOTION_QUERY } from '@/lib/view'
import '@/styles/hero-track.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Rooms 02-07: the film's plates carried down the page, one behind each section
 *  (hero-track.css keys them off html[data-section]). The @sm URLs are the ones the
 *  arc tiles and flight already fetch, so this adds no image bytes. */
const ROOMS = flightScenes.slice(1).map((s) => ({ id: s.plate.slice(0, 2), src: `/scenes/${s.plate}@sm.avif` }))

/** Mount rooms once the visitor has left the hero (never on the hero's critical
 *  path), only at >= 768px (decoded plates are memory) and never in compact. */
function useRoomsMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (COMPACT) return
    const root = document.documentElement
    const check = () => {
      if ((root.dataset.section ?? 'top') === 'top' || !window.matchMedia('(min-width: 768px)').matches) return
      setMounted(true)
      observer.disconnect()
    }
    const observer = new MutationObserver(check)
    observer.observe(root, { attributes: true, attributeFilter: ['data-section'] })
    check()
    return () => observer.disconnect()
  }, [])
  return mounted
}

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
  const rooms = useRoomsMounted()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const mm = gsap.matchMedia()

      mm.add(MOTION_QUERY, () => {
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

        // TRACK: lamps drift up to 14px toward the cursor (x/y vars -> transform in
        // hero-track.css). Inactive on coarse pointers / reduced motion via pointer.ts.
        const DRIFT = 14
        const ease = { duration: 1.4, ease: 'power3.out' }
        const toX = gsap.quickTo(el, '--atmos-dx', ease)
        const toY = gsap.quickTo(el, '--atmos-dy', ease)
        const unsubscribe = subscribePointer(() => {
          const s = getPointer()
          toX(s.active ? s.x * DRIFT : 0)
          toY(s.active ? s.y * DRIFT : 0)
        })
        // TRACK: a torch under the cursor. Page torch (fixed blob) lights the gaps;
        // the hovered tile gets its own blob via --tx/--ty (translate only, CSS).
        const torch = el.querySelector<HTMLElement>('.atmos__torch')
        const torchX = torch ? gsap.quickTo(torch, 'x', { duration: 0.6, ease: 'power3.out' }) : null
        const torchY = torch ? gsap.quickTo(torch, 'y', { duration: 0.6, ease: 'power3.out' }) : null
        const BLOB = 420
        let card: HTMLElement | null = null
        const unTorch = subscribePointer((s) => {
          const px = ((s.x + 1) / 2) * window.innerWidth
          const py = ((s.y + 1) / 2) * window.innerHeight
          if (torch) {
            torch.style.opacity = s.active ? '1' : '0'
            torchX?.(px - BLOB / 2)
            torchY?.(py - BLOB / 2)
          }
          const next = s.active
            ? document.elementFromPoint(px, py)?.closest<HTMLElement>('.lit-card') ?? null
            : null
          if (next !== card) {
            card?.style.removeProperty('--tl')
            card = next
          }
          if (card) {
            const r = card.getBoundingClientRect()
            card.style.setProperty('--tx', `${px - r.left - BLOB / 2}px`)
            card.style.setProperty('--ty', `${py - r.top - BLOB / 2}px`)
            card.style.setProperty('--tl', '1')
          }
        })
        return () => {
          unTorch()
          card?.style.removeProperty('--tl')
          unsubscribe()
          gsap.killTweensOf(el, '--atmos-dx,--atmos-dy')
          el.style.removeProperty('--atmos-dx')
          el.style.removeProperty('--atmos-dy')
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
      {rooms &&
        ROOMS.map((r) => (
          <img key={r.id} className="atmos__room" data-room={r.id} src={r.src} alt="" decoding="async" draggable={false} />
        ))}
      <span className="atmos__lamp atmos__lamp--legacy" />
      <span className="atmos__lamp atmos__lamp--ai" />
      <span className="atmos__torch" />
      <span className="atmos__grain" />
    </div>
  )
}
