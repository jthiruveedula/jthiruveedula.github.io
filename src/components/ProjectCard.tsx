import { Fragment } from 'react'
import type { FeaturedProject, ProjectFlow, ProjectStage } from '@/data/types'
import { useInView, useReducedMotion } from '@/lib/hooks'
import { domainSlug, pulseDomainRow, techDomain } from '@/lib/skillMatch'

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
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
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
  /** The one large case study leading the section — bigger type, full-width, no
   *  competing badge or box; scale alone carries the hierarchy (goal spec: "create
   *  hierarchy without relying solely on color or boxes"). Everything past this
   *  prop (stage path, expand panel, metrics) is identical to a supporting card. */
  featured?: boolean
  /** The lone trailing card when the supporting grid has an odd count — spans both
   *  columns so it doesn't leave an empty cell beside it. Width only, no type-scale
   *  change (that's `featured`'s job); the two are independent flags. */
  fillRow?: boolean
}

export default function ProjectCard({
  project,
  index,
  isOpen,
  onToggle,
  featured = false,
  fillRow = false,
}: ProjectCardProps) {
  const [cardRef, inView] = useInView<HTMLElement>()
  const reduced = useReducedMotion()
  const spotlight = project.metrics[0]
  const panelId = `stage-detail-${project.id}`

  return (
    <article
      ref={cardRef}
      // Deep-link target — CommandPalette's project entries jump straight to the
      // card itself, not just the section it lives in.
      id={project.id}
      className={`project-card lit-card flex scroll-mt-24 flex-col ${featured ? 'p-8 md:p-12' : 'p-6 md:p-7'}`}
      style={featured || isOpen || fillRow ? { gridColumn: '1 / -1' } : undefined}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] tracking-[0.1em] text-accent">
          {String(index + 1).padStart(2, '0')}
        </span>
        {project.client && <span className="stat__label">{project.client}</span>}
      </div>

      <h3 className={featured ? 'mt-5 text-[clamp(1.6rem,3.2vw,2.5rem)]' : 'mt-4 text-xl md:text-2xl'}>
        {project.name}
      </h3>
      <p className={featured ? 'mt-3 max-w-[52ch] text-base leading-relaxed text-ink-muted' : 'mt-2 text-sm leading-relaxed text-ink-muted'}>
        {project.tagline}
      </p>
      {project.shift && (
        <p className="mt-3 text-sm">
          <span className="text-ink-muted">{project.shift.from}</span>
          <span aria-hidden="true" className="mx-2 text-accent">
            →
          </span>
          <span className="sr-only"> became </span>
          <span className="text-ink">{project.shift.to}</span>
        </p>
      )}
      {spotlight && (
        <p className="mt-4">
          <span className={`stat__figure ${featured ? 'text-[1.9rem]' : 'text-[1.35rem]'}`}>{spotlight.value}</span>
          <span className="stat__label ml-2">{spotlight.label}</span>
        </p>
      )}

      <StagePath flow={project.flow} stages={project.stages} index={index} inView={inView} reduced={reduced} />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="chip mt-6 w-fit"
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
        // aria-hidden alone hides this from the accessibility tree but does not
        // remove its tech-links from the tab order — a keyboard user could tab
        // into a link inside a panel the AT tree says doesn't exist. `inert`
        // (React 19) removes it from both focus and the AX tree while collapsed.
        inert={!isOpen}
        className="grid transition-[grid-template-rows] ease-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transitionDuration: reduced ? '0.01ms' : '450ms',
        }}
      >
        <div className="overflow-hidden">
          <div className="mt-8 border-t border-rule pt-6">
            <p className="max-w-[62ch] text-sm leading-relaxed text-ink-muted">{project.description}</p>

            <div
              className="mt-8 grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}
            >
              {project.stages.map((stage) => (
                <div key={stage.step}>
                  <p className={`font-mono text-[10px] uppercase tracking-[0.1em] ${kindText(stage.kind)}`}>
                    {stage.step}·{stage.kind}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-ink">{stage.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">{stage.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
              {project.metrics.map((m) => (
                <p key={m.label} className="min-w-0">
                  <span className="stat__figure text-[1.35rem]">{m.value}</span>
                  <span className="stat__label ml-2">{m.label}</span>
                </p>
              ))}
            </div>

            <p className="mt-8 font-mono text-[10.5px] tracking-[0.08em] text-ink-faint">
              {project.tech.map((tech, i) => {
                const domain = techDomain(tech)
                return (
                  <Fragment key={tech}>
                    {i > 0 && '  ·  '}
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
          </div>
        </div>
      </div>
    </article>
  )
}
