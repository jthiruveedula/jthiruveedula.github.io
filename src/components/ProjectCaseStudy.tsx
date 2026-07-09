import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import type { FeaturedProject } from '@/data/types'
import { ERA_COLORS } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(Flip)

interface ProjectCaseStudyProps {
  project: FeaturedProject
  flipState?: Flip.FlipState
  onClose: () => void
}

export default function ProjectCaseStudy({ project, flipState, onClose }: ProjectCaseStudyProps) {
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [showContent, setShowContent] = useState(reduced)
  const accent = ERA_COLORS[project.era]

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const ctx = gsap.context(() => {
      if (reduced || !flipState) {
        setShowContent(true)
        return
      }
      // FLIP: animate from the source card's state into the full-bleed panel.
      Flip.from(flipState, {
        targets: panel,
        duration: 0.65,
        ease: 'power3.inOut',
        absolute: true,
        zIndex: 100,
        onComplete: () => setShowContent(true),
      })
    }, panel)

    return () => ctx.revert()
  }, [flipState, reduced])

  // Escape closes the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`case-study-title-${project.id}`}
      className="fixed inset-4 z-[100] overflow-hidden rounded-2xl bg-surface shadow-2xl md:inset-6 lg:inset-10"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close case study"
        className="absolute top-4 right-4 z-20 flex size-10 items-center justify-center rounded-full border border-panel-edge bg-void/60 text-ink-muted backdrop-blur-sm transition-colors hover:border-accent hover:text-ink"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 3l10 10M13 3 3 13" />
        </svg>
      </button>

      <div
        ref={contentRef}
        className={`h-full overflow-y-auto p-6 md:p-10 lg:p-14 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="mx-auto max-w-5xl">
          <span
            className="inline-flex rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ borderColor: `${accent}55`, color: accent, background: `${accent}10` }}
          >
            {project.era} era
          </span>
          {project.client && (
            <span className="ml-3 font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">{project.client}</span>
          )}

          <h2 id={`case-study-title-${project.id}`} className="mt-6 font-display text-3xl font-semibold text-ink md:text-5xl">
            {project.name}
          </h2>
          <p className="mt-3 text-lg leading-relaxed md:text-xl" style={{ color: accent }}>
            {project.tagline}
          </p>

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-muted md:text-lg">
            {project.description}
          </p>

          {(project.before || project.after) && (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {project.before && (
                <div className="rounded-xl border-l-2 border-legacy/70 bg-panel/50 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-legacy">Before</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted md:text-base">{project.before}</p>
                </div>
              )}
              {project.after && (
                <div className="rounded-xl border-l-2 bg-panel/50 p-6" style={{ borderColor: accent }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>After</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted md:text-base">{project.after}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-10">
            <h3 className="hud-label">Impact</h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {project.metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-panel-edge bg-panel/40 p-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{m.label}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold text-ink md:text-2xl">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10">
            <h3 className="hud-label">Technology stack</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-panel-edge bg-panel/60 px-3 py-1.5 font-mono text-xs text-ink-muted"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
