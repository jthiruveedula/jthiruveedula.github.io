import { Fragment } from 'react'
import type { FeaturedProject, ProjectFlow, ProjectStage } from '@/data/types'
import { useInView, useReducedMotion } from '@/lib/hooks'

/** Only these stage kinds get the cyan accent tint — everything else (including the
 *  named Source/Corpus group) reads as neutral. See the Systems section spec: "gray
 *  resolving into cyan", not a kind-by-kind rainbow. */
const ACCENT_KINDS = new Set(['Target', 'Serve', 'Govern'])
const kindText = (kind: string) => (ACCENT_KINDS.has(kind) ? 'text-accent-500' : 'text-neutral-500')
const kindDot = (kind: string) => (ACCENT_KINDS.has(kind) ? 'bg-accent-500' : 'bg-neutral-500')

/** Exact per-flow loop durations for the om-travel-* keyframes (globals.css). */
const FLOW_DURATION: Record<ProjectFlow, string> = {
  roundtrip: '4.6s',
  batch: '5.2s',
  gate: '4.2s',
  stream: '2.6s',
}

/** Small fixed lag (seconds) so the ghost trail copy reads as behind the lead dot,
 *  not ahead of it. A *larger* animation-delay starts an identical infinite-loop
 *  animation later, so at any shared instant its progress along the same keyframes
 *  is behind the lead dot's by exactly this amount — a negative delay would instead
 *  read as leading (or, on the wrap, as nearly a full lap behind). */
const GHOST_LAG = 0.12

/** The horizontal baseline + traveling dot(s) + stage nodes. One per card. */
function StagePath({
  flow,
  stages,
  index,
  inView,
  reduced,
}: {
  flow: ProjectFlow
  stages: ProjectStage[]
  index: number
  inView: boolean
  reduced: boolean
}) {
  const dotCount = flow === 'stream' ? 3 : 1
  const segments = stages.length - 1

  return (
    <div className="mt-6">
      <div className="relative h-4">
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-neutral-800" />
        {/* Per-segment draw-in, keyed to match each stage node's own reveal delay
            (j * 90ms below) so the line visibly reaches a node as it pops in,
            instead of one full-width tween running on an unrelated stagger. */}
        {segments > 0 &&
          stages.slice(0, -1).map((stage, j) => (
            <span
              key={`seg-${stage.step}`}
              aria-hidden="true"
              className="absolute top-1/2 h-px origin-left -translate-y-1/2 bg-neutral-600 transition-transform duration-500 ease-out"
              style={{
                left: `${(j / segments) * 100}%`,
                width: `${(1 / segments) * 100}%`,
                transform: inView ? 'scaleX(1)' : 'scaleX(0)',
                transitionDelay: `${(j + 1) * 90}ms`,
              }}
            />
          ))}
        {!reduced &&
          Array.from({ length: dotCount }, (_, d) => {
            const delay = index * 0.35 + d * 0.7
            return (
              <Fragment key={d}>
                {/* Fading ghost copy, offset a touch behind the lead dot along the same
                    path — reads as a signal pulse traveling a wire, not a teleporting
                    dot. Pure CSS (shared keyframes, no per-frame JS), no box-shadow. */}
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-accent-500/35"
                  style={{
                    animationName: `om-travel-${flow}`,
                    animationDuration: FLOW_DURATION[flow],
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${delay + GHOST_LAG}s`,
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent-500"
                  style={{
                    animationName: `om-travel-${flow}`,
                    animationDuration: FLOW_DURATION[flow],
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${delay}s`,
                  }}
                />
              </Fragment>
            )
          })}
      </div>

      <div className="relative mt-3 min-h-10">
        {stages.map((stage, j) => {
          const isFirst = j === 0
          const isLast = j === stages.length - 1
          return (
            <div
              key={stage.step}
              className="absolute top-0"
              style={{ left: `${(j / (stages.length - 1)) * 100}%` }}
            >
              <span
                aria-hidden="true"
                className={`block size-2 rounded-full transition-[transform,opacity] duration-500 ${kindDot(stage.kind)}`}
                style={{
                  transform: inView ? 'scale(1)' : 'scale(0)',
                  opacity: inView ? 1 : 0,
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: `${j * 90}ms`,
                }}
              />
              <span
                className={`mt-1.5 block whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] ${kindText(stage.kind)} ${
                  isFirst ? '' : isLast ? '-translate-x-full' : '-translate-x-1/2'
                }`}
              >
                {stage.kind}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ProjectCardProps {
  project: FeaturedProject
  index: number
  isOpen: boolean
  onToggle: () => void
}

export default function ProjectCard({ project, index, isOpen, onToggle }: ProjectCardProps) {
  const [cardRef, inView] = useInView<HTMLElement>()
  const reduced = useReducedMotion()
  const spotlight = project.metrics[0]
  const panelId = `stage-detail-${project.id}`

  return (
    <article
      ref={cardRef}
      className={`project-card relative flex flex-col border p-6 transition-colors duration-300 md:p-7 ${
        isOpen ? 'border-neutral-700 bg-accent-500/5' : 'border-neutral-800 bg-panel/30 hover:border-neutral-600'
      }`}
      style={isOpen ? { gridColumn: '1 / -1' } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-neutral-500">{String(index + 1).padStart(2, '0')}</span>
          {project.client && (
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-accent-500">{project.client}</span>
          )}
        </div>
        {spotlight && (
          <span className="font-display text-2xl font-semibold text-accent-500 md:text-3xl">{spotlight.value}</span>
        )}
      </div>

      <h3 className="mt-4 text-xl font-semibold text-ink md:text-2xl">{project.name}</h3>
      {spotlight && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          {project.tagline} · {spotlight.label}
        </p>
      )}

      <StagePath flow={project.flow} stages={project.stages} index={index} inView={inView} reduced={reduced} />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="mt-6 inline-flex w-fit min-h-11 items-center border border-neutral-700 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-500 transition-colors hover:bg-accent-500/10"
      >
        {isOpen ? '− Hide the build' : '+ Open the wiring'}
      </button>

      {/* Always mounted so aria-controls resolves to a real node and the reveal can
          animate — grid-template-rows 0fr→1fr collapses/expands the row, the inner
          overflow-hidden div clips content at zero height. Reduced motion snaps the
          row size instantly (0.01ms) instead of skipping the technique. */}
      <div
        id={panelId}
        aria-hidden={!isOpen}
        className="grid transition-[grid-template-rows] ease-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transitionDuration: reduced ? '0.01ms' : '450ms',
        }}
      >
        <div className="overflow-hidden">
          <div className="mt-8 border-t border-neutral-800 pt-6">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}
            >
              {project.stages.map((stage) => (
                <div key={stage.step}>
                  <p className={`font-mono text-[10px] uppercase tracking-[0.12em] ${kindText(stage.kind)}`}>
                    {stage.step}·{stage.kind}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-ink">{stage.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">{stage.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(90px,1fr))' }}>
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <p className="font-display text-xl font-semibold text-accent-500 md:text-2xl">{m.value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">{m.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 font-mono text-xs text-neutral-400">{project.tech.join('  ·  ')}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
