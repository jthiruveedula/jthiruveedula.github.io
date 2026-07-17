import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { Era, FeaturedProject, ProjectVizType } from '@/data/types'
import { ERA_COLORS } from '@/data/types'
import { useInView, useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/* Structural strokes mirroring globals.css tokens (SVG needs raw values). */
const EDGE = '#1e2a45'
const FAINT = '#5b6780'
const RETURN_DOT = '#8b98b3'

interface EraMeta {
  label: string
  text: string
  chip: string
  topBorder: string
  afterBorder: string
  glow: string
}

const ERA_META: Record<Era, EraMeta> = {
  legacy: {
    label: 'Legacy era',
    text: 'text-legacy',
    chip: 'border-legacy/40 bg-legacy/10 text-legacy',
    topBorder: 'border-t-legacy/70',
    afterBorder: 'border-legacy/70',
    glow: 'hover:shadow-glow-legacy',
  },
  cloud: {
    label: 'Cloud era',
    text: 'text-cloud',
    chip: 'border-cloud/40 bg-cloud/10 text-cloud',
    topBorder: 'border-t-cloud/70',
    afterBorder: 'border-cloud/70',
    glow: 'hover:shadow-glow-cloud',
  },
  ai: {
    label: 'Enterprise AI era',
    text: 'text-ai',
    chip: 'border-ai/40 bg-ai/10 text-ai',
    topBorder: 'border-t-ai/70',
    afterBorder: 'border-ai/70',
    glow: 'hover:shadow-glow-ai',
  },
}

interface MetricParts {
  prefix: string
  target: number
  decimals: number
  suffix: string
}

/** Split "$1M+" / "99.95%" / "<30 min" into count-up parts. */
function splitMetricValue(value: string): MetricParts | null {
  const match = /^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/.exec(value)
  if (!match) return null
  const [, prefix, num, suffix] = match
  const decimals = num.includes('.') ? num.split('.')[1].length : 0
  return { prefix, target: Number(num), decimals, suffix }
}

function CloudOutline({ x, y, scale = 1, stroke }: { x: number; y: number; scale?: number; stroke: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M12 37c-6.6 0-12-5.4-12-12 0-5.6 3.9-10.3 9.1-11.6C10.6 5.7 16.3 0 23.4 0c7.3 0 13.3 5.9 13.6 13.2 4.5 1 7.9 5 7.9 9.9 0 5.6-4.5 10.2-10.1 10.2H12z"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
    />
  )
}

const COBOL_GLYPHS = ['PERFORM', 'MOVE WS-AMT', 'COMPUTE', 'GO TO 100-CALC']
const SQL_GLYPHS = ['SELECT', 'MERGE INTO', 'PARTITION BY', 'CREATE TABLE']

const RAG_DOCS = [
  { x: 28, y: 36 },
  { x: 76, y: 88 },
  { x: 36, y: 150 },
  { x: 96, y: 198 },
  { x: 148, y: 56 },
  { x: 156, y: 158 },
]

/**
 * Decorative background motif per vizType. Elements with `.viz-flow` travel by
 * data-dx/data-dy in the card's loop timeline; `.viz-pulse` breathes;
 * `.viz-glyph-a/b` crossfade. Static (initial markup) state is meaningful for
 * reduced-motion users.
 */
function VizMotif({ type, accent }: { type: ProjectVizType; accent: string }) {
  const svgProps = {
    viewBox: '0 0 400 260',
    preserveAspectRatio: 'xMidYMid slice',
    className: 'h-full w-full',
    'aria-hidden': true,
  } as const

  switch (type) {
    case 'migration':
      return (
        <svg {...svgProps}>
          <line x1="16" y1="130" x2="290" y2="130" stroke={EDGE} strokeWidth="1.5" strokeDasharray="4 6" />
          {[16, 60, 104, 148, 192].map((x) => (
            <rect
              key={x}
              className="viz-flow"
              data-dx={300 - x}
              data-dur="2"
              x={x}
              y="123"
              width="13"
              height="13"
              rx="2.5"
              fill={accent}
              opacity="0.5"
            />
          ))}
          <CloudOutline x={292} y={104} scale={1.7} stroke={ERA_COLORS.cloud} />
        </svg>
      )
    case 'streaming':
      return (
        <svg {...svgProps}>
          {[62, 130, 198].map((y) => (
            <line key={y} x1="12" y1={y} x2="388" y2={y} stroke={EDGE} strokeWidth="1.5" />
          ))}
          {[
            { x: 20, y: 62 },
            { x: 150, y: 62 },
            { x: 60, y: 130 },
            { x: 210, y: 130 },
            { x: 30, y: 198 },
            { x: 180, y: 198 },
          ].map((d) => (
            <circle
              key={`${d.x}-${d.y}`}
              className="viz-flow"
              data-dx={370 - d.x}
              data-dur="2.2"
              cx={d.x}
              cy={d.y}
              r="5"
              fill={accent}
              opacity="0.5"
            />
          ))}
        </svg>
      )
    case 'translation':
      return (
        <svg {...svgProps}>
          {COBOL_GLYPHS.map((glyph, i) => (
            <text
              key={glyph}
              className="viz-glyph-a font-mono"
              x="28"
              y={56 + i * 52}
              fontSize="17"
              letterSpacing="0.08em"
              fill={ERA_COLORS.legacy}
              opacity="0.9"
            >
              {glyph}
            </text>
          ))}
          {SQL_GLYPHS.map((glyph, i) => (
            <text
              key={glyph}
              className="viz-glyph-b font-mono"
              x="372"
              y={82 + i * 52}
              textAnchor="end"
              fontSize="17"
              letterSpacing="0.08em"
              fill={ERA_COLORS.cloud}
              opacity="0.35"
            >
              {glyph}
            </text>
          ))}
          <path d="M186 118l14 12-14 12" fill="none" stroke={FAINT} strokeWidth="2" strokeLinejoin="round" />
          <path d="M202 118l14 12-14 12" fill="none" stroke={FAINT} strokeWidth="2" strokeLinejoin="round" opacity="0.5" />
        </svg>
      )
    case 'rag':
      return (
        <svg {...svgProps}>
          {RAG_DOCS.map((d) => (
            <line
              key={`l-${d.x}-${d.y}`}
              x1={d.x + 8}
              y1={d.y + 10}
              x2="318"
              y2="128"
              stroke={EDGE}
              strokeWidth="1.5"
              strokeDasharray="3 5"
            />
          ))}
          {RAG_DOCS.map((d) => (
            <rect
              key={`r-${d.x}-${d.y}`}
              x={d.x}
              y={d.y}
              width="16"
              height="20"
              rx="2"
              fill="none"
              stroke={FAINT}
              strokeWidth="1.5"
            />
          ))}
          <path
            className="viz-pulse"
            transform="translate(318 128)"
            d="M0 -20 L5 -5 L20 0 L5 5 L0 20 L-5 5 L-20 0 L-5 -5 Z"
            fill={accent}
            fillOpacity="0.25"
            stroke={accent}
            strokeWidth="1.5"
          />
          {RAG_DOCS.map((d) => (
            <circle
              key={`d-${d.x}-${d.y}`}
              className="viz-flow"
              data-dx={318 - (d.x + 8)}
              data-dy={128 - (d.y + 10)}
              data-dur="1.6"
              cx={d.x + 8}
              cy={d.y + 10}
              r="4"
              fill={accent}
              opacity="0.5"
            />
          ))}
        </svg>
      )
    case 'crosscloud':
      return (
        <svg {...svgProps}>
          <CloudOutline x={26} y={78} scale={1.6} stroke={FAINT} />
          <CloudOutline x={286} y={78} scale={1.6} stroke={accent} />
          <line x1="112" y1="118" x2="284" y2="118" stroke={EDGE} strokeWidth="1.5" strokeDasharray="4 6" />
          <line x1="112" y1="142" x2="284" y2="142" stroke={EDGE} strokeWidth="1.5" strokeDasharray="4 6" />
          {[116, 190].map((x) => (
            <circle
              key={`f-${x}`}
              className="viz-flow"
              data-dx={280 - x}
              data-dur="1.8"
              cx={x}
              cy="118"
              r="4.5"
              fill={accent}
              opacity="0.5"
            />
          ))}
          {[280, 206].map((x) => (
            <circle
              key={`b-${x}`}
              className="viz-flow"
              data-dx={116 - x}
              data-dur="1.8"
              cx={x}
              cy="142"
              r="4.5"
              fill={RETURN_DOT}
              opacity="0.5"
            />
          ))}
        </svg>
      )
  }
}

interface ProjectCardProps {
  project: FeaturedProject
  index: number
  total: number
  onExpand?: (project: FeaturedProject, cardEl: HTMLElement) => void
}

export default function ProjectCard({ project, index, total, onExpand }: ProjectCardProps) {
  const [cardRef, inView] = useInView<HTMLElement>()
  const reduced = useReducedMotion()
  const loopRef = useRef<gsap.core.Timeline | null>(null)

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduced) return
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    el.style.setProperty('--ry', `${(px - 0.5) * 6}deg`)
    el.style.setProperty('--rx', `${(0.5 - py) * 6}deg`)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    const el = event.currentTarget
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const meta = ERA_META[project.era]
  const accent = ERA_COLORS[project.era]
  const frontMetrics = project.metrics.slice(0, 2)
  const frontTech = project.tech.slice(0, 5)
  const moreTech = project.tech.length - frontTech.length

  useGSAP(
    () => {
      if (reduced) return
      const card = cardRef.current
      if (!card) return

      // Entrance reveal + count-up on the two front metrics, once.
      const reveal = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      })
      reveal.from(card, { autoAlpha: 0, y: 24, duration: 0.6, delay: (index % 2) * 0.08 })

      gsap.utils.toArray<HTMLElement>('.metric-count').forEach((el) => {
        const target = Number(el.dataset.target)
        if (!el.dataset.target || Number.isNaN(target)) return
        const decimals = Number(el.dataset.decimals ?? '0')
        const prefix = el.dataset.prefix ?? ''
        const suffix = el.dataset.suffix ?? ''
        const final = el.dataset.final ?? ''
        const proxy = { v: 0 }
        reveal.to(
          proxy,
          {
            v: target,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = prefix + proxy.v.toFixed(decimals) + suffix
            },
            onComplete: () => {
              el.textContent = final
            },
          },
          0.25,
        )
      })

      // Looping background motif — played/paused from the useInView effect below.
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true, defaults: { ease: 'none' } })

      gsap.utils.toArray<SVGGraphicsElement>('.viz-flow').forEach((el, i) => {
        const dx = Number(el.dataset.dx ?? '0')
        const dy = Number(el.dataset.dy ?? '0')
        const dur = Number(el.dataset.dur ?? '1.8')
        const at = i * 0.4
        loop.set(el, { opacity: 1 }, at)
        loop.fromTo(el, { x: 0, y: 0 }, { x: dx, y: dy, duration: dur }, at)
        loop.to(el, { opacity: 0, duration: 0.3 }, at + dur - 0.3)
      })

      const pulses = gsap.utils.toArray<SVGGraphicsElement>('.viz-pulse')
      if (pulses.length) {
        loop.to(
          pulses,
          { scale: 1.15, transformOrigin: '50% 50%', duration: 0.8, yoyo: true, repeat: 3, ease: 'sine.inOut' },
          0,
        )
      }

      const glyphsA = gsap.utils.toArray<SVGTextElement>('.viz-glyph-a')
      const glyphsB = gsap.utils.toArray<SVGTextElement>('.viz-glyph-b')
      if (glyphsA.length && glyphsB.length) {
        loop
          .fromTo(glyphsA, { opacity: 0.9 }, { opacity: 0.15, duration: 1.1, stagger: 0.12, ease: 'sine.inOut' }, 0)
          .fromTo(glyphsB, { opacity: 0.15 }, { opacity: 0.9, duration: 1.1, stagger: 0.12, ease: 'sine.inOut' }, 0)
          .to(glyphsA, { opacity: 0.9, duration: 1.1, stagger: 0.12, ease: 'sine.inOut' }, 1.9)
          .to(glyphsB, { opacity: 0.15, duration: 1.1, stagger: 0.12, ease: 'sine.inOut' }, 1.9)
      }

      if (loop.duration() > 0) {
        loopRef.current = loop
      } else {
        loop.kill()
      }

      return () => {
        loopRef.current = null
      }
    },
    { scope: cardRef, dependencies: [reduced], revertOnUpdate: true },
  )

  // Pause the motif loop whenever the card is offscreen.
  useEffect(() => {
    const loop = loopRef.current
    if (!loop) return
    if (inView) loop.play()
    else loop.pause()
  }, [inView, reduced])

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`glass-panel tilt-card group relative flex flex-col overflow-hidden rounded-2xl border-t-2 ${meta.topBorder} transition-shadow duration-300 ${meta.glow}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-25">
        <VizMotif type={project.vizType} accent={accent} />
      </div>

      {/* Signature: a scan line sweeps the card on hover (motion-safe). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px overflow-hidden"
      >
        <span
          className="block h-full w-1/3 -translate-x-full opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100 motion-safe:group-hover:animate-[scan_1.1s_ease-in-out]"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      </div>

      <div className="relative flex flex-1 flex-col p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${meta.chip}`}
          >
            {meta.label}
          </span>
          {project.client && (
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">{project.client}</span>
          )}
          <span className="ml-auto font-mono text-xs text-ink-faint">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        <h3 className="mt-4 text-xl font-semibold text-ink md:text-2xl">{project.name}</h3>
        <p className={`mt-2 text-sm leading-relaxed md:text-base ${meta.text}`}>{project.tagline}</p>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-panel-edge/70 pt-5">
          {frontMetrics.map((m) => {
            const parts = splitMetricValue(m.value)
            return (
              <div key={m.label} className="flex flex-col-reverse">
                <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{m.label}</dt>
                <dd>
                  <span className="sr-only">{m.value}</span>
                  <span
                    aria-hidden="true"
                    className={`metric-count font-display text-2xl font-semibold ${meta.text}`}
                    data-target={parts?.target}
                    data-prefix={parts?.prefix}
                    data-suffix={parts?.suffix}
                    data-decimals={parts?.decimals}
                    data-final={m.value}
                  >
                    {m.value}
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>

        <ul aria-label="Key technologies" className="mt-5 flex flex-wrap gap-2">
          {frontTech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-panel-edge bg-surface/70 px-3 py-1 font-mono text-[11px] text-ink-muted"
            >
              {t}
            </li>
          ))}
          {moreTech > 0 && (
            <li className="rounded-full border border-panel-edge/60 px-3 py-1 font-mono text-[11px] text-ink-faint">
              +{moreTech} more
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={() => {
            const el = cardRef.current
            if (el && onExpand) onExpand(project, el)
          }}
          className={`mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 self-start font-mono text-xs uppercase tracking-[0.18em] ${meta.text}`}
        >
          View transformation
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6l5 5 5-5" />
          </svg>
        </button>
      </div>

    </article>
  )
}
