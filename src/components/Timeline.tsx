import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { ERA_COLORS, type Era, type Experience } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'

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

const MOST_RECENT_ROLE = portfolio.experience[0]

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

  useGSAP(
    () => {
      if (reducedMotion) return

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
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="ledger"
      aria-labelledby="ledger-heading"
      className="relative border-t-2 border-ink/25 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <header className="ledger-head flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="max-w-2xl">
            <h2 id="ledger-heading" className="font-display text-3xl font-semibold text-ink md:text-4xl">
              Eleven years, drawn to scale.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
              One bar per engagement, sized by its term. Hover a row to isolate it.
            </p>
          </div>
        </header>

        <div className="ledger-head mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold text-ink">{portfolio.experience.length}</span>
            <span className="hud-label">Roles</span>
          </p>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold text-ink">{portfolio.story.chapters.length}</span>
            <span className="hud-label">Eras</span>
          </p>
          {MOST_RECENT_ROLE.end === 'present' ? (
            <p className="flex items-center gap-2.5">
              <LiveDot />
              <span className="hud-label text-accent-500">Currently at {MOST_RECENT_ROLE.company}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-12">
          {/* Year axis */}
          <div className={`ledger-head grid ${GRID_COLS} gap-4`}>
            <span aria-hidden="true" />
            <div className="relative h-4">
              {AXIS_YEARS.map((year) => (
                <span
                  key={year}
                  className="hud-label absolute top-0 -translate-x-1/2 text-[10px]"
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
                  className="absolute inset-y-0"
                  style={{ left: `${band.leftPct}%`, width: `${band.widthPct}%`, background: ERA_COLORS[band.id] }}
                />
              ))}
            </div>
          </div>
          <div className={`ledger-head grid ${GRID_COLS} gap-4`}>
            <span aria-hidden="true" />
            <div className="relative mt-1.5 h-4">
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

          {/* Rows */}
          <ol role="list" className="mt-8 space-y-6">
            {ROLE_ROWS.map((row, i) => (
              <li
                key={`${row.role.company}-${row.role.start}`}
                className={`ledger-row grid ${GRID_COLS} items-center gap-4 transition-opacity duration-300`}
                style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.32 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2">
                    <span className="hud-label text-ink-faint">{String(row.ref).padStart(2, '0')}</span>
                    <span className="truncate font-display text-sm font-semibold text-ink md:text-base">
                      {row.role.company}
                    </span>
                  </p>
                  <p className="hud-label mt-0.5 text-accent-500">{row.role.title}</p>
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
                    <p
                      className="hud-label text-[10px] text-accent-500 transition-opacity duration-[250ms]"
                      style={{ opacity: hoveredIndex === i ? 1 : 0 }}
                    >
                      {row.durationLabel}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
