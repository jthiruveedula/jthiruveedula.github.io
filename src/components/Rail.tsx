import { useEffect, useRef, useState } from 'react'
import { useMagnetic } from '@/components/JourneyPortal'

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
export const SECTIONS = [
  { id: 'top', label: 'Open' },
  { id: 'arc', label: 'Arc' },
  { id: 'ledger', label: 'Timeline' },
  { id: 'systems', label: 'Systems' },
  { id: 'skills', label: 'Skills' },
  { id: 'index', label: 'Index' },
  { id: 'contact', label: 'Contact' },
] as const

/** The event CommandPalette listens for — see its own file. Kept here, next to
 *  the list it opens onto a view of, rather than in a third shared module. */
export const OPEN_COMMAND_PALETTE = 'command-palette:open'

/** The reverse of the above: CommandPalette dispatches this (detail: open/closed)
 *  whenever its own open state changes, so the Search button that requested it
 *  can report `aria-expanded` truthfully instead of assuming its own click always
 *  wins (Escape, an outside click, or a fired command all close it independently). */
export const COMMAND_PALETTE_STATE = 'command-palette:state'

function RailItem({ href, label, current }: { href: string; label: string; current: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnetic(ref, { strength: 0.2, radius: 60 })
  return (
    <a ref={ref} href={href} className="rail__link" aria-current={current ? 'true' : undefined}>
      {label}
    </a>
  )
}

export default function Rail() {
  const [active, setActive] = useState<string>('top')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)

  // Top-bar layout only: keep the active link inside the scrolling list. Scrolls
  // the list itself (never the page), and only when the list overflows sideways.
  useEffect(() => {
    const list = listRef.current
    const link = list?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!list || !link || list.scrollWidth <= list.clientWidth) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    list.scrollTo({
      left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [active])

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

  useEffect(() => {
    const onState = (e: Event) => setPaletteOpen((e as CustomEvent<boolean>).detail)
    window.addEventListener(COMMAND_PALETTE_STATE, onState)
    return () => window.removeEventListener(COMMAND_PALETTE_STATE, onState)
  }, [])

  return (
    <nav className="rail" aria-label="Sections">
      <a href="#top" className="rail__mark proper" aria-label="Jagadeesh Thiruveedula — top of page">
        JT
      </a>
      <ul ref={listRef} className="rail__list">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <RailItem href={`#${section.id}`} label={section.label} current={active === section.id} />
          </li>
        ))}
        {/* Same visual language as the destinations above it — not a destination
            itself, so no `aria-current`, and a real `<button>` rather than a
            fragment-link `<a>` since it opens a dialog instead of navigating. */}
        <li>
          <button
            type="button"
            className="rail__link"
            aria-haspopup="dialog"
            aria-expanded={paletteOpen}
            aria-keyshortcuts="Meta+K Control+K"
            onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE))}
          >
            Search
          </button>
        </li>
      </ul>
      <span aria-hidden="true" className="rail__mark text-ink-faint">
        2015—
      </span>
    </nav>
  )
}
