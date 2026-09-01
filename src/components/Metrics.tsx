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

/** Volumes first — they are the headline claims and each stands alone. Then the six
 *  rates as one contiguous block, because six adjacent bars on a shared axis read as
 *  a chart while six scattered ones read as decoration. The window closes it. */
const FAMILY_ORDER = { volume: 0, rate: 1, window: 2 } as const

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
 * Which of three scales a figure lives on — and therefore which form can honestly
 * show it.
 *
 * Thirteen figures do NOT share an axis. Six are percentages and genuinely compare
 * on 0–100. The rest are $2M, 500 TiB, 1B events, 50M documents, 11 years, 3× — five
 * different units, where a common bar length would be a fabricated comparison. One
 * is a duration where *lower* is better, which is the opposite polarity from
 * everything else and is really a ratio against a limit.
 *
 * So: bars for the rates, weight for the volumes, a meter for the window. Three
 * forms because there are three jobs, not one chart pretending there is one.
 */
type Family = 'rate' | 'volume' | 'window'

function familyOf(metric: Metric): Family {
  const { suffix } = parseValue(metric.value)
  if (suffix.trim() === '%') return 'rate'
  if (suffix.trim() === 'min') return 'window'
  return 'volume'
}

/**
 * `<30 min` is deliberately NOT plotted. It is an upper bound, not a measurement —
 * the dataset says "under thirty minutes", not how long it actually took. Drawing it
 * against a 30-minute limit fills the bar to 100%, which asserts the entire window
 * was consumed: precisely the opposite of the claim. A bound gets a figure and a
 * label; only a measured value gets a bar.
 */

/** What each band is measured against — said once per band rather than once per row. */
const BANDS: readonly { family: Family; caption: string }[] = [
  { family: 'volume', caption: 'Volumes · each on its own scale' },
  { family: 'rate', caption: 'Rates · measured against 100%' },
  { family: 'window', caption: 'Window · an upper bound, not a measurement' },
]

const ORDERED_METRICS = [...headlineMetrics].sort(
  (a, b) => FAMILY_ORDER[familyOf(a)] - FAMILY_ORDER[familyOf(b)],
)

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
  const family = familyOf(metric)
  // Rates plot themselves; the window plots as the share of its limit it consumed,
  // so a shorter bar is the better outcome — which the "of 30 min" label states
  // outright rather than leaving the reader to infer a flipped polarity.
  const pct = family === 'rate' ? Math.min(100, Number(number)) : 0

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

        {/* The bar is the encoding; the figure beside it is the exact read. Length
            only — one hue, because colour here would be a second encoding of the
            same variable. The track is drawn so an empty bar still reads as "0 of
            100" rather than as a missing element. */}
        {family === 'rate' ? (
          <div className="metric-plot mt-3">
            <div className="relative h-[6px] w-full max-w-[26rem] bg-paper-2" aria-hidden="true">
              <span
                className="metric-bar absolute inset-y-0 left-0 w-full origin-left bg-accent"
                data-pct={pct}
                /* The true length is the authored resting state, so a no-JS or
                   reduced-motion visitor sees the real bar rather than an empty
                   track. The reveal only plays it forward from zero. */
                style={{ transform: `scaleX(${pct / 100})` }}
              />
            </div>
          </div>
        ) : null}
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

      // Bars play forward from zero to the length already authored in the markup.
      // fromTo with an explicit end, never .from() — a reverted context must not be
      // able to strand a bar at scaleX(0), which would silently read as "0%".
      gsap.utils.toArray<HTMLElement>('.metric-bar').forEach((bar, i) => {
        const target = Number(bar.dataset.pct ?? 0) / 100
        tl.fromTo(
          bar,
          { scaleX: 0 },
          // No clearProps here: the inline transform is the bar's LENGTH, not a
          // leftover from the animation. Clearing it snapped every bar to full width.
          { scaleX: target, duration: 0.85, ease: 'power3.out' },
          0.3 + i * 0.05,
        )
      })
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
          {BANDS.map(({ family, caption }) => {
            const rows = ORDERED_METRICS.filter((m) => familyOf(m) === family)
            const anyVisible = rows.some(
              (m) => filter === 'All' || (m.groups?.includes(filter) ?? false),
            )
            return (
              <section key={family} hidden={!anyVisible} aria-label={caption}>
                <p className="metric-row stat__label border-b border-rule py-3 text-ink-faint">
                  {caption}
                </p>
                <ul>
                  {rows.map((metric) => {
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
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
