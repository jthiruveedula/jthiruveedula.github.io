import { useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import type { FeaturedProject } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'
import ProjectCard from '@/components/ProjectCard'
import ProjectCaseStudy from '@/components/ProjectCaseStudy'
import SplitText from '@/components/SplitText'
import SectionSweep from '@/components/SectionSweep'

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
          once: true,
        },
      })
      tl.from('.projects-reveal', { autoAlpha: 0, y: 28, duration: 0.7, stagger: 0.1 }, 0)
      tl.from(
        '.projects-head .split-word',
        { yPercent: 110, autoAlpha: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out' },
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
        <header className="projects-head max-w-3xl">
          <p className="projects-reveal hud-label section-kicker">05 · featured work</p>
          <SectionSweep />
          <h2 className="projects-reveal mt-4 text-3xl font-semibold text-ink md:text-5xl">
            <SplitText as="span">Featured Transformations</SplitText>
          </h2>
          <p className="projects-reveal mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
            Six flagship engagements across three eras — every one shipped to production, every
            number measured against a business SLA.
          </p>
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

        <div className="mt-14 grid gap-6 md:grid-cols-2">
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
