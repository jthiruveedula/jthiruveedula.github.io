import { useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { ERA_COLORS, type FeaturedProject } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'
import { revealFrom } from '@/lib/motion'
import ProjectCard from '@/components/ProjectCard'
import ProjectCaseStudy from '@/components/ProjectCaseStudy'
import SplitText from '@/components/SplitText'
import Decrypt from '@/components/Decrypt'
import SectionSweep from '@/components/SectionSweep'
import ClipReveal from '@/components/ClipReveal'

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip)

const ERA_LEGEND = [
  { era: 'legacy', label: 'Legacy', dot: 'bg-legacy' },
  { era: 'cloud', label: 'Cloud', dot: 'bg-cloud' },
  { era: 'ai', label: 'Enterprise AI', dot: 'bg-ai' },
] as const

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const projects = portfolio.featuredProjects
  const [expandedProject, setExpandedProject] = useState<FeaturedProject | null>(null)
  const [flipState, setFlipState] = useState<Flip.FlipState | null>(null)

  const handleExpand = useCallback((project: FeaturedProject, cardEl: HTMLElement) => {
    if (reduced) {
      setExpandedProject(project)
      return
    }
    const state = Flip.getState(cardEl)
    setFlipState(state)
    setExpandedProject(project)
  }, [reduced])

  const handleClose = useCallback(() => {
    setExpandedProject(null)
    setFlipState(null)
  }, [])

  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          // Replayable, so a rebuilt GSAP context can run the reveal again instead of
          // sitting on a consumed trigger with the from-state still applied.
          toggleActions: 'play none none none',
        },
      })
      revealFrom(tl, '.projects-reveal', { y: 28, duration: 0.7, stagger: 0.1 }, 0)
      // The grid's children are NOT animated here. Each ProjectCard owns its own
      // entrance reveal (and drives its metric count-up from the same timeline), also
      // a `.from(autoAlpha: 0)`. Two `.from()` tweens on one node both render their
      // from-state immediately, so each captured the other's zeroed value as its END
      // state — which left all six cards stuck at opacity 0 / visibility hidden for
      // the rest of the session once both had fired.
      revealFrom(
        tl,
        '.projects-head .split-word',
        { yPercent: 110, duration: 0.8, stagger: 0.05, ease: 'power3.out' },
        0.1,
      )
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-label="Featured projects"
      className="relative scroll-mt-24 overflow-hidden py-24 lg:py-32"
    >
      {/* Ambient era-colored glow, purely decorative */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-1/4 h-96 w-96 rounded-full bg-cloud/5 blur-3xl" />
        <div className="absolute -right-48 bottom-1/4 h-96 w-96 rounded-full bg-ai/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6">
        <ClipReveal>
        <header className="projects-head max-w-3xl">
          <Decrypt as="p" className="projects-reveal hud-label section-kicker" text="04 · featured work" />
          <SectionSweep />
          <h2 className="projects-reveal mt-4 text-3xl font-semibold text-ink md:text-5xl">
            <SplitText as="span">Featured Transformations</SplitText>
          </h2>
          <p className="projects-reveal mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
            Six flagship engagements across three eras — every one shipped to production, every
            number measured against a business SLA.
          </p>
          {/* The aggregate shift the six cards are instances of. Each card shows its own
              from → to; this states what all of them add up to, so the grid reads as one
              body of work rather than six unrelated engagements. Sources are the union of
              the estates migrated; destinations the union of what they landed on. */}
          <div className="projects-reveal mt-7 max-w-2xl rounded-xl border border-panel-edge/70 bg-panel/40 p-5">
            <p className="font-mono text-[11px] leading-relaxed text-ink-faint line-through decoration-ink-faint/50">
              Mainframe · Teradata · Hadoop · Snowflake · AWS
            </p>
            {/* Arrow leads, then the era gradient sweeps away from it. With the rule first
                and the arrow trailing at the right edge, it read as an afterthought rather
                than the operator between the two states. */}
            <p aria-hidden="true" className="my-2 flex items-center gap-2.5">
              <span className="font-mono text-sm leading-none" style={{ color: ERA_COLORS.cloud }}>
                ↓
              </span>
              <span
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(90deg, ${ERA_COLORS.legacy}, ${ERA_COLORS.cloud}, ${ERA_COLORS.ai}, transparent)`,
                }}
              />
            </p>
            <p className="font-mono text-[11px] leading-relaxed font-medium text-ink">
              BigQuery · Dataflow · Databricks · Kafka · Vertex AI · RAG
            </p>
          </div>

          <div className="projects-reveal mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {ERA_LEGEND.map((item) => (
              <span
                key={item.era}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted"
              >
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${item.dot}`} />
                {item.label}
              </span>
            ))}
          </div>
        </header>

        <div data-projects-grid className="mt-14 grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              onExpand={handleExpand}
            />
          ))}
        </div>
        </ClipReveal>
      </div>

      {expandedProject && (
        <ProjectCaseStudy
          project={expandedProject}
          flipState={flipState ?? undefined}
          onClose={handleClose}
        />
      )}
    </section>
  )
}
