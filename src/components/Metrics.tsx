import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import type { Metric } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'
import SplitText from '@/components/SplitText'
import Decrypt from '@/components/Decrypt'
import SectionSweep from '@/components/SectionSweep'
import ClipReveal from '@/components/ClipReveal'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const { headlineMetrics } = portfolio
const TOTAL_COUNT = headlineMetrics.length

type CategoryName = 'Cost' | 'Scale' | 'Reliability' | 'AI'
type Filter = 'All' | CategoryName

/** Fixed display order — not derived from the data, per the section's design. */
const CATEGORIES: readonly CategoryName[] = ['Cost', 'Scale', 'Reliability', 'AI']
const FILTERS: readonly Filter[] = ['All', ...CATEGORIES]

/** Composition-bar segment colors, one per category, in the same fixed order. */
const CATEGORY_ACCENT: Record<CategoryName, string> = {
  Cost: 'var(--color-accent-300)',
  Scale: 'var(--color-accent-500)',
  Reliability: 'var(--color-accent-700)',
  AI: 'var(--color-accent-900)',
}

/** Geometry for each tile's data-dial ring — a literal instrument reading that
 *  fills in sync with the count-up tween, reusing the same accent ramp as the
 *  composition bar above. */
const RING_R = 15.5
const RING_CIRC = 2 * Math.PI * RING_R

/** How many metrics carry each category as their PRIMARY group (groups[0]) —
 *  drives the composition bar's proportional widths. */
const compositionCounts: Record<CategoryName, number> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = headlineMetrics.filter((m) => m.groups?.[0] === cat).length
    return acc
  },
  {} as Record<CategoryName, number>,
)

/** How many metrics carry each category ANYWHERE in groups — drives the pill
 *  counts, deliberately different from the composition bar above. */
const pillCounts: Record<Filter, number> = CATEGORIES.reduce(
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

function MetricTile({
  metric,
  visible,
  registerNumberRef,
  registerDialRef,
}: {
  metric: Metric
  visible: boolean
  registerNumberRef: (label: string, el: HTMLSpanElement | null) => void
  registerDialRef: (label: string, el: SVGCircleElement | null) => void
}) {
  const { prefix, number, suffix, decimals } = parseValue(metric.value)
  const finalText = Number(number).toFixed(decimals)
  const primaryGroup = metric.groups?.[0] as CategoryName | undefined
  const ringColor = (primaryGroup && CATEGORY_ACCENT[primaryGroup]) || 'var(--color-accent-500)'

  return (
    <li
      hidden={!visible}
      className="metric-tile group relative overflow-hidden rounded-lg border border-neutral-800 bg-ground-2 p-5"
    >
      <span
        aria-hidden="true"
        className="metric-rule absolute inset-x-0 top-0 h-0.5 origin-left bg-accent-500 transition-colors duration-300 group-hover:bg-accent-300"
        style={{ transform: 'scaleX(0)' }}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-3xl font-semibold tabular-nums text-ink md:text-4xl">
          {/* Screen readers get the canonical value; the animated digits are decorative. */}
          <span className="sr-only">{metric.value}</span>
          <span aria-hidden="true">
            {prefix ? <span className="text-accent-500">{prefix}</span> : null}
            <span ref={(el) => registerNumberRef(metric.label, el)} className="metric-number">
              {finalText}
            </span>
            {suffix ? <span className="text-2xl text-accent-500 md:text-3xl">{suffix}</span> : null}
          </span>
        </p>
        {/* Data-dial — a literal instrument reading beside the number, filling in
            sync with the count-up tween (see animateCounts). Starts fully filled
            (matches the pre-rendered final number) until a filter click resets it. */}
        <svg aria-hidden="true" viewBox="0 0 36 36" className="metric-dial h-8 w-8 flex-none -rotate-90">
          <circle cx="18" cy="18" r={RING_R} fill="none" stroke="var(--color-neutral-800)" strokeWidth="2" />
          <circle
            ref={(el) => registerDialRef(metric.label, el)}
            cx="18"
            cy="18"
            r={RING_R}
            fill="none"
            stroke={ringColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={0}
          />
        </svg>
      </div>
      <p className="hud-label mt-3">{metric.label}</p>
      {metric.source ? <p className="mt-1 text-[11px] text-neutral-500">{metric.source}</p> : null}
    </li>
  )
}

export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [filter, setFilter] = useState<Filter>('All')
  const numberRefs = useRef(new Map<string, HTMLSpanElement>())
  const dialRefs = useRef(new Map<string, SVGCircleElement>())
  const activeTweens = useRef(new Map<string, gsap.core.Tween>())
  const gridSweepRef = useRef<HTMLSpanElement>(null)

  const registerNumberRef = (label: string, el: HTMLSpanElement | null) => {
    if (el) numberRefs.current.set(label, el)
    else numberRefs.current.delete(label)
  }

  const registerDialRef = (label: string, el: SVGCircleElement | null) => {
    if (el) dialRefs.current.set(label, el)
    else dialRefs.current.delete(label)
  }

  /** Tweens the currently-matching metrics' numbers from 0 to target, and their
   *  data-dial rings in step. Used both for the first scroll-into-view reveal and
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
      const dial = dialRefs.current.get(m.label)
      const proxy = { value: 0 }
      el.textContent = proxy.value.toFixed(decimals)
      if (dial) dial.style.strokeDashoffset = String(RING_CIRC)
      const tween = gsap.to(proxy, {
        value: numericTarget,
        duration: 1.1,
        delay: i * staggerEach,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = proxy.value.toFixed(decimals)
          if (dial) dial.style.strokeDashoffset = String(numericTarget === 0 ? 0 : RING_CIRC * (1 - proxy.value / numericTarget))
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

  const toggleSegment = (cat: CategoryName) => {
    const next: Filter = filter === cat ? 'All' : cat
    setFilter(next)
    animateCounts(next, 0.03)
    fireGridSweep()
  }

  useGSAP(
    () => {
      const heads = gsap.utils.toArray<HTMLElement>('.index-head')
      const tiles = gsap.utils.toArray<HTMLElement>('.metric-tile')
      const rules = gsap.utils.toArray<HTMLElement>('.metric-rule')

      if (reducedMotion) {
        gsap.set([...heads, ...tiles], { autoAlpha: 1, y: 0 })
        gsap.set(rules, { scaleX: 1 })
        return
      }

      gsap.set(tiles, { autoAlpha: 0, y: 24 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
          onEnter: () => animateCounts('All', 0.05),
        },
      })

      tl.fromTo(heads, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0)
      tl.to(tiles, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.15)
      tl.to(rules, { scaleX: 1, duration: 0.5, stagger: 0.06 }, 0.2)
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
      className="relative isolate px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <ClipReveal>
          <Decrypt as="p" className="index-head hud-label section-kicker" text="05 · index" />
          <SectionSweep />

          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2
              id="index-heading"
              className="index-head text-3xl font-semibold text-ink md:text-4xl"
            >
              <SplitText as="span">Measured, not claimed.</SplitText>
            </h2>
            <p
              className="index-head font-mono text-xs tracking-[0.14em] text-neutral-500"
              aria-live="polite"
            >
              {shownCount} of {TOTAL_COUNT} figures shown · filtered by category below.
            </p>
          </div>

          {/* Category composition bar — segment width is each category's share of
              metrics by PRIMARY group (groups[0]); clicking one filters to it. */}
          <div className="index-head mt-8 flex h-2 gap-px bg-ground">
            {CATEGORIES.map((cat) => {
              const dimmed = filter !== 'All' && filter !== cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleSegment(cat)}
                  aria-pressed={filter === cat}
                  aria-label={`${cat} — ${compositionCounts[cat]} of ${TOTAL_COUNT} figures by primary category`}
                  className={`h-full transition-opacity duration-200 hover:opacity-100 ${dimmed ? 'opacity-[0.35]' : 'opacity-100'}`}
                  style={{ flex: `${compositionCounts[cat]} 0 0`, background: CATEGORY_ACCENT[cat] }}
                />
              )
            })}
          </div>

          {/* Filter pills — counts here are any-group matches, not primary-only. */}
          <div
            role="group"
            aria-label="Filter metrics by category"
            className="index-head mt-4 inline-flex flex-wrap gap-1 rounded-full border border-neutral-800 p-1"
          >
            {FILTERS.map((name) => {
              const active = filter === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectFilter(name)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 font-mono text-xs tracking-[0.08em] transition-colors duration-200 ${
                    active ? 'bg-accent-500 text-ground' : 'text-neutral-500 hover:text-ink'
                  }`}
                >
                  {name} ({pillCounts[name]})
                </button>
              )
            })}
          </div>

          <div className="relative mt-10">
            <span
              ref={gridSweepRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-accent-500 opacity-0"
            />
            <ul className="index-head grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 md:gap-4">
              {headlineMetrics.map((metric) => {
                const visible = filter === 'All' || (metric.groups?.includes(filter) ?? false)
                return (
                  <MetricTile
                    key={metric.label}
                    metric={metric}
                    visible={visible}
                    registerNumberRef={registerNumberRef}
                    registerDialRef={registerDialRef}
                  />
                )
              })}
            </ul>
          </div>
        </ClipReveal>
      </div>
    </section>
  )
}
