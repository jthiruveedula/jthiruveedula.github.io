import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { useReducedMotion } from '@/lib/hooks'
import { revealFrom } from '@/lib/motion'
import ProjectCard from '@/components/ProjectCard'
import { HEADER_OFFSET, useLenis } from '@/components/SmoothScroll'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Leads the section as the one large featured case study — the most recent and
 *  technically deepest of the six (production GenAI: RAG + multi-agent platform).
 *  Everything else renders as the supporting grid at its regular size. This is the
 *  "one featured large case study, rest as a tighter grid" layout the goal spec
 *  asks for instead of six equal-weight cards. */
const FEATURED_ID = 'wiley-private-llm-rag'

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  // Featured project first, everything else keeps its original relative order.
  const projects = [...portfolio.featuredProjects].sort((a, b) =>
    a.id === FEATURED_ID ? -1 : b.id === FEATURED_ID ? 1 : 0,
  )
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  // Open state mirrors into the hash with replaceState (no history entries, no
  // hashchange). Closing clears it only if it still names this card.
  const toggle = useCallback(
    (index: number) => {
      const id = projects[index].id
      const opening = openIndex !== index
      setOpenIndex(opening ? index : null)
      if (opening) history.replaceState(null, '', `#${id}`)
      else if (window.location.hash === `#${id}`)
        history.replaceState(null, '', window.location.pathname + window.location.search)
    },
    [openIndex],
  )

  // Deep link: a hash naming a case study opens it and scrolls to it, on load and
  // on hashchange. Scroll waits two frames — opening spans the card across the
  // grid, so its position is only final after that reflow.
  useEffect(() => {
    let r1 = 0
    let r2 = 0
    const open = (immediate: boolean) => {
      let id: string
      try {
        id = decodeURIComponent(window.location.hash.slice(1))
      } catch {
        return // malformed hash (e.g. #100%)
      }
      const index = projects.findIndex((p) => p.id === id)
      if (index < 0) return
      setOpenIndex(index)
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          const el = document.getElementById(id)
          if (!el) return
          if (!immediate) {
            // Move focus to the opened card (not on load, so it never steals focus).
            if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
            el.focus({ preventScroll: true })
          }
          const l = lenisRef.current
          if (l) {
            l.resize()
            l.scrollTo(el, { offset: -HEADER_OFFSET, immediate })
          } else {
            const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
            window.scrollTo({ top, behavior: immediate || reduced ? 'auto' : 'smooth' })
          }
        })
      })
    }
    open(true)
    const onHash = () => open(false)
    window.addEventListener('hashchange', onHash)
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      window.removeEventListener('hashchange', onHash)
    }
  }, [reduced])

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
          {projects.map((project, index) => {
            // The featured card spans both columns on its own; everything after it
            // sits in the regular 2-col grid. An odd count there leaves the last
            // card alone with an empty cell beside it — span it too instead.
            const supportingCount = projects.length - 1
            const isTrailingOdd =
              project.id !== FEATURED_ID && index === projects.length - 1 && supportingCount % 2 === 1
            return (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggle(index)}
                featured={project.id === FEATURED_ID}
                fillRow={isTrailingOdd}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
