import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SmoothScroll from '@/components/SmoothScroll'
import { useReducedMotion, useInView } from '@/lib/hooks'
import { chapters, ERA_COLOR, type Chapter } from './chapters'
import { hasWebGL } from './webgl-detect'
import type { City as CityInstance } from './City'
import { journeyProjects } from './projects'
import type { LandmarkHover } from './landmarks'
import LandmarkCard from './LandmarkCard'

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

function BuiltHere({ chapterId, onHighlight }: { chapterId: string; onHighlight?: (id: string | null, anchor?: HTMLElement) => void }) {
  const items = journeyProjects.filter((p) => p.chapterId === chapterId)
  if (!items.length) return null
  return (
    <div className="journey-built">
      <h3 className="journey-built__title" id={`${chapterId}-built`}>
        Built in this chapter
      </h3>
      <ul aria-labelledby={`${chapterId}-built`} className="journey-built__list">
        {items.map((p) => (
          <li key={p.id}>
            <a
              href={p.href}
              className="journey-built__link"
              onFocus={(e) => onHighlight?.(p.id, e.currentTarget)}
              onBlur={() => onHighlight?.(null)}
            >
              <span className="journey-built__name">{p.name}</span>
              <span className="journey-built__sub">
                {p.client ? `${p.client} · ` : ''}
                {p.tagline}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
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
  onHighlight,
}: {
  chapter: Chapter
  index: number
  static?: boolean
  onHighlight?: (id: string | null, anchor?: HTMLElement) => void
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
        <BuiltHere chapterId={chapter.id} onHighlight={onHighlight} />
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

/** Resting CSS silhouette of the city. Static fallback shows it permanently; the
 *  3D scene shows it as the loading placeholder and fades it on the first frame. */
function Skyline() {
  return (
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
  )
}

/** Static, non-scrubbed skyline — used for prefers-reduced-motion and for
 *  browsers/contexts with no WebGL. Same chapters, same text, no canvas, no
 *  ScrollTrigger: the city is drawn once as a resting CSS silhouette. */
function JourneyStatic() {
  return (
    <div className="journey journey--static">
      <Skyline />
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
function JourneyScene({ onFail }: { onFail: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cityRef = useRef<CityInstance | null>(null)
  const [hover, setHover] = useState<LandmarkHover>({ id: null, x: 0, y: 0 })
  const [touch, setTouch] = useState(false)
  const [ready, setReady] = useState(false)
  const [chapterIdx, setChapterIdx] = useState(0)

  // Keyboard/SR path: focusing a "Built in this chapter" link lights its tower and,
  // on fine pointers only (the coarse sheet would steal focus), shows its card by the link.
  // The card is placed once, so any scroll dismisses it rather than leaving it stranded.
  const offScroll = useRef<() => void>(() => {})
  const onHighlight = useCallback((id: string | null, anchor?: HTMLElement) => {
    cityRef.current?.highlight(id)
    offScroll.current()
    if (!id || !anchor || window.matchMedia('(pointer: coarse)').matches) return setHover({ id: null, x: 0, y: 0 })
    const r = anchor.getBoundingClientRect()
    setHover({ id, x: r.right, y: r.top })
    const clear = () => setHover({ id: null, x: 0, y: 0 })
    window.addEventListener('scroll', clear, { once: true, passive: true })
    offScroll.current = () => window.removeEventListener('scroll', clear)
  }, [])

  useEffect(() => {
    let cancelled = false
    let trigger: ScrollTrigger | undefined
    let cleanupVisibility: (() => void) | undefined
    const canvas = canvasRef.current
    const onLost = (e: Event) => {
      e.preventDefault()
      onFail()
    }
    canvas?.addEventListener('webglcontextlost', onLost)

    import('./City').then(({ City }) => {
      if (cancelled || !canvasRef.current || !containerRef.current) return
      const city = new City(canvasRef.current)
      cityRef.current = city
      city.start()
      // Two frames: the first paints the city, the second is safe to cross-fade onto.
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setReady(true)))
      city.setLandmarks(journeyProjects.map(({ id, district }) => ({ id, district })))
      city.setLandmarkHandlers({
        onHover: setHover,
        onSelect: (id) => {
          const project = journeyProjects.find((p) => p.id === id)
          if (project) window.location.assign(project.href)
        },
      })

      trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: (self) => {
          city.setProgress(self.progress)
          setChapterIdx(Math.round(self.progress * (chapters.length - 1)))
        },
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
    }).catch(() => !cancelled && onFail()) // chunk 404 / offline / WebGL init throw -> static page

    return () => {
      cancelled = true
      canvas?.removeEventListener('webglcontextlost', onLost)
      cleanupVisibility?.()
      trigger?.kill()
      cityRef.current?.dispose()
      cityRef.current = null
      setHover({ id: null, x: 0, y: 0 })
    }
  }, [onFail])

  return (
    <div className={`journey journey--scene${ready ? ' is-ready' : ''}`}>
      <div ref={containerRef} className="journey-scroller" style={{ height: `${chapters.length * 100}vh` }}>
        <canvas
          ref={canvasRef}
          className="journey-canvas"
          aria-hidden="true"
          onPointerDown={(e) => setTouch(e.pointerType === 'touch')}
        />
        <Skyline />
        {chapters.map((chapter, i) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            index={i}
            onHighlight={onHighlight}
          />
        ))}
      </div>
      <p className="journey-sr" role="status" aria-live="polite">
        Chapter {chapterIdx + 1} of {chapters.length}: {chapters[chapterIdx].title}
      </p>
      <LandmarkCard
        project={journeyProjects.find((p) => p.id === hover.id) ?? null}
        x={hover.x}
        y={hover.y}
        hint={touch ? 'Tap again to open' : 'Click to open case study'}
        onDismiss={() => cityRef.current?.clearHover()}
      />
    </div>
  )
}

export default function JourneyApp() {
  const reduced = useReducedMotion()
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [failed, setFailed] = useState(false)
  const onFail = useCallback(() => setFailed(true), [])

  useEffect(() => {
    setWebgl(hasWebGL())
  }, [])

  // webgl === null is the one-tick SSR-safe "not yet checked" state — render
  // the static path until the check resolves so there is never a blank frame.
  const useScene = !reduced && webgl === true && !failed

  return (
    <SmoothScroll>
      <a href="#foundations" className="skip-link">
        Skip to chapter one
      </a>
      <header className="journey-header">
        <a href="/" className="journey-header__mark">
          JT
        </a>
        <h1 className="journey-header__title">Career journey — a skyline built from eleven years of work</h1>
      </header>
      <main id="main">{useScene ? <JourneyScene onFail={onFail} /> : <JourneyStatic />}</main>
    </SmoothScroll>
  )
}
