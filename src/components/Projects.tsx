import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { useReducedMotion } from '@/lib/hooks'
import ProjectCard from '@/components/ProjectCard'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const ERA_LEGEND = [
  { era: 'legacy', label: 'Legacy', dot: 'bg-legacy' },
  { era: 'cloud', label: 'Cloud', dot: 'bg-cloud' },
  { era: 'ai', label: 'Enterprise AI', dot: 'bg-ai' },
] as const

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const projects = portfolio.featuredProjects

  useGSAP(
    () => {
      if (reduced) return
      gsap.from('.projects-reveal', {
        autoAlpha: 0,
        y: 28,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      })
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
        <header className="max-w-3xl">
          <p className="projects-reveal hud-label">04 · featured work</p>
          <h2 className="projects-reveal mt-4 text-3xl font-semibold text-ink md:text-5xl">
            Featured Transformations
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
            />
          ))}
        </div>
      </div>
    </section>
  )
}
