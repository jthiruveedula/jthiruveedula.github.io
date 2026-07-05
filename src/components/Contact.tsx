import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { ERA_COLORS } from '@/data/types'
import { useInView, useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const { profile } = portfolio

const HEADLINE = 'The next era starts with a conversation.'
const ACCENT_WORD = 'era'

interface Channel {
  id: string
  label: string
  value: string
  href: string
  hint: string
  external: boolean
  accentText: string
  hoverClass: string
}

function handleFromUrl(url: string, prefix = ''): string {
  return prefix + url.replace(/^https?:\/\/(www\.)?[^/]+\//, '').replace(/\/+$/, '')
}

const channels: Channel[] = []
if (profile.email) {
  channels.push({
    id: 'email',
    label: 'Email',
    value: profile.email,
    href: `mailto:${profile.email}`,
    hint: 'Direct line — fastest response',
    external: false,
    accentText: 'text-cloud',
    hoverClass: 'hover:border-cloud/50 hover:shadow-glow-cloud focus-visible:border-cloud/50',
  })
}
if (profile.linkedin) {
  channels.push({
    id: 'linkedin',
    label: 'LinkedIn',
    value: handleFromUrl(profile.linkedin, 'in/'),
    href: profile.linkedin,
    hint: 'Career history & endorsements',
    external: true,
    accentText: 'text-ai',
    hoverClass: 'hover:border-ai/50 hover:shadow-glow-ai focus-visible:border-ai/50',
  })
}
if (profile.github) {
  channels.push({
    id: 'github',
    label: 'GitHub',
    value: handleFromUrl(profile.github, '@'),
    href: profile.github,
    hint: 'Code, frameworks & experiments',
    external: true,
    accentText: 'text-legacy',
    hoverClass: 'hover:border-legacy/50 hover:shadow-glow-legacy focus-visible:border-legacy/50',
  })
}
channels.push({
  id: 'resume',
  label: 'Resume',
  value: 'resume.html',
  href: '/resume.html',
  hint: 'Full CV — printable & downloadable',
  external: false,
  accentText: 'text-accent',
  hoverClass: 'hover:border-accent/50 hover:shadow-glow-cloud focus-visible:border-accent/50',
})

export default function Contact() {
  const reduced = useReducedMotion()
  const [sectionRef, inView] = useInView<HTMLElement>()
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
    },
    [],
  )

  const handleCopyEmail = () => {
    if (!profile.email) return
    navigator.clipboard
      .writeText(profile.email)
      .then(() => {
        setCopied(true)
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
        copyTimer.current = window.setTimeout(() => setCopied(false), 2200)
      })
      .catch(() => {
        // Clipboard unavailable (permissions/insecure context) — the mailto card still works.
      })
  }

  // Entrance choreography — scroll-triggered once; skipped entirely under reduced motion
  // (markup is authored in its final visible state, so no-JS/reduced users lose nothing).
  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
      })
      tl.from('.contact-kicker', { y: 24, opacity: 0, duration: 0.6 })
        .from('.headline-word', { yPercent: 120, duration: 0.9, stagger: 0.06 }, '-=0.35')
        .from('.contact-sub', { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.contact-card', { y: 32, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.45')
        .from('.contact-meta', { opacity: 0, duration: 0.8 }, '-=0.35')
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  )

  // Ambient signal beacon — three era-colored ripples radiating from behind the headline.
  // Runs only while the section is on screen and motion is allowed.
  useGSAP(
    () => {
      if (reduced || !inView) return
      gsap.fromTo(
        '.beacon-ring',
        { scale: 0.35, opacity: 0.5, transformOrigin: '50% 50%' },
        {
          scale: 1.15,
          opacity: 0,
          duration: 7.5,
          ease: 'power1.out',
          repeat: -1,
          immediateRender: false,
          stagger: { each: 2.5 },
        },
      )
    },
    { scope: sectionRef, dependencies: [reduced, inView], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative isolate overflow-hidden"
    >
      {/* Static ambient glow — present even under reduced motion */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 62% 48% at 50% 32%, rgba(34, 211, 238, 0.07), transparent 70%)',
        }}
      />

      {/* Signal beacon rings (animated by GSAP; invisible at rest) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        className="pointer-events-none absolute top-[36%] left-1/2 -z-10 w-[min(92vw,680px)] -translate-x-1/2 -translate-y-1/2"
      >
        <circle className="beacon-ring" cx="300" cy="300" r="230" fill="none" stroke={ERA_COLORS.cloud} strokeWidth="1" opacity="0" />
        <circle className="beacon-ring" cx="300" cy="300" r="230" fill="none" stroke={ERA_COLORS.ai} strokeWidth="1" opacity="0" />
        <circle className="beacon-ring" cx="300" cy="300" r="230" fill="none" stroke={ERA_COLORS.legacy} strokeWidth="1" opacity="0" />
      </svg>

      <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-6 pt-28 pb-20 md:pt-36">
        <p className="contact-kicker font-mono text-xs tracking-[0.25em] text-cloud uppercase">
          transmission · channel open
        </p>

        <h2
          id="contact-heading"
          className="mt-5 max-w-3xl text-4xl leading-[1.08] font-semibold text-ink sm:text-5xl md:text-6xl"
        >
          {HEADLINE.split(' ').map((word, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span
                className={
                  word === ACCENT_WORD
                    ? 'headline-word inline-block bg-linear-to-r from-legacy via-cloud to-ai bg-clip-text text-transparent'
                    : 'headline-word inline-block'
                }
              >
                {word}
                {'\u00A0'}
              </span>
            </span>
          ))}
        </h2>

        <p className="contact-sub mt-6 max-w-2xl text-base text-ink-muted md:text-lg">
          I take enterprises from legacy systems through cloud modernization to production AI.
          If your team is planning that journey — or stuck somewhere in the middle of it — I'd
          love to hear about it.
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => (
            <li key={channel.id} className="contact-card">
              <a
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`group flex h-full flex-col gap-3 rounded-xl border border-panel-edge bg-panel/60 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 ${channel.hoverClass}`}
              >
                <span className={`font-mono text-xs tracking-[0.2em] uppercase ${channel.accentText}`}>
                  {channel.label}
                </span>
                <span className="font-mono text-sm break-all text-ink">{channel.value}</span>
                <span className="mt-auto text-xs text-ink-faint">
                  {channel.hint}{' '}
                  <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                  {channel.external && <span className="sr-only">(opens in a new tab)</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {profile.email && (
          <div className="contact-meta mt-6">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-3 rounded-full border border-panel-edge bg-surface px-4 py-2 transition duration-300 hover:border-cloud/50"
            >
              <span className="font-mono text-xs text-ink-muted">{profile.email}</span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase" aria-hidden="true">
                {copied ? <span className="text-success">copied ✓</span> : <span className="text-cloud">copy</span>}
              </span>
            </button>
            <span aria-live="polite" className="sr-only">
              {copied ? 'Email address copied to clipboard' : ''}
            </span>
          </div>
        )}

        <div className="contact-meta mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.15em] text-ink-muted uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-success animate-pulse-slow" />
            status: open to new engagements
          </p>
          {profile.location && (
            <p className="font-mono text-xs tracking-[0.15em] text-ink-faint uppercase">{profile.location}</p>
          )}
        </div>
      </div>

      <footer className="relative border-t border-panel-edge/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-ink-faint">© 2026 {profile.name}. All rights reserved.</p>
          <p className="font-mono text-xs text-ink-faint">React · TypeScript · GSAP · Three.js</p>
          <a
            href="#main"
            className="font-mono text-xs text-ink-muted transition-colors duration-300 hover:text-accent-soft"
          >
            back to top ↑
          </a>
        </div>
      </footer>
    </section>
  )
}
