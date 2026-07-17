import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { ERA_COLORS, type Chapter, type Era, type Experience } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'
import Decrypt from '@/components/Decrypt'
import SplitText from '@/components/SplitText'
import SectionSweep from '@/components/SectionSweep'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/* ---------------------------------- data --------------------------------- */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseYM(ym: string): { year: number; month: number } {
  const [year, month] = ym.split('-').map(Number)
  return { year, month }
}

function formatYM(ym: string): string {
  if (ym === 'present') return 'Present'
  const { year, month } = parseYM(ym)
  return `${MONTH_NAMES[month - 1]} ${year}`
}

function formatDuration(start: string, end: string): string {
  const s = parseYM(start)
  const now = new Date()
  const e = end === 'present' ? { year: now.getFullYear(), month: now.getMonth() + 1 } : parseYM(end)
  const months = (e.year - s.year) * 12 + (e.month - s.month) + 1
  const yrs = Math.floor(months / 12)
  const mos = months % 12
  const parts: string[] = []
  if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? 's' : ''}`)
  if (mos > 0) parts.push(`${mos} mo${mos > 1 ? 's' : ''}`)
  return parts.join(' ') || '1 mo'
}

function chapterYears(roles: Experience[]): string {
  const first = roles[0]
  const last = roles[roles.length - 1]
  if (!first || !last) return ''
  const endYear = last.end === 'present' ? 'now' : last.end.slice(0, 4)
  return `${first.start.slice(0, 4)} — ${endYear}`
}

interface EraGroup {
  chapter: Chapter
  roles: { role: Experience; index: number }[]
}

/** Roles oldest-first so the timeline reads as an ascent: legacy → cloud → ai. */
const CHRONOLOGICAL_ROLES = [...portfolio.experience].sort((a, b) => a.start.localeCompare(b.start))

const ERA_GROUPS: EraGroup[] = (() => {
  let index = 0
  return portfolio.story.chapters.map((chapter) => ({
    chapter,
    roles: CHRONOLOGICAL_ROLES.filter((role) => role.era === chapter.id).map((role) => ({ role, index: index++ })),
  }))
})()

/* --------------------------------- styles -------------------------------- */

const ERA_LABELS: Record<Era, string> = { legacy: 'Legacy', cloud: 'Cloud', ai: 'AI' }

/** Literal class strings per era so Tailwind v4 can see every utility. */
const ERA_STYLES: Record<
  Era,
  { text: string; chip: string; node: string; marker: string; bullet: string; cardHover: string }
> = {
  legacy: {
    text: 'text-legacy',
    chip: 'border-legacy/40 text-legacy',
    node: 'bg-legacy shadow-glow-legacy',
    marker: 'border-legacy shadow-glow-legacy',
    bullet: 'bg-legacy',
    cardHover: 'hover:border-legacy/40',
  },
  cloud: {
    text: 'text-cloud',
    chip: 'border-cloud/40 text-cloud',
    node: 'bg-cloud shadow-glow-cloud',
    marker: 'border-cloud shadow-glow-cloud',
    bullet: 'bg-cloud',
    cardHover: 'hover:border-cloud/40',
  },
  ai: {
    text: 'text-ai',
    chip: 'border-ai/40 text-ai',
    node: 'bg-ai shadow-glow-ai',
    marker: 'border-ai shadow-glow-ai',
    bullet: 'bg-ai',
    cardHover: 'hover:border-ai/40',
  },
}

const SPINE_GRADIENT = `linear-gradient(180deg, ${ERA_COLORS.legacy} 0%, ${ERA_COLORS.cloud} 45%, ${ERA_COLORS.ai} 100%)`

/** Expanding a card's highlights shifts layout below it — recalc trigger positions. */
function handleDetailsToggle() {
  ScrollTrigger.refresh()
}

/* ------------------------------- components ------------------------------ */

function RoleCard({ role, index }: { role: Experience; index: number }) {
  const side = index % 2 === 0 ? 'left' : 'right'
  const era = ERA_STYLES[role.era]
  const overflowTech = (role.tech?.length ?? 0) - 6

  return (
    <li className="relative pl-14 md:pl-0">
      {/* Era node on the spine */}
      <span
        aria-hidden="true"
        className={`tl-node absolute top-8 left-5 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-void md:left-1/2 ${era.node}`}
      />
      <article
        data-side={side}
        className={`tl-card glass-panel relative rounded-xl p-6 transition-colors duration-300 md:w-[calc(50%-3rem)] ${
          side === 'left' ? 'md:mr-auto' : 'md:ml-auto'
        } ${era.cardHover}`}
      >
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-[0.18em] uppercase ${era.chip}`}
          >
            {ERA_LABELS[role.era]}
          </span>
          <span className="hud-label">
            <time dateTime={role.start}>{formatYM(role.start)}</time>
            {' — '}
            {role.end === 'present' ? 'Present' : <time dateTime={role.end}>{formatYM(role.end)}</time>}
            {' · '}
            {formatDuration(role.start, role.end)}
          </span>
        </p>

        <h4 className="mt-3 text-lg font-semibold text-ink md:text-xl">{role.title}</h4>
        <p className="mt-1 text-sm font-medium text-ink-muted">
          {role.company}
          {role.client ? <span className="text-ink-faint"> · {role.client}</span> : null}
        </p>

        {role.summary ? <p className="mt-3 text-sm leading-relaxed text-ink-muted">{role.summary}</p> : null}

        {role.metrics && role.metrics.length > 0 ? (
          <dl className="mt-4 flex flex-wrap gap-2">
            {role.metrics.slice(0, 3).map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col-reverse rounded-md border border-panel-edge bg-panel/60 px-2.5 py-1.5"
              >
                <dt className="text-[11px] leading-tight text-ink-faint">{metric.label}</dt>
                <dd className={`font-mono text-sm font-semibold ${era.text}`}>{metric.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {role.highlights.length > 0 ? (
          <details className="group mt-4" onToggle={handleDetailsToggle}>
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded font-mono text-xs tracking-[0.18em] text-ink-muted uppercase transition-colors select-none hover:text-ink [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="group-open:hidden">
                +
              </span>
              <span aria-hidden="true" className="hidden group-open:inline">
                −
              </span>
              key work
            </summary>
            <ul role="list" className="mt-3 space-y-2.5">
              {role.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
                  <span aria-hidden="true" className={`mt-2 h-1 w-1 shrink-0 rounded-full ${era.bullet}`} />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {role.tech && role.tech.length > 0 ? (
          <ul role="list" aria-label="Technologies" className="mt-4 flex flex-wrap gap-1.5">
            {role.tech.slice(0, 6).map((tech) => (
              <li
                key={tech}
                className="rounded border border-panel-edge px-2 py-0.5 font-mono text-[11px] text-ink-muted"
              >
                {tech}
              </li>
            ))}
            {overflowTech > 0 ? (
              <li className="rounded border border-panel-edge px-2 py-0.5 font-mono text-[11px] text-ink-faint">
                +{overflowTech} more
              </li>
            ) : null}
          </ul>
        ) : null}
      </article>
    </li>
  )
}

export default function Timeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return

      // Section header: staggered word reveal on the headline, then subcopy fades up.
      gsap.fromTo(
        '.tl-head .split-word',
        { yPercent: 110, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.05,
          scrollTrigger: { trigger: '.tl-head', start: 'top 82%', toggleActions: 'play none none none reverse' },
        },
      )
      gsap.fromTo(
        '.tl-sub',
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.tl-head', start: 'top 78%', toggleActions: 'play none none none reverse' },
        },
      )

      // Gradient spine draws itself (amber → cyan → violet) in lockstep with scroll.
      gsap.fromTo(
        '.tl-progress',
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: '.tl-track', start: 'top 72%', end: 'bottom 72%', scrub: 0.4 },
        },
      )

      // Era chapter milestones.
      gsap.utils.toArray<HTMLElement>('.tl-chapter').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
          },
        )
      })

      // Nodes pop as the spine reaches them.
      gsap.utils.toArray<HTMLElement>('.tl-node').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.45,
            ease: 'back.out(2.5)',
            scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
          },
        )
      })

      // Cards rise and drift in from their side of the spine.
      gsap.utils.toArray<HTMLElement>('.tl-card').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 44, x: el.dataset.side === 'left' ? -32 : 32 },
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none reverse' },
          },
        )
      })
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="timeline"
      aria-labelledby="timeline-heading"
      className="relative scroll-mt-24 py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <header className="tl-head max-w-3xl">
          <Decrypt as="p" className="hud-label section-kicker" text="02 · career trajectory" />
          <SectionSweep />
          <h2 id="timeline-heading" className="mt-3 text-3xl font-bold text-ink md:text-5xl">
            <SplitText
              as="span"
              accent={['Legacy', 'Cloud', 'AI']}
              accentInnerClassName="split-word inline-block text-legacy"
            >
              Legacy → Cloud → Enterprise AI
            </SplitText>
          </h2>
          <p className="tl-sub mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
            Eleven years, seven roles, three eras — mainframe ETL fluency compounding into cloud-scale migrations,
            then into production GenAI. Follow the spine.
          </p>
        </header>

        <div className="tl-track relative mt-16 md:mt-20">
          {/* Spine: faint track + scroll-drawn era gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-5 w-0.5 -translate-x-1/2 md:left-1/2"
          >
            <div className="absolute inset-0 bg-panel-edge/70" />
            <div className="tl-progress absolute inset-0" style={{ background: SPINE_GRADIENT }} />
          </div>

          <ol role="list" className="space-y-16 md:space-y-24">
            {ERA_GROUPS.map(({ chapter, roles }, chapterIndex) => {
              const era = ERA_STYLES[chapter.id]
              return (
                <li key={chapter.id}>
                  <div className="tl-chapter relative pl-14 md:pl-0 md:pt-12 md:text-center">
                    <span
                      aria-hidden="true"
                      className={`absolute top-1.5 left-5 z-10 h-4 w-4 -translate-x-1/2 rotate-45 border-2 bg-void md:top-0 md:left-1/2 ${era.marker}`}
                    />
                    <Decrypt
                      as="p"
                      className="hud-label"
                      text={`chapter ${String(chapterIndex + 1).padStart(2, '0')} · ${chapterYears(roles.map((r) => r.role))}`}
                    />
                    <h3 className={`mt-2 text-2xl font-bold md:text-3xl ${era.text}`}>{chapter.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted md:mx-auto">{chapter.blurb}</p>
                  </div>

                  <ol role="list" className="mt-10 space-y-10 md:mt-14 md:space-y-14">
                    {roles.map(({ role, index }) => (
                      <RoleCard key={`${role.company}-${role.start}`} role={role} index={index} />
                    ))}
                  </ol>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
