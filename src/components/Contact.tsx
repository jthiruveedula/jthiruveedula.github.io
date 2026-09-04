import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const { profile, certifications, education } = portfolio

// The theme already has this label: mono, 11px, uppercase, ink-faint. The old
// bespoke 9px version was both smaller than the AA floor allows comfortably and a
// second vocabulary for the same job.
const LABEL_CLASS = 'stat__label'

// Word-split for the headline's staggered entrance (rendered as .contact-word spans
// below) — keep the apostrophe as a real U+2019 char since it's no longer emitted as a
// JSX &rsquo; entity.
const HEADLINE_WORDS = ['Let’s', 'build', 'the', 'next', 'one.']

/** "DFW (Dallas Fort Worth), TX · Open to relocation · 50% travel" → the city line and
 *  everything after the first "·", kept verbatim (including its own "·"). */
function splitLocation(location: string): [string, string] {
  const i = location.indexOf('·')
  return i === -1 ? [location, ''] : [location.slice(0, i).trim(), location.slice(i + 1).trim()]
}

/** "Bachelor of Technology, Electrical Engineering — JNTU, 2015, Hyderabad, India" → the
 *  degree and everything after the em dash. Same split-and-stack the location line
 *  already uses — an education entry is one long sentence otherwise, next to a
 *  Certified column that's a terse list; the degree name is the scannable part. */
function splitEducation(entry: string): [string, string] {
  const i = entry.indexOf('—')
  return i === -1 ? [entry, ''] : [entry.slice(0, i).trim(), entry.slice(i + 1).trim()]
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
        .from('.contact-word', { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 })
        .from('.contact-cta', { y: 24, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.contact-summary', { y: 24, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.contact-grid', { y: 24, opacity: 0, duration: 0.6 }, '-=0.35')
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  )

  const [locationLine, locationDetail] = profile.location ? splitLocation(profile.location) : ['', '']
  const certLine = certifications.join(' · ')

  return (
    <section ref={sectionRef} id="contact" aria-labelledby="contact-heading" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="eyebrow">
          <b>06</b> · Contact
        </p>
        <div className="contact-headline flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative">
            <h2 id="contact-heading" className="font-display text-[clamp(2rem,5vw,3.6rem)] text-ink">
              {HEADLINE_WORDS.map((word, i) => (
                // The trailing space must live OUTSIDE the inline-block span — a browser
                // collapses whitespace at the end of an inline-block's own content, which
                // is what glued every word together ("LET'SBUILDTHENEXTONE.") when the
                // space was the last character inside the span instead of between spans.
                <span key={word + i}>
                  <span className="contact-word inline-block">{word}</span>
                  {i < HEADLINE_WORDS.length - 1 ? ' ' : null}
                </span>
              ))}
            </h2>
          </div>
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="contact-cta chip chip--primary shrink-0"
            >
              Open a conversation
            </a>
          )}
        </div>

        {profile.summary && (
          <p className="contact-summary mt-8 max-w-[62ch] text-[0.95rem] leading-[1.65] text-ink-muted">
            {profile.summary}
          </p>
        )}

        <div
          className="contact-grid mt-14 grid gap-x-10 gap-y-10"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}
        >
          <div>
            <p className={LABEL_CLASS}>Direct</p>
            <ul className="contact-links mt-4 text-sm text-ink-muted">
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

          {education.length > 0 && (
            <div>
              <p className={LABEL_CLASS}>Education</p>
              <ul className="mt-4 space-y-3 text-sm">
                {education.map((entry) => {
                  const [degree, detail] = splitEducation(entry)
                  return (
                    <li key={entry}>
                      <p className="text-ink-muted">{degree}</p>
                      {detail && <p className="mt-0.5 text-xs text-ink-faint">{detail}</p>}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div>
            <p className={LABEL_CLASS}>Next step</p>
            <a
              href="/resume.html"
              className="chip mt-4 inline-flex transition-colors hover:bg-ink/10"
            >
              View résumé
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
