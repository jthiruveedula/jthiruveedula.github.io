import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import type { Metric } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'
import { revealFrom } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const { headlineMetrics } = portfolio
const TOTAL_COUNT = headlineMetrics.length

type CategoryName = 'Cost' | 'Scale' | 'Reliability' | 'AI'
type Filter = 'All' | CategoryName

/** Fixed display order — not derived from the data, per the section's design. */
const CATEGORIES: readonly CategoryName[] = ['Cost', 'Scale', 'Reliability', 'AI']
const FILTERS: readonly Filter[] = ['All', ...CATEGORIES]

/** How many metrics carry each category anywhere in `groups`. Printed on the
 *  filter chip so the reader knows the size of a cut before taking it. */
const categoryCounts: Record<Filter, number> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = headlineMetrics.filter((m) => m.groups?.includes(cat)).length
    return acc
  },
  { All: TOTAL_COUNT } as Record<Filter, number>,
)

/** Splits a metric's display value into prefix / number / suffix, and derives
 *  the count-up's decimal precision from the number string itself (so "99.9%"
 *  animates with 1 decimal and everything else with 0) — reading it straight
 *  from `value` keeps this in sync even if numeric/prefix/suffix drift. */
function parseValue(value: string): { prefix: string; number: string; suffix: string; decimals: number } {
  const match = /^([^0-9]*)([0-9.]+)(.*)$/.exec(value)
  if (!match) return { prefix: '', number: value, suffix: '', decimals: 0 }
  const [, prefix, number, suffix] = match
  const dot = number.indexOf('.')
  const decimals = dot === -1 ? 0 : number.length - dot - 1
  return { prefix, number, suffix, decimals }
}

/**
 * One row of the index. Thirteen of these, not thirteen tiles: a fixed figure
 * column is what turns thirteen competing headlines into a table you can scan.
 * Same grid template and same hairline rule as the arc's chapter list above, so
 * the two lists read as one document.
 *
 * `hidden` is the filter mechanism — every row stays mounted because the count-up
 * holds a ref per label and fires synchronously on the click, before React has
 * re-rendered. Tailwind's preflight gives `[hidden]` `display: none !important`,
 * so the `grid` utility below cannot out-specify it.
 */
function MetricRow({
  metric,
  visible,
  registerNumberRef,
}: {
  metric: Metric
  visible: boolean
  registerNumberRef: (label: string, el: HTMLSpanElement | null) => void
}) {
  const { prefix, number, suffix, decimals } = parseValue(metric.value)
  const finalText = Number(number).toFixed(decimals)

  return (
    <li
      hidden={!visible}
      className="metric-row grid gap-x-10 gap-y-2 border-b border-rule py-5 md:grid-cols-[13rem_minmax(0,1fr)]"
    >
      <div>
        <p className="stat__figure text-[clamp(1.5rem,3vw,2rem)]">
          {/* Screen readers get the canonical value; the animated digits are decorative. */}
          <span className="sr-only">{metric.value}</span>
          <span aria-hidden="true">
            {prefix ? <span className="text-accent">{prefix}</span> : null}
            <span ref={(el) => registerNumberRef(metric.label, el)} className="metric-number">
              {finalText}
            </span>
            {suffix ? <span className="text-[0.7em] text-accent">{suffix}</span> : null}
          </span>
        </p>
        {metric.groups?.length ? (
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {metric.groups.map((group) => (
              <li
                key={group}
                className="font-mono text-[10.5px] tracking-[0.08em] text-ink-faint proper"
              >
                {group}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="stat__label">{metric.label}</p>
        {metric.source ? <p className="mt-1.5 text-[11px] text-ink-faint">{metric.source}</p> : null}
      </div>
    </li>
  )
}

export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [filter, setFilter] = useState<Filter>('All')
  const numberRefs = useRef(new Map<string, HTMLSpanElement>())
  const activeTweens = useRef(new Map<string, gsap.core.Tween>())
  const gridSweepRef = useRef<HTMLSpanElement>(null)
  /** The reveal trigger below is replayable by design, so scrolling past #index and
   *  back would otherwise re-zero all thirteen figures. Explicit filter clicks still
   *  replay the count freely; only the scroll-entry firing is one-shot. */
  const counted = useRef(false)

  const registerNumberRef = (label: string, el: HTMLSpanElement | null) => {
    if (el) numberRefs.current.set(label, el)
    else numberRefs.current.delete(label)
  }


  /** Tweens the currently-matching metrics' numbers from 0 to target. Used both
   *  for the first scroll-into-view reveal and
   *  to replay on every filter click — the grid stays mounted across clicks, so
   *  this is the only thing that re-fires. Kills any tween still in flight for a
   *  given metric first so two rapid filter clicks can't race the same textContent. */
  const animateCounts = (target: Filter, staggerEach: number) => {
    if (reducedMotion) return
    const list = target === 'All' ? headlineMetrics : headlineMetrics.filter((m) => m.groups?.includes(target))
    list.forEach((m, i) => {
      const el = numberRefs.current.get(m.label)
      if (!el) return
      const { number, decimals } = parseValue(m.value)
      const numericTarget = Number(number)
      if (!Number.isFinite(numericTarget)) return
      activeTweens.current.get(m.label)?.kill()
      const proxy = { value: 0 }
      el.textContent = proxy.value.toFixed(decimals)
      const tween = gsap.to(proxy, {
        value: numericTarget,
        duration: 1.1,
        delay: i * staggerEach,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = proxy.value.toFixed(decimals)
        },
      })
      activeTweens.current.set(m.label, tween)
    })
  }

  /** One-shot scan-line sweep across the grid, echoing the hero's eval-scanline
   *  vocabulary. Fires only on an explicit filter click (never on hover), kills
   *  any sweep still in flight so back-to-back clicks each get exactly one clean
   *  pass, and is a no-op under reduced motion. */
  const fireGridSweep = () => {
    if (reducedMotion) return
    const bar = gridSweepRef.current
    if (!bar) return
    gsap.killTweensOf(bar)
    gsap.fromTo(
      bar,
      { scaleX: 0, opacity: 1 },
      {
        scaleX: 1,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => gsap.to(bar, { opacity: 0, duration: 0.4, ease: 'power1.in' }),
      },
    )
  }

  const selectFilter = (name: Filter) => {
    setFilter(name)
    animateCounts(name, 0.03)
    fireGridSweep()
  }

  useGSAP(
    () => {
      if (reducedMotion) return

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          // Replayable, so a rebuilt GSAP context can run the reveal again instead of
          // sitting on a consumed trigger with the from-state still applied.
          toggleActions: 'play none none none',
          onEnter: () => {
            if (counted.current) return
            counted.current = true
            animateCounts('All', 0.05)
          },
        },
      })

      revealFrom(tl, '.index-head', { y: 24, duration: 0.6, stagger: 0.08 }, 0)
      revealFrom(tl, '.metric-row', { y: 20, duration: 0.6, stagger: 0.05 }, 0.15)
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  const shownCount =
    filter === 'All' ? TOTAL_COUNT : headlineMetrics.filter((m) => m.groups?.includes(filter)).length

  return (
    <section
      ref={sectionRef}
      id="index"
      aria-labelledby="index-heading"
      className="relative isolate scroll-mt-24 px-[clamp(20px,4vw,64px)] py-[clamp(64px,10vh,120px)]"
    >

      <div className="mx-auto max-w-[1320px]">
        <header className="max-w-[46ch]">
          <p className="index-head eyebrow">
            <b>04</b> · The index
          </p>
          <h2 id="index-heading" className="index-head text-[clamp(1.7rem,3.6vw,2.8rem)]">
            Measured, not claimed.
          </h2>
          <p className="index-head lede mt-5 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.62] text-ink-muted">
            Thirteen figures, each one carrying the system it came from. Cut the list down
            to the ones you care about.
          </p>
        </header>

        {/* One control, not two. The composition bar that used to sit above this said the
            same thing in a second grammar — and disagreed with itself, because it counted
            primary groups while the pills counted every group. Each row now carries its
            own categories, which is where that information is actually actionable. */}
        <div
          role="group"
          aria-label="Filter figures by category"
          className="index-head mt-10 flex flex-wrap gap-2"
        >
          {FILTERS.map((name) => {
            const active = filter === name
            return (
              <button
                key={name}
                type="button"
                onClick={() => selectFilter(name)}
                aria-pressed={active}
                className={active ? 'chip chip--primary' : 'chip'}
              >
                {name}
                <span className="tabular-nums text-ink-faint">
                  {String(categoryCounts[name]).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>

        <p className="index-head stat__label mt-4" aria-live="polite">
          {shownCount} of {TOTAL_COUNT} figures shown
        </p>

        <div className="relative mt-8 border-t border-rule">
          <span
            ref={gridSweepRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left bg-accent opacity-0"
          />
          <ul>
            {headlineMetrics.map((metric) => {
              const visible = filter === 'All' || (metric.groups?.includes(filter) ?? false)
              return (
                <MetricRow
                  key={metric.label}
                  metric={metric}
                  visible={visible}
                  registerNumberRef={registerNumberRef}
                />
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
