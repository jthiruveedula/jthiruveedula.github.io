import { useCallback, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { useReducedMotion } from '@/lib/hooks'
import { revealFrom } from '@/lib/motion'
import ProjectCard from '@/components/ProjectCard'

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
      className="relative scroll-mt-24 overflow-hidden px-[clamp(20px,4vw,64px)] py-[clamp(64px,10vh,120px)]"
    >
      <div className="mx-auto max-w-[1320px]">
        <header className="max-w-[46ch]">
          <p className="eyebrow">
            <b>03</b> · Systems
          </p>
          <h2 id="systems-heading" className="text-[clamp(1.7rem,3.6vw,2.8rem)]">
            Six systems, open the wiring.
          </h2>
          <p className="mt-5 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.62] text-ink-muted">
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
      </div>
    </section>
  )
}
