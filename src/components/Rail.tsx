import { useEffect, useState } from 'react'

/**
 * N3 side-rail nav — replaces the v5 top bar.
 *
 * The old header exposed two destinations (Timeline, Contact) for a page that
 * has five sections, so Systems and Index were only reachable by scrolling past
 * everything else. The rail lists all five and marks the active one, which is
 * the whole reason to have persistent chrome on a single-page site.
 *
 * Desktop: fixed 4.25rem vertical strip. Below 1024px it unsticks into a top bar
 * (a fixed vertical gutter is a quarter of a 320px screen).
 */
const SECTIONS = [
  { id: 'top', label: 'Open' },
  { id: 'arc', label: 'Arc' },
  { id: 'ledger', label: 'Timeline' },
  { id: 'systems', label: 'Systems' },
  { id: 'skills', label: 'Skills' },
  { id: 'index', label: 'Index' },
  { id: 'contact', label: 'Contact' },
] as const

export default function Rail() {
  const [active, setActive] = useState<string>('top')

  useEffect(() => {
    // Deliberately not an IntersectionObserver: four of the six sections are
    // lazy-loaded behind Suspense, so they do not exist when the effect first
    // runs and an observer created here would never see them. Re-reading the
    // rects each frame is cheap (six lookups) and immune to mount order.
    let raf = 0
    const measure = () => {
      raf = 0
      // The active section is the last one whose top has crossed a line a third
      // of the way down the viewport.
      const line = window.innerHeight * 0.34
      let current: string = SECTIONS[0].id
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = section.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <nav className="rail" aria-label="Sections">
      <a href="#top" className="rail__mark proper" aria-label="Jagadeesh Thiruveedula — top of page">
        JT
      </a>
      <ul className="rail__list">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="rail__link"
              aria-current={active === section.id ? 'true' : undefined}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
      <span aria-hidden="true" className="rail__mark text-ink-faint">
        2015—
      </span>
    </nav>
  )
}
