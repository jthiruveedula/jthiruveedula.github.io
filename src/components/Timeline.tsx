import { Fragment, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { ERA_COLORS, type Era, type Experience } from '@/data/types'
import { useInView, useReducedMotion } from '@/lib/hooks'
import { domainSlug, pulseDomainRow, techDomain } from '@/lib/skillMatch'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Short axis/legend label per era — chapter.title is the long form ("Legacy Systems"). */
const ERA_AXIS_LABEL: Record<Era, string> = {
  legacy: 'Legacy',
  cloud: 'Cloud',
  ai: 'Enterprise AI',
}

const TODAY = new Date()
const CURRENT_YEAR = TODAY.getFullYear()
const CURRENT_DECIMAL_YEAR = CURRENT_YEAR + TODAY.getMonth() / 12

/** 'YYYY-MM' | 'present' -> decimal year, e.g. '2025-05' -> 2025.33. */
function toDecimalYear(ym: string): number {
  if (ym === 'present') return CURRENT_DECIMAL_YEAR
  const [year, month] = ym.split('-').map(Number)
  return year + (month - 1) / 12
}

const ROLES = [...portfolio.experience].sort((a, b) => a.start.localeCompare(b.start))

/** Chart floor — the earliest engagement's year, not a hardcoded date, so an
 *  earlier role added later still lands on the axis correctly. */
const T0 = Math.floor(Math.min(...ROLES.map((r) => toDecimalYear(r.start))))
/** Scale runs one year past today, so "NOW" always has room and never sits on a bar. */
const TSPAN = CURRENT_YEAR + 1 - T0
const AXIS_YEARS = Array.from({ length: CURRENT_YEAR - T0 + 1 }, (_, i) => T0 + i)
const NOW_LEFT_PCT = ((CURRENT_DECIMAL_YEAR - T0) / TSPAN) * 100

/** Shared label/track split so axis ticks, era bands, and every role row line up. */
const GRID_COLS = 'grid-cols-[6.5rem_1fr] sm:grid-cols-[10rem_1fr]'

const YEAR_GRIDLINES = `repeating-linear-gradient(to right, rgba(232, 230, 225, 0.1) 0, rgba(232, 230, 225, 0.1) 1px, transparent 1px, transparent ${100 / TSPAN}%)`

interface EraBand {
  id: Era
  label: string
  leftPct: number
  widthPct: number
}

/** Each band's span is the min/max of that era's actual roles — never hardcoded. */
const ERA_BANDS: EraBand[] = portfolio.story.chapters.map((chapter): EraBand => {
  const roles = ROLES.filter((r) => r.era === chapter.id)
  const starts = roles.map((r) => toDecimalYear(r.start))
  const ends = roles.map((r) => toDecimalYear(r.end))
  const startYear = Math.min(...starts)
  const endYear = Math.max(...ends)
  return {
    id: chapter.id,
    label: ERA_AXIS_LABEL[chapter.id],
    leftPct: ((startYear - T0) / TSPAN) * 100,
    widthPct: ((endYear - startYear) / TSPAN) * 100,
  }
})

interface RoleRow {
  role: Experience
  ref: number
  left: number
  width: number
  flip: boolean
  isCurrent: boolean
  periodLabel: string
  durationLabel: string
  barColor: string
}

const ROLE_ROWS: RoleRow[] = ROLES.map((role, i): RoleRow => {
  const startYear = toDecimalYear(role.start)
  const endYear = toDecimalYear(role.end)
  const left = ((startYear - T0) / TSPAN) * 100
  const width = Math.max(((endYear - startYear) / TSPAN) * 100, 2.2)
  const span = endYear - startYear
  return {
    role,
    ref: i + 1,
    left,
    width,
    flip: left + width > 62,
    isCurrent: role.end === 'present',
    periodLabel: `${Math.floor(startYear)} — ${role.end === 'present' ? 'present' : Math.floor(endYear)}`,
    durationLabel: span < 1 ? '<1 yr' : `${Math.round(span)} yr${Math.round(span) === 1 ? '' : 's'}`,
    barColor: role.era === 'ai' ? 'var(--color-accent-500)' : ERA_COLORS[role.era],
  }
})

const MOST_RECENT_ROLE = ROLES[ROLES.length - 1]

interface EraBoundary {
  id: string
  leftPct: number
}

/** Midpoint between each era's end and the next era's start — where one chapter hands off to the next. */
const ERA_BOUNDARIES: EraBoundary[] = ERA_BANDS.slice(1).map((band, i) => {
  const prev = ERA_BANDS[i]
  return {
    id: `${prev.id}-${band.id}`,
    leftPct: (prev.leftPct + prev.widthPct + band.leftPct) / 2,
  }
})

/** Inner solid dot + outer expanding [data-pulse] ring — the sitewide live-status motif. */
function LiveDot() {
  return (
    <span aria-hidden="true" className="relative inline-flex h-[7px] w-[7px] shrink-0">
      <span className="absolute inset-0 rounded-full bg-accent-500" />
      <span data-pulse className="absolute inset-0 rounded-full bg-accent-500" />
    </span>
  )
}

export default function Timeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [verbRef, verbInView] = useInView<HTMLElement>()

  useGSAP(
    () => {
      const bandFills = gsap.utils.toArray<HTMLElement>('.ledger-band-fill')

      if (reducedMotion) {
        gsap.set(bandFills, { scaleX: 1 })
        return
      }

      gsap.fromTo(
        '.ledger-head',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        },
      )
      gsap.fromTo(
        '.ledger-row',
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
        },
      )

      // Era-band legend draws itself in, then a brief accent flash marks each
      // era-to-era handoff point — a one-shot beat, not a loop.
      const bandTl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      })
      bandTl.fromTo(bandFills, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out', stagger: 0.12 })
      if (ERA_BOUNDARIES.length) {
        bandTl
          .fromTo(
            '.era-boundary-flash',
            { scale: 0, opacity: 0 },
            { scale: 1.6, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.12 },
            '-=0.15',
          )
          .to('.era-boundary-flash', { scale: 1, opacity: 0.55, duration: 0.45, ease: 'power2.out' }, '-=0.1')
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="ledger"
      aria-labelledby="ledger-heading"
      className="relative scroll-mt-24 px-[clamp(20px,4vw,64px)] py-[clamp(64px,10vh,120px)]"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* Same head geometry as #arc: mono eyebrow stacked directly above the
            heading, in the same column. The v5 version was a flex-wrap header with
            no eyebrow and a heavier 2px top border — it read as a different species
            of section from the one immediately above it. */}
        <header className="max-w-[46ch]">
          <p className="eyebrow">
            <b>02</b> · The ledger
          </p>
          <h2 id="ledger-heading" className="text-[clamp(1.7rem,3.6vw,2.8rem)]">
            Eleven years, drawn to&nbsp;
            <em ref={verbRef} className={`verb${verbInView ? ' verb--armed' : ''}`}>
              scale
            </em>
            .
          </h2>
          <p className="mt-5 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.62] text-ink-muted">
            One bar per engagement, sized by its term. Hover a row to isolate it.
          </p>
        </header>

        <div className="ledger-head mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-rule pt-6">
          <p className="flex items-baseline gap-2">
            <span className="stat__figure text-[1.35rem]">{portfolio.experience.length}</span>
            <span className="stat__label">Roles</span>
          </p>
          <p className="flex items-baseline gap-2">
            <span className="stat__figure text-[1.35rem]">{portfolio.story.chapters.length}</span>
            <span className="stat__label">Eras</span>
          </p>
          {MOST_RECENT_ROLE.end === 'present' ? (
            <p className="flex items-center gap-2.5">
              <LiveDot />
              <span className="stat__label proper text-accent">Currently at {MOST_RECENT_ROLE.company}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-12">
          {/* Year axis */}
          <div className={`ledger-head grid ${GRID_COLS} gap-4`}>
            <span aria-hidden="true" />
            <div className="relative h-4">
              {AXIS_YEARS.map((year, i) => (
                <span
                  key={year}
                  // Below `sm` the label column shrinks to 6.5rem, leaving too little
                  // track width for every year — a dozen 3-char labels crammed into
                  // ~240px overlap into an unreadable smear. Thinning to every other
                  // year is "simplify," not "cram," per the responsive spec.
                  className={`hud-label absolute top-0 -translate-x-1/2 text-[10px] ${i % 2 === 0 ? '' : 'hidden sm:inline'}`}
                  style={{ left: `${((year - T0) / TSPAN) * 100}%` }}
                >
                  '{String(year).slice(-2)}
                </span>
              ))}
              <span className="hud-label absolute top-0 right-0 text-[10px] text-accent-500">NOW</span>
            </div>
          </div>

          {/* Era-band legend */}
          <div className={`ledger-head mt-3 grid ${GRID_COLS} gap-4`}>
            <span aria-hidden="true" />
            <div className="relative h-1.5">
              {ERA_BANDS.map((band) => (
                <span
                  key={band.id}
                  aria-hidden="true"
                  className="ledger-band-fill origin-left absolute inset-y-0"
                  style={{
                    left: `${band.leftPct}%`,
                    width: `${band.widthPct}%`,
                    background: ERA_COLORS[band.id],
                    transform: 'scaleX(0)',
                  }}
                />
              ))}
              {!reducedMotion &&
                ERA_BOUNDARIES.map((boundary) => (
                  <span
                    key={boundary.id}
                    aria-hidden="true"
                    className="era-boundary-flash absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500"
                    style={{ left: `${boundary.leftPct}%`, opacity: 0 }}
                  />
                ))}
            </div>
          </div>
          <div className={`ledger-head grid ${GRID_COLS} gap-4`}>
            <span aria-hidden="true" />
            {/* Proportional label under each band's own width. Fine once the track has
                room (>=sm) — below that, the "Enterprise AI" band is often under 30px
                wide and the text wraps into the next band. A plain flex legend reads
                better than cramming text into a slice too narrow for it. */}
            <div className="relative mt-1.5 hidden h-4 sm:block">
              {ERA_BANDS.map((band) => (
                <span
                  key={band.id}
                  className="hud-label absolute top-0 text-center text-[10px]"
                  style={{ left: `${band.leftPct}%`, width: `${band.widthPct}%` }}
                >
                  {band.label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 sm:hidden">
            {ERA_BANDS.map((band) => (
              <span key={band.id} className="hud-label flex items-center gap-1.5 text-[10px]">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: ERA_COLORS[band.id] }}
                />
                {band.label}
              </span>
            ))}
          </div>

          {/* Era thesis — the argument the chart's colour bands can only gesture at.
              portfolio.story.chapters carries a blurb (the era's thesis) and a carry
              line (what it handed the next era) for exactly this reason: "the eras
              are not a list of jobs, they compound." Three short paragraphs, always
              visible — this is the section's claim, not a per-role resume dump. */}
          <div className="ledger-head mt-10 grid gap-8 border-t border-rule pt-8 md:grid-cols-3">
            {portfolio.story.chapters.map((chapter) => (
              <div key={chapter.id}>
                <p className="stat__label" style={{ color: ERA_COLORS[chapter.id] }}>
                  {chapter.title}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{chapter.blurb}</p>
                {chapter.carry && (
                  <p className="mt-3 text-sm leading-relaxed">
                    <span aria-hidden="true" className="text-accent">
                      →
                    </span>{' '}
                    <span className="text-ink-muted">{chapter.carry}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          <ol role="list" className="mt-8 space-y-6">
            {ROLE_ROWS.map((row, i) => {
              const isOpen = openIndex === i
              const hasDetail = Boolean(row.role.summary) || row.role.highlights.length > 0
              const detailId = `role-detail-${row.ref}`
              return (
              <li
                key={`${row.role.company}-${row.role.start}`}
                className={`ledger-row grid ${GRID_COLS} items-center gap-4 transition-[opacity,transform] duration-300`}
                style={{
                  opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.32,
                  transform: hoveredIndex === i ? 'scale(1.0075)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2">
                    <span className="hud-label text-ink-faint">{String(row.ref).padStart(2, '0')}</span>
                    <span className="truncate font-display text-sm text-ink md:text-base">
                      {row.role.company}
                    </span>
                  </p>
                  <p className="hud-label mt-0.5 text-accent-500">{row.role.title}</p>
                  {hasDetail && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={detailId}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      onFocus={() => setHoveredIndex(i)}
                      onBlur={() => setHoveredIndex(null)}
                      className="hud-label mt-1.5 text-ink-faint transition-colors hover:text-accent focus-visible:text-accent"
                    >
                      {isOpen ? '− hide' : '+ the build'}
                    </button>
                  )}
                </div>

                <div className="relative h-11">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundImage: YEAR_GRIDLINES }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-px bg-accent-500/25"
                    style={{ left: `${NOW_LEFT_PCT}%` }}
                  />
                  <span
                    className="absolute top-1/2 rounded-[1px] transition-[height] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      left: `${row.left}%`,
                      width: `${row.width}%`,
                      height: hoveredIndex === i ? '18px' : '12px',
                      transform: 'translateY(-50%)',
                      background: row.barColor,
                    }}
                  />
                  {row.isCurrent ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 inline-flex h-[7px] w-[7px] -translate-y-1/2"
                      style={{ left: `calc(${row.left + row.width}% - 3.5px)` }}
                    >
                      <span className="absolute inset-0 rounded-full bg-accent-500" />
                      <span data-pulse className="absolute inset-0 rounded-full bg-accent-500" />
                    </span>
                  ) : null}
                  <div
                    className="absolute top-1/2 whitespace-nowrap"
                    style={{
                      left: row.flip ? `${row.left}%` : `${row.left + row.width}%`,
                      transform: row.flip ? 'translate(calc(-100% - 0.6rem), -50%)' : 'translate(0.6rem, -50%)',
                      textAlign: row.flip ? 'right' : 'left',
                    }}
                  >
                    <p className="hud-label text-[10px] text-ink-muted">{row.periodLabel}</p>
                    {/* Always shown. This was opacity:0 until hover, which meant the
                        one quantity the whole chart encodes — how long each engagement
                        ran — was invisible to keyboard users, invisible on touch, and a
                        WCAG 1.4.13 failure. Hover now only promotes it from faint to
                        accent; it never gates it. */}
                    <p
                      className="hud-label text-[10px] transition-colors duration-[250ms]"
                      style={{ color: hoveredIndex === i ? 'var(--color-accent)' : 'var(--color-ink-faint)' }}
                    >
                      {row.durationLabel}
                    </p>
                  </div>
                </div>

                {hasDetail && (
                  <div
                    id={detailId}
                    aria-hidden={!isOpen}
                    // See ProjectCard's identical panel: aria-hidden alone doesn't
                    // remove the tech-link anchors from the tab order while the
                    // panel is visually collapsed. `inert` (React 19) does.
                    inert={!isOpen}
                    className="grid transition-[grid-template-rows] ease-out"
                    style={{
                      gridColumn: '1 / -1',
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                      transitionDuration: reducedMotion ? '0.01ms' : '450ms',
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-4 max-w-[68ch] border-t border-rule pt-4">
                        {row.role.summary && (
                          <p className="text-sm leading-relaxed text-ink-muted">{row.role.summary}</p>
                        )}
                        {row.role.highlights.length > 0 && (
                          <ul className="mt-4 space-y-2.5">
                            {row.role.highlights.map((line) => (
                              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
                                <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent-500/60" />
                                {line}
                              </li>
                            ))}
                          </ul>
                        )}
                        {row.role.metrics && row.role.metrics.length > 0 && (
                          <div className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                            {row.role.metrics.map((m) => (
                              <p key={m.label} className="min-w-0">
                                <span className="stat__figure text-[1.2rem]">{m.value}</span>
                                <span className="stat__label ml-2">{m.label}</span>
                              </p>
                            ))}
                          </div>
                        )}
                        {row.role.tech && row.role.tech.length > 0 && (
                          <p className="mt-5 font-mono text-[10.5px] tracking-[0.08em] text-ink-faint">
                            {row.role.tech.map((tech, ti) => {
                              const domain = techDomain(tech)
                              return (
                                <Fragment key={tech}>
                                  {ti > 0 && '  ·  '}
                                  {domain ? (
                                    <a
                                      href={`#${domainSlug(domain)}`}
                                      className="tech-link"
                                      title={`${domain} in the toolkit`}
                                      onClick={() => pulseDomainRow(domain)}
                                    >
                                      {tech}
                                    </a>
                                  ) : (
                                    tech
                                  )}
                                </Fragment>
                              )
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
