import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ERA_COLORS, type Era } from '@/data/types'
import { useReducedMotion } from '@/lib/hooks'
import SplitText from '@/components/SplitText'
import Decrypt from '@/components/Decrypt'
import SectionSweep from '@/components/SectionSweep'
import ClipReveal from '@/components/ClipReveal'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface Pillar {
  index: string
  verb: string
  era: Era | 'accent'
  blurb: string
  principle: string
  /**
   * The engagement that demonstrates this move, and the proof it carries.
   *
   * This section used to be the only one on the page making claims nobody could check —
   * four assertions about method sitting between two sections that are entirely evidence,
   * which is what made it read as filler. Each move now points at the work that proves it,
   * so the section indexes the evidence instead of asserting competence a fourth time.
   */
  proof: { client: string; detail: string }
}

/** The four moves that turn an estate into production — and into a decision. */
const PILLARS: readonly Pillar[] = [
  {
    index: '01',
    verb: 'Architect',
    era: 'legacy',
    blurb:
      'Design resilient data estates and cloud foundations before product code is written — so the platform never has to be rebuilt.',
    principle: 'The rebuild you avoid is the cheapest thing you ever ship.',
    proof: { client: 'Charles Schwab', detail: 'multi-petabyte estate moved without losing a row' },
  },
  {
    index: '02',
    verb: 'Build',
    era: 'cloud',
    blurb:
      'Assemble streaming and platform systems that hold under real load, not demo load — observable, testable, and boring to operate.',
    principle: 'Demo load proves nothing. Real load, or it is not built.',
    proof: { client: 'HCA Healthcare', detail: '50+ sources streaming under HIPAA audit' },
  },
  {
    index: '03',
    verb: 'Ship',
    era: 'ai',
    blurb:
      'Take GenAI from prototype to production with evaluation and guardrails engineered in, not bolted on after the incident.',
    principle: 'A model without evals is a prototype wearing a deadline.',
    proof: { client: 'John Wiley & Sons', detail: 'RAG in production with evals and guardrails' },
  },
  {
    index: '04',
    verb: 'Communicate',
    era: 'accent',
    blurb:
      'Make the work legible to execs, peers, and operators — so the right decision actually gets made and survives contact.',
    principle: 'Work nobody can explain does not survive the next budget cycle.',
    // The strongest version of this claim, and it is literal: the engagement was
    // forward-deployed, embedded with Wiley leadership, shipping for CXO reporting.
    proof: { client: 'John Wiley & Sons', detail: 'forward-deployed with leadership, CXO reporting' },
  },
]

const COLOR: Record<Pillar['era'], string> = {
  legacy: ERA_COLORS.legacy,
  cloud: ERA_COLORS.cloud,
  ai: ERA_COLORS.ai,
  accent: ERA_COLORS.cloud,
}

export default function OperatingModel() {
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const spineFillRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const heads = gsap.utils.toArray<HTMLElement>('[data-om-head]')
      const cards = gsap.utils.toArray<HTMLElement>('.om-card')

      if (reducedMotion) {
        gsap.set([...heads, ...cards], { autoAlpha: 1, y: 0 })
        const nodes = gsap.utils.toArray<HTMLElement>('[data-om-node]')
        gsap.set(spineFillRef.current, { height: '100%' })
        nodes.forEach((node, i) => gsap.set(node, { backgroundColor: COLOR[PILLARS[i].era], scale: 1.3 }))
        return
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      })
      tl.fromTo(heads, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0)
      tl.fromTo(
        '.om-card .split-word',
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.04, ease: 'power3.out' },
        0.1,
      )
      tl.fromTo(cards, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.2)

      // Signature: the operating spine draws down and each node ignites in turn.
      const nodes = gsap.utils.toArray<HTMLElement>('[data-om-node]')
      tl.fromTo(
        spineFillRef.current,
        { height: '0%' },
        { height: '100%', duration: 1.2, ease: 'power2.out' },
        0.2,
      )
      nodes.forEach((node, i) => {
        tl.to(
          node,
          {
            backgroundColor: COLOR[PILLARS[i].era],
            scale: 1.4,
            boxShadow: `0 0 14px ${COLOR[PILLARS[i].era]}`,
            duration: 0.45,
            ease: 'back.out(2)',
          },
          0.25 + i * 0.24,
        )
      })
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="approach"
      aria-labelledby="approach-heading"
      className="relative isolate px-6 py-24 md:py-32"
    >
      {/* Ambient glow — quiet signal spine through the pillars */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 30%, rgba(167, 139, 250, 0.07), transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-6xl">
        <ClipReveal>
        <p data-om-head className="hud-label section-kicker">
          <Decrypt as="span" text="03 · operating model" />
        </p>
        <SectionSweep />
        <h2
          id="approach-heading"
          data-om-head
          className="mt-3 text-3xl font-semibold text-ink md:text-4xl"
        >
          <SplitText as="span">One operator, four moves</SplitText>
        </h2>
        <p data-om-head className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
          From estate to production to the room where the decision gets made — the loop I run on
          every engagement, each move with the engagement that proves it.
        </p>

        <div className="relative mt-12">
          {/* Operating spine — the loop made visible. Draws as pillars reveal. */}
          <div
            aria-hidden="true"
            className="absolute left-2 top-1 bottom-1 w-px -translate-x-1/2 md:left-3"
          >
            <span className="absolute inset-0 rounded-full bg-panel-edge" />
            <span
              ref={spineFillRef}
              className="absolute inset-x-0 top-0 h-0 origin-top rounded-full"
              style={{
                background:
                  'linear-gradient(to bottom, #f59e0b 0%, #22d3ee 48%, #a78bfa 74%, #22d3ee 100%)',
              }}
            />
            {PILLARS.map((pillar, i) => (
              <span
                key={pillar.verb}
                data-om-node={i}
                className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-panel-edge bg-void transition-transform"
                style={{ top: `${((i + 0.5) / PILLARS.length) * 100}%` }}
              />
            ))}
          </div>

          <div className="grid gap-4 pl-8 md:grid-cols-2 md:pl-12">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.verb}
                className="om-card glass-panel tilt-card relative flex flex-col gap-3 overflow-hidden rounded-2xl border-t-2 bg-panel/60 p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1"
                style={{ borderTopColor: COLOR[pillar.era] }}
              >
              {/* Era hairline */}
              <span
                aria-hidden="true"
                className="absolute inset-x-4 top-0 h-px opacity-70"
                style={{ background: `linear-gradient(90deg, transparent, ${COLOR[pillar.era]}, transparent)` }}
              />

              <div className="flex items-baseline justify-between">
                <span
                  className="font-mono text-xs tracking-[0.2em]"
                  style={{ color: COLOR[pillar.era] }}
                >
                  {pillar.index}
                </span>
                <span
                  className="font-display text-2xl font-semibold"
                  style={{ color: COLOR[pillar.era] }}
                >
                  <SplitText as="span">{pillar.verb}</SplitText>
                </span>
              </div>

              <p className="text-sm leading-relaxed text-ink-muted">{pillar.blurb}</p>

              {/* The principle each move exists to protect. This line used to recite
                  metrics that already appear in Projects, the Timeline and Impact — the
                  section's job is method, so it now carries the failure mode instead. */}
              {/* Sentence case, not mono caps: the old line was a label-like metric list,
                  this is a sentence, and caps at this length reads as shouting and wraps
                  awkwardly. Era-tinted rule ties it to the card's move. */}
              <p
                className="border-l-2 pl-3 text-[0.8rem] leading-snug text-ink-muted italic"
                style={{ borderColor: `${COLOR[pillar.era]}66` }}
              >
                {pillar.principle}
              </p>

              {/* Where this move was actually made. Anchors to Projects, which is the
                  section holding the before/after and the numbers — so the claim above is
                  one click from its evidence rather than left standing on its own. */}
              <a
                href="#projects"
                className="group/proof mt-auto flex items-baseline gap-2 border-t border-panel-edge/60 pt-3.5 font-mono text-[11px] transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.3rem] size-1.5 shrink-0 rounded-full"
                  style={{ background: COLOR[pillar.era] }}
                />
                <span className="text-ink-muted group-hover/proof:text-ink">
                  <span className="text-ink">{pillar.proof.client}</span>
                  {' — '}
                  {pillar.proof.detail}
                </span>
                <span
                  aria-hidden="true"
                  className="ml-auto shrink-0 self-center text-ink-faint transition-transform duration-300 group-hover/proof:translate-x-0.5"
                >
                  →
                </span>
                <span className="sr-only">— see the featured work</span>
              </a>
            </article>
          ))}
          </div>
        </div>
        </ClipReveal>
      </div>
    </section>
  )
}
