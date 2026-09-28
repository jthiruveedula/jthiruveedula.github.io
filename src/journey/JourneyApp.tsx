import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SmoothScroll from '@/components/SmoothScroll'
import { useReducedMotion, useInView } from '@/lib/hooks'
import { chapters, ERA_COLOR, type Chapter } from './chapters'
import { hasWebGL } from './webgl-detect'
import type { City as CityInstance } from './City'

gsap.registerPlugin(ScrollTrigger)

const LINKEDIN_URL = 'https://linkedin.com/in/jagadeesh-thiruveedula'

function ChapterMetrics({ chapter }: { chapter: Chapter }) {
  return (
    <dl className="journey-metrics">
      {chapter.metrics.map((m) => (
        <div key={m.label} className="journey-metric">
          <dt>{m.label}</dt>
          <dd style={{ color: ERA_COLOR[chapter.era] }}>{m.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** One chapter's real, always-present text. In the scrubbed scene it fades in
 *  via `useInView` as the camera approaches; in the static fallback (`static`)
 *  it renders fully opaque with no observer and no transition at all — the two
 *  callers below choose which. Either way it never leaves the accessibility
 *  tree and never hides with `visibility`/`display`: a screen reader or a
 *  keyboard tab order reads every chapter regardless of scroll position. */
function ChapterSection({
  chapter,
  index,
  static: isStatic = false,
}: {
  chapter: Chapter
  index: number
  static?: boolean
}) {
  const [ref, inView] = useInView<HTMLElement>('-30% 0px -30% 0px')
  const active = isStatic || inView
  return (
    <section
      ref={isStatic ? undefined : ref}
      id={chapter.id}
      className={`journey-chapter${active ? ' is-active' : ''}`}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className="journey-chapter__panel">
        <p className="journey-chapter__eyebrow">
          {String(index + 1).padStart(2, '0')} · {chapter.years}
        </p>
        <h2 id={`${chapter.id}-title`} className="journey-chapter__title">
          {chapter.title}
        </h2>
        <p className="journey-chapter__roles">{chapter.roles}</p>
        <p className="journey-chapter__body">{chapter.body}</p>
        <ChapterMetrics chapter={chapter} />
        {index === chapters.length - 1 && (
          <div className="journey-cta">
            <a href="mailto:jagadeeshthiruveedula77@gmail.com" className="chip chip--primary">
              Get in touch
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="chip">
              LinkedIn
            </a>
            <a href="/" className="chip">
              Back to portfolio
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

/** Static, non-scrubbed skyline — used for prefers-reduced-motion and for
 *  browsers/contexts with no WebGL. Same chapters, same text, no canvas, no
 *  ScrollTrigger: the city is drawn once as a resting CSS silhouette. */
function JourneyStatic() {
  return (
    <div className="journey journey--static">
      <div className="journey-skyline" aria-hidden="true">
        {chapters.map((chapter, i) => (
          <div
            key={chapter.id}
            className="journey-skyline__district"
            style={{ ['--district-color' as string]: ERA_COLOR[chapter.era] }}
          >
            {Array.from({ length: 6 }).map((_, b) => (
              <span
                key={b}
                className="journey-skyline__building"
                style={{ height: `${18 + ((b * 7 + i * 11) % 55)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="journey-static__chapters">
        {chapters.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={i} static />
        ))}
      </div>
    </div>
  )
}

/** The scrubbed 3D experience — mounted only when motion is allowed and WebGL
 *  is available. Owns the ScrollTrigger that drives the camera and the
 *  IntersectionObserver-driven pause when the canvas leaves the viewport or
 *  the tab is hidden. */
function JourneyScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cityRef = useRef<CityInstance | null>(null)

  useEffect(() => {
    let cancelled = false
    let trigger: ScrollTrigger | undefined
    let cleanupVisibility: (() => void) | undefined

    import('./City').then(({ City }) => {
      if (cancelled || !canvasRef.current || !containerRef.current) return
      const city = new City(canvasRef.current)
      cityRef.current = city
      city.start()

      trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: (self) => city.setProgress(self.progress),
      })

      const onVisibility = () => (document.hidden ? city.pause() : city.start())
      document.addEventListener('visibilitychange', onVisibility)
      const io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? city.start() : city.pause()),
        { threshold: 0 },
      )
      io.observe(canvasRef.current)
      cleanupVisibility = () => {
        document.removeEventListener('visibilitychange', onVisibility)
        io.disconnect()
      }
    })

    return () => {
      cancelled = true
      cleanupVisibility?.()
      trigger?.kill()
      cityRef.current?.dispose()
      cityRef.current = null
    }
  }, [])

  return (
    <div className="journey journey--scene">
      <div ref={containerRef} className="journey-scroller" style={{ height: `${chapters.length * 100}vh` }}>
        <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
        {chapters.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={i} />
        ))}
      </div>
    </div>
  )
}

export default function JourneyApp() {
  const reduced = useReducedMotion()
  const [webgl, setWebgl] = useState<boolean | null>(null)

  useEffect(() => {
    setWebgl(hasWebGL())
  }, [])

  // webgl === null is the one-tick SSR-safe "not yet checked" state — render
  // the static path until the check resolves so there is never a blank frame.
  const useScene = !reduced && webgl === true

  return (
    <SmoothScroll>
      <a href="#foundations" className="skip-link">
        Skip to chapter one
      </a>
      <header className="journey-header">
        <a href="/" className="journey-header__mark">
          JT
        </a>
        <p className="journey-header__title">Career journey — a skyline built from eleven years of work</p>
      </header>
      <main id="main">{useScene ? <JourneyScene /> : <JourneyStatic />}</main>
    </SmoothScroll>
  )
}
