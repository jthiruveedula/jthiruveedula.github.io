import { lazy, Suspense, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { worldScenes } from '@/data/scenes'
import { useInView, useIsMobile, useReducedMotion, useWebGLSupport } from '@/lib/hooks'
import ErrorBoundary from '@/components/ErrorBoundary'

const WorldScene = lazy(() => import('@/scenes/WorldScene'))

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Viewport-heights of scroll spent per station. Higher = longer dwell. */
const SCROLL_PER_SCENE = 1.15

/**
 * The scroll-world hero: one camera flight through seven stations of the résumé.
 *
 * The scene is a `position: sticky` viewport inside a tall section — no GSAP pin,
 * so there is no pin-spacer to fight with Lenis and no layout jump when a mobile
 * URL bar collapses (`100svh`, not `dvh`). ScrollTrigger only maps scroll position
 * onto `progressRef`; the WebGL camera and the DOM copy both read that single ref
 * on the GSAP ticker, so they can never drift apart and reverse scrolling is exact.
 *
 * Without WebGL, or under `prefers-reduced-motion`, the flight degrades to the same
 * seven scenes as ordinary stacked sections with the stills as backdrops. The copy
 * is real DOM in both paths, so it stays crawlable and screen-reader navigable.
 */
export default function ScrollWorld({ introDone = false }: { introDone?: boolean }) {
  const reducedMotion = useReducedMotion()
  const webgl = useWebGLSupport()
  const isMobile = useIsMobile()
  const [sectionRef, inView] = useInView<HTMLElement>('300px')

  const progressRef = useRef({ p: 0 })
  const copyRefs = useRef<(HTMLDivElement | null)[]>([])
  const railRefs = useRef<(HTMLButtonElement | null)[]>([])
  const railFillRef = useRef<HTMLSpanElement>(null)
  const immersive = webgl && !reducedMotion

  useGSAP(
    () => {
      if (!immersive) return

      const section = sectionRef.current
      if (!section) return

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          // Clamped by ScrollTrigger, so iOS momentum overshoot cannot push the
          // camera past either end of the flight.
          progressRef.current.p = Math.min(1, Math.max(0, self.progress))
        },
      })

      // One ticker callback drives every DOM overlay from the same progress value
      // the camera reads — no per-frame React renders, no second source of truth.
      // Only the one or two blocks near the camera are ever touched: writing all
      // seven every frame forced a style recalc per frame for elements that were
      // sitting at opacity 0 and not moving, which cost real milliseconds on mobile.
      const applied = worldScenes.map(() => ({ opacity: -1, active: '' }))
      let appliedFill = -1

      const paint = () => {
        const progress = progressRef.current.p
        const t = progress * (worldScenes.length - 1)

        // Rail fill tracks the camera; the accent follows the current era so the whole
        // chrome shifts amber → cyan → violet along with the world.
        const fill = railFillRef.current
        if (fill && Math.abs(progress - appliedFill) > 0.001) {
          const track = (fill.parentElement?.clientHeight ?? 0) - 8
          fill.style.height = `${Math.max(0, track * progress)}px`
          fill.style.backgroundColor = worldScenes[Math.round(t)].accent
          appliedFill = progress
        }

        worldScenes.forEach((_, i) => {
          const el = copyRefs.current[i]
          const distance = Math.abs(i - t)
          const state = applied[i]

          if (el) {
            // Steeper than the quad crossfade on purpose: two half-visible copy
            // blocks ghost over each other and neither is readable, so text clears
            // out entirely between stations and the imagery carries the transition.
            const visible = Math.min(1, Math.max(0, 1 - distance * 2.1))
            const eased = visible * visible * (3 - 2 * visible)
            // Skip the write when this block is parked at zero and stays there.
            if (eased > 0.0005 || state.opacity > 0.0005) {
              const offset = i - t
              el.style.opacity = String(eased)
              // Counter-parallax: copy slides against the camera's travel, so the text
              // and the world read as separate planes rather than one flat picture.
              el.style.transform = `translate3d(${offset * -14}px, ${offset * 34}px, 0)`
              el.style.filter = eased > 0.85 ? 'none' : `blur(${(1 - eased) * 5}px)`
              el.style.pointerEvents = eased > 0.72 ? 'auto' : 'none'
              el.setAttribute('aria-hidden', eased > 0.4 ? 'false' : 'true')
              state.opacity = eased
            }
          }

          const dot = railRefs.current[i]
          const active = distance < 0.5 ? 'true' : 'false'
          if (dot && state.active !== active) {
            dot.dataset.active = active
            state.active = active
          }
        })
      }

      paint()
      gsap.ticker.add(paint)

      // Entrance handoff from the loading intro — staggers the first station's copy
      // in. Runs on the copy's children so it never fights `paint`, which owns the
      // container's own opacity and transform.
      if (introDone) {
        const first = copyRefs.current[0]?.firstElementChild
        if (first) {
          gsap.from(Array.from(first.children), {
            y: 26,
            autoAlpha: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.07,
          })
        }
      }

      return () => {
        gsap.ticker.remove(paint)
        trigger.kill()
      }
    },
    { scope: sectionRef, dependencies: [immersive, introDone], revertOnUpdate: true },
  )

  const scrollToScene = (index: number) => {
    const section = sectionRef.current
    if (!section) return
    const span = section.offsetHeight - window.innerHeight
    const target = section.offsetTop + (span * index) / (worldScenes.length - 1)
    window.scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  // Static path — WebGL unavailable or motion reduced. Same content, no camera.
  if (!immersive) {
    return (
      <section ref={sectionRef} id="hero" aria-label="Introduction" className="relative bg-void">
        {worldScenes.map((scene, i) => (
          <article
            key={scene.id}
            id={`world-${scene.id}`}
            data-station={i}
            className="relative isolate flex min-h-[86svh] overflow-hidden border-b border-panel-edge/40"
          >
            <img
              src={scene.stillMobile}
              srcSet={`${scene.stillMobile} 1280w, ${scene.still} 2048w`}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-[5]"
              style={{
                background:
                  'linear-gradient(to top, rgba(5,8,16,0.95) 0%, rgba(5,8,16,0.72) 38%, rgba(5,8,16,0.25) 100%)',
              }}
            />
            <SceneCopy scene={scene} index={i} />
          </article>
        ))}
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      className="relative bg-void"
      style={{ height: `${worldScenes.length * SCROLL_PER_SCENE * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0">
          <Suspense fallback={null}>
            <ErrorBoundary label="scroll-world">
              <WorldScene progressRef={progressRef} active={inView} isMobile={isMobile} />
            </ErrorBoundary>
          </Suspense>
        </div>

        {/* Two-part scrim instead of one heavy full-width wash. A light floor keeps the
            bottom edge from clipping, and a left-side falloff carries the copy column —
            so legibility is bought locally and the right two-thirds of every scene stays
            open, which is where the imagery and the sense of motion actually live. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'linear-gradient(to top, rgba(5,8,16,0.82) 0%, rgba(5,8,16,0.42) 24%, rgba(5,8,16,0) 50%)',
              'linear-gradient(to right, rgba(5,8,16,0.86) 0%, rgba(5,8,16,0.62) 24%, rgba(5,8,16,0.2) 44%, rgba(5,8,16,0) 60%)',
            ].join(', '),
          }}
        />

        {/* Copy stack — every scene's text is in the DOM at all times; the ticker
            only changes opacity/transform, so nothing is hidden from crawlers. */}
        <div className="absolute inset-0">
          {worldScenes.map((scene, i) => (
            <div
              key={scene.id}
              ref={(el) => {
                copyRefs.current[i] = el
              }}
              data-station={i}
              className="absolute inset-0 will-change-transform"
              style={{ opacity: i === 0 ? 1 : 0, paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <SceneCopy scene={scene} index={i} />
            </div>
          ))}
        </div>

        {/* Station rail — a track that fills as the camera advances, so the flight has a
            visible position and length rather than being an unmeasurable scroll. */}
        <nav
          aria-label="Scene navigation"
          className="absolute left-4 top-1/2 hidden -translate-y-1/2 sm:block"
        >
          <div className="relative flex flex-col gap-3.5 pl-3">
            <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-px bg-panel-edge" />
            <span
              ref={railFillRef}
              aria-hidden="true"
              className="absolute left-0 top-1 w-px origin-top bg-accent"
              style={{ height: 0, transition: 'background-color 400ms linear' }}
            />
            {worldScenes.map((scene, i) => (
              <button
                key={scene.id}
                ref={(el) => {
                  railRefs.current[i] = el
                }}
                type="button"
                onClick={() => scrollToScene(i)}
                data-active="false"
                aria-label={`Fly to ${scene.label}`}
                className="group flex items-center gap-2.5 text-left"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full opacity-40 transition-all duration-300 group-hover:opacity-80 group-data-[active=true]:h-2 group-data-[active=true]:w-2 group-data-[active=true]:opacity-100"
                  style={{ background: scene.accent }}
                />
                {/* Label on hover only — the active station already names itself in the
                    copy column, so showing it here too just repeats. */}
                <span className="hud-label text-[9px] opacity-0 transition-opacity duration-300 group-hover:opacity-80">
                  {scene.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </section>
  )
}

/**
 * One station's copy: a contained column rather than a full-bleed block.
 *
 * The stills are all composed with their subject centre-frame or right-of-centre and
 * negative space toward the lower left, so the text lives in a measured column there —
 * an accent rule marks it, a station counter gives the flight a sense of position, and
 * the whole thing stays clear of the imagery it is describing.
 */
/** Guarantees local contrast wherever a headline crosses a bright part of a scene. */
const INK_SHADOW = '0 1px 2px rgba(5,8,16,0.9), 0 2px 18px rgba(5,8,16,0.75)'

function SceneCopy({ scene, index }: { scene: (typeof worldScenes)[number]; index: number }) {
  const isOpening = index === 0
  const Heading = isOpening ? 'h1' : 'h2'
  const total = String(worldScenes.length).padStart(2, '0')
  const current = String(index + 1).padStart(2, '0')

  return (
    <div className="flex h-full w-full flex-col">
      {/* Headline column — vertically centred on desktop so the frame reads as a
          composition rather than a caption stuck to the bottom edge. On phones the
          still occupies the top band, so the column sits under it instead. */}
      <div className="flex flex-1 items-end px-6 pt-20 pb-5 sm:items-center sm:px-10 sm:pt-0 sm:pb-0">
        {/* Centred up to ~1800px, then left-anchored. The scene's subject is centred in
            the viewport, so on an ultrawide monitor a centred text column drifts right
            into the bright middle of the frame and its line-ends wash out. */}
        <div className="mx-auto w-full max-w-6xl min-[1800px]:mx-0">
          <div className="max-w-[33rem] border-l-2 pl-5 sm:pl-6" style={{ borderColor: scene.accent }}>
            {/* Station counter — the flight's "you are here". */}
            <span className="font-mono text-[11px] tabular-nums" style={{ color: scene.accent }}>
              {current}
              <span className="text-ink-faint">/{total}</span>
            </span>

            <p className="mt-3 hud-label text-[10px] leading-relaxed" style={{ color: scene.accent }}>
              {scene.eyebrow}
            </p>

            <Heading
              className="mt-2.5 font-display text-[1.7rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[2.7rem]"
              style={{ textShadow: INK_SHADOW }}
            >
              {scene.lead ?? scene.title}
            </Heading>

            {/* When a station carries a `lead`, its narrative line becomes the subhead
                directly under the role — still prominent, no longer the first thing read. */}
            {scene.lead && (
              <p
                className="mt-2 font-display text-base leading-snug text-ink/90 sm:text-xl"
                style={{ textShadow: INK_SHADOW }}
              >
                {scene.title}
              </p>
            )}

            {/* Narrower than the headline: body text is small and muted, so it has to
                stay inside the darker part of the scrim to hold contrast. */}
            <p
              className="mt-3.5 max-w-[27rem] text-[0.9rem] leading-relaxed text-ink-muted"
              style={{ textShadow: INK_SHADOW }}
            >
              {scene.body}
            </p>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {scene.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-panel-edge/60 bg-void/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>

            {scene.cta && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href={scene.cta.href}
                  // The opening station's action is outlined rather than filled: it exists
                  // so intent can convert immediately, without stealing the emphasis that
                  // belongs to the closing station's CTA.
                  className={
                    isOpening
                      ? 'inline-flex min-h-11 items-center rounded-md border border-accent/60 px-5 py-2.5 font-display text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/10'
                      : 'inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-3 font-display text-sm font-semibold text-void transition-colors hover:bg-accent-soft'
                  }
                >
                  {scene.cta.label}
                </a>
                <a
                  href={scene.cta.secondaryHref}
                  // min-h-11 so the secondary action is a real target too — as a bare
                  // inline link it measured 16px tall next to a 44px primary button.
                  className="inline-flex min-h-11 items-center font-mono text-xs text-ink-muted underline decoration-panel-edge underline-offset-4 transition-colors hover:text-accent"
                >
                  {scene.cta.secondaryLabel}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry strip — the numbers get their own instrument panel across the base
          instead of stacking under the prose, which keeps the middle of the frame open
          for the scene and gives the metrics somewhere consistent to live. */}
      {/* Extra bottom padding on phones and right padding on desktop keep the readout
          clear of the floating audio toggle in both layouts. */}
      <div className="border-t border-panel-edge/50 bg-void/55 px-6 pt-3 pb-12 sm:px-10 sm:pr-44 sm:pt-3 sm:pb-3">
        {/* Phones stack each value over its label in two columns; wider viewports read
            them as one inline instrument row. */}
        <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-7 sm:gap-y-1.5">
          {scene.metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <dd
                className="font-display text-base font-semibold leading-none tabular-nums sm:text-lg"
                style={{ color: scene.accent }}
              >
                {metric.value}
              </dd>
              <dt className="mt-1 hud-label text-[9px] leading-snug text-ink-faint sm:mt-0 sm:leading-none">
                {metric.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
