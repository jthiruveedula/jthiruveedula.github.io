import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const { profile, certifications } = portfolio

const LABEL_CLASS = 'text-[9px] font-semibold tracking-[0.16em] uppercase text-neutral-500'

/** "DFW (Dallas Fort Worth), TX · Open to relocation · 50% travel" → the city line and
 *  everything after the first "·", kept verbatim (including its own "·"). */
function splitLocation(location: string): [string, string] {
  const i = location.indexOf('·')
  return i === -1 ? [location, ''] : [location.slice(0, i).trim(), location.slice(i + 1).trim()]
}

export default function Contact() {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        })
        .from('.contact-headline', { y: 24, opacity: 0, duration: 0.6 })
        .from('.contact-grid', { y: 24, opacity: 0, duration: 0.6 }, '-=0.35')
        .from('.contact-footer', { opacity: 0, duration: 0.5 }, '-=0.3')
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  )

  const [locationLine, locationDetail] = profile.location ? splitLocation(profile.location) : ['', '']
  const certLine = certifications.join(' · ')

  return (
    <section ref={sectionRef} id="contact" aria-labelledby="contact-heading" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="contact-headline flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="contact-heading" className="font-display text-3xl uppercase text-ink md:text-5xl">
            Let&rsquo;s build the next one.
          </h2>
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex shrink-0 items-center justify-center bg-accent-700 px-5 py-3 text-[11px] font-semibold tracking-[0.16em] uppercase text-white transition-colors hover:bg-accent-600"
            >
              Open a conversation
            </a>
          )}
        </div>

        <div
          className="contact-grid mt-14 grid gap-x-10 gap-y-10"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}
        >
          <div>
            <p className={LABEL_CLASS}>Direct</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className="transition-colors hover:text-ink">
                    {profile.email}
                  </a>
                </li>
              )}
              {profile.linkedin && (
                <li>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-ink"
                  >
                    LinkedIn
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
              {profile.github && (
                <li>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-ink"
                  >
                    GitHub
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className={LABEL_CLASS}>Based</p>
            <p className="mt-4 text-sm text-ink-muted">
              {locationLine}
              {locationDetail && (
                <>
                  <br />
                  {locationDetail}
                </>
              )}
            </p>
          </div>

          <div>
            <p className={LABEL_CLASS}>Certified</p>
            <p className="mt-4 text-sm text-ink-muted">{certLine}</p>
          </div>

          <div>
            <p className={LABEL_CLASS}>Next step</p>
            <a
              href="/resume.html"
              className="mt-4 inline-block border border-ink/25 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/10"
            >
              View résumé
            </a>
          </div>
        </div>

        <footer className="contact-footer mt-16 border-t-2 border-ink/15 pt-6">
          <p className="text-xs text-ink-faint">
            {profile.name} · Legacy → Cloud → Enterprise AI
          </p>
        </footer>
      </div>
    </section>
  )
}
