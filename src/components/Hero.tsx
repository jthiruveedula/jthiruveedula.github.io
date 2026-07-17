import { lazy, Suspense, useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { ERA_COLORS } from '@/data/types'
import { useInView, useIsMobile, useReducedMotion, useWebGLSupport } from '@/lib/hooks'
import MotionButton from '@/components/MotionButton'
import ErrorBoundary from '@/components/ErrorBoundary'

// The three.js chunk is heavy — lazy-load the scene so the headline paints first.
const HeroScene = lazy(() => import('@/scenes/HeroScene'))

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Headline microcopy; era words pick up the same color code as the 3D clusters. */
const H1_WORDS = ['Architecting', 'what', 'lasts', '—', 'From', 'Legacy', 'to', 'Cloud', 'to', 'AI']
const H1_ERA_WORDS: Record<string, string> = {
  Legacy: ERA_COLORS.legacy,
  Cloud: ERA_COLORS.cloud,
  AI: ERA_COLORS.ai,
}

/** 2D fallback when WebGL is unavailable: three era node groups + migration links. */
function FallbackNodes() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full opacity-60"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#1e2a45" strokeWidth="1">
        <path d="M150 200 C 280 120, 380 120, 400 190" fill="none" />
        <path d="M400 190 C 480 260, 560 240, 650 180" fill="none" />
      </g>
      {/* legacy grid */}
      <g fill={ERA_COLORS.legacy}>
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`l-${r}-${c}`} x={110 + c * 26} y={160 + r * 26} width="12" height="12" opacity="0.7" />
          )),
        )}
      </g>
      {/* cloud swarm */}
      <g fill={ERA_COLORS.cloud}>
        {[
          [380, 170, 5],
          [405, 195, 7],
          [430, 175, 4],
          [395, 220, 5],
          [365, 200, 4],
          [425, 215, 3],
        ].map(([cx, cy, r]) => (
          <circle key={`c-${cx}-${cy}`} cx={cx} cy={cy} r={r} opacity="0.75" className="animate-pulse-slow" />
        ))}
      </g>
      {/* AI constellation */}
      <g fill={ERA_COLORS.ai} stroke={ERA_COLORS.ai} strokeOpacity="0.35">
        <line x1="620" y1="150" x2="665" y2="185" />
        <line x1="665" y1="185" x2="640" y2="225" />
        <line x1="665" y1="185" x2="700" y2="160" />
        {[
          [620, 150, 5],
          [665, 185, 7],
          [640, 225, 4],
          [700, 160, 4],
        ].map(([cx, cy, r]) => (
          <circle key={`a-${cx}-${cy}`} cx={cx} cy={cy} r={r} opacity="0.85" className="animate-pulse-slow" />
        ))}
      </g>
    </svg>
  )
}

export default function Hero({ introDone = false }: { introDone?: boolean }) {
  const reducedMotion = useReducedMotion()
  const webgl = useWebGLSupport()
  const isMobile = useIsMobile()
  const [sectionRef, inView] = useInView<HTMLElement>()

  /** Normalized pointer, read by the 3D scene every frame (no React re-renders). */
  const pointerRef = useRef({ x: 0, y: 0 })
  /** Intro convergence progress for the mindscape — tweened by GSAP below. */
  const introRef = useRef({ p: reducedMotion ? 1 : 0 })
  /** Scroll progress through the hero — scrubbed by ScrollTrigger, read per frame. */
  const emphasisRef = useRef({ e: 0 })
  const sceneWrapRef = useRef<HTMLDivElement>(null)
  /** Hero copy block — gets a subtle cursor-reactive 3D tilt (HyperFrames signature). */
  const copyRef = useRef<HTMLDivElement>(null)
  /** Spring-backed tilt setters, created inside useGSAP and reused by the pointer handler. */
  const tiltRef = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null)

  useEffect(() => {
    if (reducedMotion) introRef.current.p = 1
  }, [reducedMotion])

  const { profile } = portfolio

  const hudLine = useMemo(() => {
    const role = profile.title.split('|')[0]?.trim() || 'Data & AI Architect'
    const years = portfolio.headlineMetrics.find((m) => m.label === 'Years across data & AI')?.value
    return years ? `${role} · ${years} yrs` : role
  }, [profile.title])

  const summaryLead = useMemo(
    () =>
      'I architect, build, and ship production data & AI systems — then make them defensible with evaluation, guardrails, and governance. Eleven years across Fortune 500 migrations, streaming, and enterprise GenAI.',
    [],
  )

  /** Hard-proof ribbon — the first-screen authority the brief demands (3–5s). */
  const proofStats = useMemo(() => {
    const need = [
      'Cost savings delivered',
      'Cloud migrations orchestrated',
      'Documents in production RAG',
      'Grounded RAG accuracy',
    ]
    return need
      .map((label) => portfolio.headlineMetrics.find((m) => m.label === label))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .map((m) => {
        const numeric = m.numeric ?? 0
        const prefix = m.prefix ?? ''
        const suffix = m.suffix ?? ''
        const decimals = Number.isInteger(numeric) ? 0 : 1
        return {
          label: m.label,
          target: numeric,
          prefix,
          suffix,
          decimals,
          display: `${prefix}${numeric}${suffix}`,
        }
      })
  }, [])

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>('.split-word')
      const reveals = gsap.utils.toArray<HTMLElement>('[data-hero-reveal]')
      const cue = gsap.utils.toArray<HTMLElement>('[data-hero-cue]')

      if (reducedMotion) {
        // No entrance choreography — content is already in its final, readable state.
        introRef.current.p = 1
        return
      }

      // Hide entrance elements immediately (pre-paint) so nothing flashes behind the
      // loading intro; the reveal is played once the intro hands off control.
      gsap.set(words, {
        yPercent: 120,
        autoAlpha: 0,
        rotateX: -88,
        transformOrigin: '50% 100%',
        filter: 'blur(10px)',
      })
      gsap.set(reveals, { y: 24, autoAlpha: 0 })

      // Scroll shifts cluster emphasis legacy → AI while the hero scrolls out.
      // Independent of the intro, so it works whether or not motion is reduced.
      if (!reducedMotion) {
        gsap.to(emphasisRef.current, {
          e: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })

        // The 3D canvas gently recedes + fades as the visitor leaves the hero.
        const wrap = sceneWrapRef.current
        if (wrap) {
          gsap.fromTo(
            wrap,
            { opacity: 1, scale: 1, y: 0 },
            {
              opacity: 0.25,
              scale: 0.92,
              y: -40,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )
        }
      }

      // Cursor-reactive 3D tilt on the hero copy — spring-backed, subtle (max ~4deg).
      if (copyRef.current) {
        tiltRef.current = {
          x: gsap.quickTo(copyRef.current, 'rotationY', { duration: 0.6, ease: 'power3' }),
          y: gsap.quickTo(copyRef.current, 'rotationX', { duration: 0.6, ease: 'power3' }),
        }
      }

      // Entrance choreography — runs once the loading intro signals completion.
      const playIntro = () => {
        if (reducedMotion) return
        const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } })

        // 3D intro: scattered burst → data mindscape (read by HeroScene's frame loop).
        tl.to(introRef.current, { p: 1, duration: 2.4, ease: 'power2.inOut' }, 0)

        // Word-by-word headline reveal — 3D flip-up from a clipped horizon + de-blur.
        tl.to(
          words,
          {
            yPercent: 0,
            autoAlpha: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            stagger: 0.07,
            duration: 1.0,
            ease: 'power4.out',
          },
          0.35,
        )
        tl.to(reveals, { y: 0, autoAlpha: 1, stagger: 0.06 }, 0.55)

        // Cinematic count-up on the proof ribbon — evidence over adjectives.
        gsap.utils.toArray<HTMLElement>('.hero-stat-value').forEach((el, i) => {
          const target = Number(el.dataset.target)
          const decimals = Number(el.dataset.decimals) || 0
          const prefix = el.dataset.prefix ?? ''
          const suffix = el.dataset.suffix ?? ''
          const proxy = { v: 0 }
          el.textContent = `${prefix}${(0).toFixed(decimals)}${suffix}`
          tl.to(
            proxy,
            {
              v: target,
              duration: 1.3,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = `${prefix}${proxy.v.toFixed(decimals)}${suffix}`
              },
            },
            0.7 + i * 0.08,
          )
        })

        // Idle scroll-hint chevron bob.
        gsap.to(cue, { y: 6, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2.2 })
      }

      if (introDone) playIntro()
    },
    { scope: sectionRef, dependencies: [reducedMotion, introDone], revertOnUpdate: true },
  )

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion) return
    pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
    pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1
    if (tiltRef.current) {
      tiltRef.current.x(pointerRef.current.x * 4)
      tiltRef.current.y(-pointerRef.current.y * 4)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      onPointerMove={handlePointerMove}
      className="relative isolate flex min-h-dvh scroll-mt-24 items-center overflow-hidden bg-void"
    >
      {/* Layered era glows — ambient behind the canvas, primary backdrop without WebGL. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: [
            `radial-gradient(38rem 24rem at 14% 62%, ${ERA_COLORS.legacy}17, transparent 65%)`,
            `radial-gradient(46rem 28rem at 50% 42%, ${ERA_COLORS.cloud}1a, transparent 65%)`,
            `radial-gradient(40rem 26rem at 86% 34%, ${ERA_COLORS.ai}1c, transparent 65%)`,
          ].join(', '),
        }}
      />

      {webgl && !reducedMotion ? (
        <div ref={sceneWrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 will-change-transform">
          <Suspense fallback={null}>
            <ErrorBoundary label="hero-scene" fallback={<FallbackNodes />}>
              <HeroScene
                active={inView}
                reducedMotion={reducedMotion}
                isMobile={isMobile}
                pointerRef={pointerRef}
                introRef={introRef}
                emphasisRef={emphasisRef}
              />
            </ErrorBoundary>
          </Suspense>
        </div>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <FallbackNodes />
        </div>
      )}

      {/* Symmetric legibility scrim — darkens edges evenly so content + mindscape both read across the full width. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-[5]"
        style={{
          background:
            'radial-gradient(ellipse 62% 55% at 50% 50%, transparent 32%, rgba(5,8,16,0.42) 72%, rgba(5,8,16,0.82) 100%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-[5] h-40 bg-gradient-to-b from-transparent to-void" />

      <div
        ref={copyRef}
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
        className="relative mx-auto w-full max-w-6xl px-6 py-28 sm:px-10"
      >
        {/* Breathing aura behind the headline — gives the copy a living, lit feel. */}
        <div aria-hidden="true" className="hero-aura pointer-events-none absolute -top-6 left-0 -z-10 h-72 w-full" />
        <p data-hero-reveal className="hud-label flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          <span>{profile.name}</span>
          <span aria-hidden="true" className="text-ink-faint">
            /
          </span>
          <span>{hudLine}</span>
        </p>

        <h1
          style={{ perspective: 900 }}
          className="mt-6 mx-auto max-w-5xl text-center font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-7xl"
        >
          {H1_WORDS.map((word, i) => (
            <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
              <span
                className="split-word inline-block"
                style={word in H1_ERA_WORDS ? { color: H1_ERA_WORDS[word] } : undefined}
              >
                {word}
              </span>
              {i < H1_WORDS.length - 1 && '\u00A0'}
            </span>
          ))}
        </h1>

        <p data-hero-reveal className="mt-6 mx-auto max-w-2xl text-center text-base leading-relaxed text-ink-muted sm:text-lg">
          {summaryLead}
        </p>

        <div data-hero-reveal className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <MotionButton
            as="a"
            href="#timeline"
            cursorLabel="Explore"
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-accent px-6 py-3 font-display text-sm font-semibold text-void transition-colors hover:bg-accent-soft"
          >
            Explore the story
          </MotionButton>
          <MotionButton
            as="a"
            href="#contact"
            cursorLabel="Contact"
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-panel-edge px-6 py-3 font-display text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Get in touch
          </MotionButton>
        </div>

        <dl data-hero-reveal className="mt-10 mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 border-t border-panel-edge/70 pt-6 sm:grid-cols-4">
          {proofStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <dt className="order-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                {stat.label}
              </dt>
              <dd
                className="hero-stat-value order-1 font-display text-2xl font-semibold text-ink tabular-nums sm:text-3xl"
                data-target={stat.target}
                data-decimals={stat.decimals}
                data-prefix={stat.prefix}
                data-suffix={stat.suffix}
              >
                {stat.display}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Scroll hint */}
      <div aria-hidden="true" className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div data-hero-reveal className="flex flex-col items-center gap-2 text-accent">
          <span className="hud-label text-[10px] tracking-[0.3em]">scroll</span>
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="scroll-cue__ring absolute inset-0 rounded-full border border-accent/60" />
            <svg
              data-hero-cue
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="scroll-cue__chevron h-5 w-5"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>

      {/* Origin badge — marks the story's start, anchored to the hero (not the
          viewport) so it can never snap to the page corner. Sits near the
          right-side timeline rail. Decorative; the rail itself is the real marker. */}
      <div className="origin-container" aria-hidden="true">
        <span className="origin-label">ORIGIN</span>
      </div>
    </section>
  )
}
