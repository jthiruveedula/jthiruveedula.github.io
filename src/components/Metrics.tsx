import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { ERA_COLORS, type Era, type Metric } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Era accent inference — keeps tiles color-coded to the site's story
 * (amber → legacy, cyan → cloud, violet → AI) without hard-coding indices,
 * so reordering or editing headlineMetrics degrades gracefully to cyan.
 */
function eraFor(label: string): Era {
  const l = label.toLowerCase()
  if (l.includes('rag') || l.includes('ticket') || l.includes('llm') || l.includes(' ai')) return 'ai'
  if (l.includes('year')) return 'legacy'
  return 'cloud'
}

function decimalsFor(n: number): number {
  return Number.isInteger(n) ? 0 : 1
}

function MetricTile({ metric }: { metric: Metric }) {
  const color = ERA_COLORS[eraFor(metric.label)]
  const numeric = metric.numeric

  return (
    <li
      className="metric-tile glass-panel relative overflow-hidden rounded-xl p-5 transition-colors duration-300 hover:border-panel-edge md:p-6"
    >
      {/* Accent hairline + telemetry dot */}
      <span
        aria-hidden="true"
        className="absolute inset-x-4 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <span
        aria-hidden="true"
        className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />

      <p className="font-display text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">
        {/* Screen readers get the canonical value; the animated digits are decorative. */}
        <span className="sr-only">{metric.value}</span>
        <span aria-hidden="true">
          {metric.prefix ? <span style={{ color }}>{metric.prefix}</span> : null}
          {typeof numeric === 'number' ? (
            <span
              className="metric-number text-ink"
              data-target={numeric}
              data-decimals={decimalsFor(numeric)}
              data-final={numeric.toFixed(decimalsFor(numeric))}
            >
              {numeric.toFixed(decimalsFor(numeric))}
            </span>
          ) : (
            <span className="text-ink">{metric.value}</span>
          )}
          {metric.suffix ? (
            <span className="text-2xl md:text-3xl" style={{ color }}>
              {metric.suffix}
            </span>
          ) : null}
        </span>
      </p>
      <p className="hud-label mt-3 normal-case tracking-[0.14em]">{metric.label}</p>
    </li>
  )
}

export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { headlineMetrics, certifications } = portfolio

  useGSAP(
    () => {
      const numbers = gsap.utils.toArray<HTMLElement>('.metric-number')

      if (reducedMotion) {
        // If motion preference flips mid-flight, pin every counter to its final value.
        numbers.forEach((el) => {
          if (el.dataset.final) el.textContent = el.dataset.final
        })
        return
      }

      const tiles = gsap.utils.toArray<HTMLElement>('.metric-tile')
      const pills = gsap.utils.toArray<HTMLElement>('.cert-pill')

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })

      tl.fromTo(
        '.impact-head',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 },
        0,
      )
      tl.fromTo(
        tiles,
        { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 },
        0.15,
      )

      // Count-up: each tile's digits roll from 0 to their target as it lands.
      numbers.forEach((el, i) => {
        const target = Number(el.dataset.target)
        const decimals = Number(el.dataset.decimals) || 0
        if (!Number.isFinite(target)) return
        const proxy = { value: 0 }
        el.textContent = proxy.value.toFixed(decimals)
        tl.to(
          proxy,
          {
            value: target,
            duration: 1.3,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = proxy.value.toFixed(decimals)
            },
          },
          0.25 + i * 0.08,
        )
      })

      tl.fromTo(
        pills,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 },
        0.9,
      )
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="impact"
      aria-labelledby="impact-heading"
      className="relative isolate px-6 py-24 md:py-32"
    >
      {/* Ambient glow behind the telemetry grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 35%, rgba(34, 211, 238, 0.06), transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-6xl">
        <p className="impact-head hud-label">05 · impact telemetry</p>
        <h2
          id="impact-heading"
          className="impact-head mt-3 text-3xl font-semibold text-ink md:text-4xl"
        >
          Impact, measured
        </h2>
        <p className="impact-head mt-3 max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
          Eleven years across legacy, cloud, and enterprise AI — reduced to the numbers that
          survived production.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:gap-4 lg:grid-cols-4">
          {headlineMetrics.map((metric) => (
            <MetricTile key={metric.label} metric={metric} />
          ))}
        </ul>

        <div className="mt-12 md:mt-16">
          <p className="hud-label">Certifications</p>
          <ul className="mt-4 flex flex-wrap gap-2 md:gap-3">
            {certifications.map((cert) => (
              <li
                key={cert}
                className="cert-pill rounded-full border border-panel-edge bg-panel/60 px-4 py-1.5 font-mono text-xs text-ink-muted"
              >
                {cert}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
