import { useCallback, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { useReducedMotion } from '@/lib/hooks'
import { revealFrom } from '@/lib/motion'
import ProjectCard from '@/components/ProjectCard'
import SplitText from '@/components/SplitText'
import Decrypt from '@/components/Decrypt'
import SectionSweep from '@/components/SectionSweep'
import ClipReveal from '@/components/ClipReveal'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const projects = portfolio.featuredProjects
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = useCallback((index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
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
      revealFrom(
        tl,
        '.projects-head .split-word',
        { yPercent: 110, duration: 0.8, stagger: 0.05, ease: 'power3.out' },
        0.1,
      )
      // Cards fade/slide in as one batch from here — not from inside ProjectCard. Two
      // `.from()`/`fromTo()` tweens targeting the same node both record their own
      // from-state as inline style immediately, so a card owning its own entrance on top
      // of this one would race it and could strand the card invisible. ProjectCard's own
      // scroll-driven reveal (the stage-path line/nodes) uses plain CSS transitions keyed
      // off useInView instead, so there's nothing here for it to collide with.
      revealFrom(tl, '.project-card', { y: 24, duration: 0.6, stagger: 0.08 }, 0.15)
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="systems"
      aria-labelledby="systems-heading"
      className="relative scroll-mt-24 overflow-hidden py-24 lg:py-32"
    >
      {/* Ambient accent glow, purely decorative */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-1/4 h-96 w-96 rounded-full bg-accent-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6">
        <ClipReveal>
          <header className="projects-head max-w-3xl">
            <Decrypt as="p" className="projects-reveal hud-label section-kicker" text="04 · systems" />
            <SectionSweep />
            <h2
              id="systems-heading"
              className="projects-reveal mt-4 text-3xl font-semibold text-ink md:text-5xl"
            >
              <SplitText as="span">Six systems, open the wiring.</SplitText>
            </h2>
            <p className="projects-reveal mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
              Each line is a stage the data passed through. Open one for the full build.
            </p>
          </header>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggle(index)}
              />
            ))}
          </div>
        </ClipReveal>
      </div>
    </section>
  )
}
