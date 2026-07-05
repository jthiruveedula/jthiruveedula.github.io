import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import { useIsMobile, useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP)

/**
 * Navigation — "Mission HUD" command bar.
 *
 * A fixed glass bar that condenses on scroll, with a tri-era progress beam
 * (legacy amber → cloud cyan → ai violet) tracing the visitor's position in
 * the story. Desktop links are mono-indexed HUD readouts with scroll-spy;
 * mobile gets a full-screen overlay with a staggered GSAP reveal.
 */

interface NavItem {
  /** Anchor id of the target section (contract with section components). */
  id: string
  label: string
  /** Era color class for the HUD index — echoes the legacy→cloud→ai arc. */
  indexClass: string
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'timeline', label: 'Journey', indexClass: 'text-legacy' },
  { id: 'skills', label: 'Skills', indexClass: 'text-cloud' },
  { id: 'projects', label: 'Projects', indexClass: 'text-cloud' },
  { id: 'impact', label: 'Impact', indexClass: 'text-ai' },
  { id: 'contact', label: 'Contact', indexClass: 'text-ai' },
]

const SCROLLED_THRESHOLD_PX = 24

function navIndex(i: number): string {
  return String(i + 1).padStart(2, '0')
}

export default function Navigation() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()

  const headerRef = useRef<HTMLElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const beamRef = useRef<HTMLDivElement | null>(null)
  const beamSurgeRef = useRef<HTMLDivElement | null>(null)
  const directionRef = useRef<SVGSVGElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const menuTl = useRef<gsap.core.Timeline | null>(null)
  const menuOpenRef = useRef(false)
  const restoreFocusRef = useRef(true)

  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus
    setMenuOpen(false)
  }, [])

  /* ---- Scroll spy: highlight the section currently in the reading band ---- */
  useEffect(() => {
    const main = document.getElementById('main')
    const inBand = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        setActiveId(NAV_ITEMS.find((item) => inBand.has(item.id))?.id ?? null)
      },
      // A horizontal band ~35–45% down the viewport: one section "reads" at a time.
      { rootMargin: '-35% 0px -55% 0px' },
    )

    const observed = new Set<Element>()
    const observeSections = () => {
      for (const { id } of NAV_ITEMS) {
        const el = document.getElementById(id)
        if (el && !observed.has(el)) {
          observed.add(el)
          observer.observe(el)
        }
      }
    }
    observeSections()

    // Sections mount lazily (React.lazy) — watch for them appearing.
    let mutations: MutationObserver | undefined
    if (main) {
      mutations = new MutationObserver(observeSections)
      mutations.observe(main, { childList: true, subtree: true })
    }
    return () => {
      observer.disconnect()
      mutations?.disconnect()
    }
  }, [])

  /* ---- Era progress beam + condensed-bar + scroll-momentum feel (single listener) ----
   * The bar stays put (nav must always be reachable) but leans into the scroll like it
   * has weight: velocity drives a subtle 3D tilt that springs back to rest the instant
   * scrolling stops, and a direction beacon flips + flashes the instant you reverse
   * course — direct physical feedback for the gesture you just made, not a decorative loop. */
  useGSAP(
    () => {
      const bar = barRef.current
      const beam = beamRef.current
      const surge = beamSurgeRef.current
      const arrow = directionRef.current
      if (!bar || !beam) return

      gsap.set(bar, { transformPerspective: 700, transformOrigin: 'top center' })
      gsap.set(beam, { scaleX: 0, transformOrigin: 'left center' })
      const glideBeam = reduced ? null : gsap.quickTo(beam, 'scaleX', { duration: 0.35, ease: 'power2.out' })
      const tilt = reduced ? null : gsap.quickTo(bar, 'rotateX', { duration: 0.35, ease: 'power2.out' })
      const lift = reduced ? null : gsap.quickTo(bar, 'y', { duration: 0.35, ease: 'power2.out' })

      let lastY = window.scrollY
      let lastDirection: 'up' | 'down' | null = null
      let settleTimer: number | undefined

      const flashSurge = (down: boolean) => {
        if (reduced || !surge) return
        gsap.fromTo(
          surge,
          { xPercent: down ? -100 : 100, opacity: 0.9 },
          { xPercent: down ? 100 : -100, opacity: 0, duration: 0.6, ease: 'power2.out', overwrite: true },
        )
      }

      const flipArrow = (down: boolean) => {
        if (reduced || !arrow) return
        gsap.to(arrow, {
          rotate: down ? 0 : 180,
          duration: 0.45,
          ease: 'back.out(2)',
          overwrite: 'auto',
        })
        gsap.fromTo(
          arrow,
          { scale: 1.6, color: down ? '#22d3ee' : '#f59e0b' },
          { scale: 1, color: '#8b98b3', duration: 0.5, ease: 'power2.out', overwrite: 'auto' },
        )
      }

      const settle = () => {
        tilt?.(0)
        lift?.(0)
      }

      const update = () => {
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const y = Math.max(window.scrollY, 0)
        const progress = max > 0 ? Math.min(y / max, 1) : 0
        if (glideBeam) glideBeam(progress)
        else gsap.set(beam, { scaleX: progress })
        setScrolled(y > SCROLLED_THRESHOLD_PX)

        const deltaY = y - lastY
        if (deltaY !== 0) {
          const velocity = gsap.utils.clamp(-32, 32, deltaY)
          tilt?.(gsap.utils.mapRange(-32, 32, 3.2, -3.2, velocity))
          lift?.(gsap.utils.mapRange(-32, 32, 2.6, -2.6, velocity))

          const direction = deltaY > 0 ? 'down' : 'up'
          if (direction !== lastDirection && y > SCROLLED_THRESHOLD_PX) {
            flashSurge(direction === 'down')
            flipArrow(direction === 'down')
          }
          lastDirection = direction
        }
        lastY = y

        window.clearTimeout(settleTimer)
        settleTimer = window.setTimeout(settle, 140)
      }

      update()
      window.addEventListener('scroll', update, { passive: true })
      window.addEventListener('resize', update)
      return () => {
        window.clearTimeout(settleTimer)
        window.removeEventListener('scroll', update)
        window.removeEventListener('resize', update)
      }
    },
    { scope: headerRef, dependencies: [reduced], revertOnUpdate: true },
  )

  /* ---- Entrance: bar drops in, HUD items cascade ---- */
  useGSAP(
    () => {
      if (reduced) return
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(barRef.current, { yPercent: -120, duration: 0.7 })
        .from('[data-nav-item]', { y: -14, autoAlpha: 0, duration: 0.45, stagger: 0.06 }, '-=0.35')
    },
    { scope: headerRef, dependencies: [reduced], revertOnUpdate: true },
  )

  /* ---- Mobile overlay timeline (built paused; play/reverse on toggle) ---- */
  useGSAP(
    () => {
      const overlay = overlayRef.current
      if (!overlay) return
      gsap.set(overlay, { autoAlpha: 0 })
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to(overlay, { autoAlpha: 1, duration: reduced ? 0 : 0.28 })
        .from(
          '[data-menu-link]',
          { y: reduced ? 0 : 28, autoAlpha: 0, duration: reduced ? 0 : 0.5, stagger: reduced ? 0 : 0.07 },
          reduced ? 0 : '-=0.05',
        )
        .from('[data-menu-meta]', { autoAlpha: 0, y: reduced ? 0 : 16, duration: reduced ? 0 : 0.4 }, reduced ? 0 : '-=0.3')
      // If preferences change while the menu is open, keep it open.
      if (menuOpenRef.current) tl.progress(1)
      menuTl.current = tl
    },
    { scope: headerRef, dependencies: [reduced], revertOnUpdate: true },
  )

  /* ---- Open/close side effects: animate, lock scroll, manage focus ---- */
  useEffect(() => {
    const wasOpen = menuOpenRef.current
    menuOpenRef.current = menuOpen
    const tl = menuTl.current

    if (menuOpen) {
      tl?.play()
      document.body.style.overflow = 'hidden'
      overlayRef.current?.querySelector<HTMLElement>('[data-menu-link]')?.focus({ preventScroll: true })
    } else {
      tl?.reverse()
      document.body.style.overflow = ''
      if (wasOpen && restoreFocusRef.current) toggleRef.current?.focus({ preventScroll: true })
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  /* ---- Keyboard: Escape closes, Tab is trapped inside the open menu ---- */
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
        return
      }
      if (event.key !== 'Tab' || !headerRef.current) return
      const focusables = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.getClientRects().length > 0)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, closeMenu])

  /* ---- Leaving mobile viewport while open: dismiss the overlay ---- */
  useEffect(() => {
    if (!isMobile && menuOpen) closeMenu(false)
  }, [isMobile, menuOpen, closeMenu])

  const { profile } = portfolio
  const initials = profile.name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      {/* Full-screen mobile overlay — sits behind the bar so the close control stays visible */}
      <div
        id="site-menu"
        ref={overlayRef}
        inert={!menuOpen}
        className="invisible fixed inset-0 z-0 flex flex-col justify-between overflow-y-auto bg-void/95 px-6 pt-28 pb-10 backdrop-blur-2xl md:hidden"
      >
        <nav aria-label="Primary">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.id}>
                <a
                  data-menu-link
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? 'location' : undefined}
                  onClick={() => closeMenu(false)}
                  className="group flex items-baseline gap-4 py-3"
                >
                  <span aria-hidden="true" className={`font-mono text-xs tracking-[0.2em] ${item.indexClass}`}>
                    {navIndex(i)}
                  </span>
                  <span
                    className={`font-display text-4xl font-semibold transition-colors ${
                      activeId === item.id ? 'text-ink' : 'text-ink-muted group-hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-meta className="flex flex-col gap-3">
          <span className="hud-label">get in touch</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="text-ink-muted transition-colors hover:text-accent">
                email
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted transition-colors hover:text-accent"
              >
                linkedin ↗
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted transition-colors hover:text-accent"
              >
                github ↗
              </a>
            )}
            <a href="/resume.html" className="text-accent transition-colors hover:text-accent-soft">
              resume
            </a>
          </div>
        </div>
      </div>

      {/* Command bar */}
      <div
        ref={barRef}
        className={`relative z-10 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || menuOpen
            ? 'border-panel-edge/70 bg-surface/80 shadow-[0_8px_32px_rgba(5,8,16,0.55)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              data-nav-item
              href="#main"
              aria-label={`${profile.name} — back to top`}
              className="flex items-baseline gap-3"
            >
              <span className="from-legacy via-cloud to-ai bg-linear-to-r bg-clip-text font-display text-xl font-bold text-transparent">
                {initials}
              </span>
              <span className="hud-label hidden sm:inline">data · ai architect</span>
            </a>

            {/* Scroll-direction beacon: flips + flashes the instant you reverse course */}
            <svg
              ref={directionRef}
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="hidden size-3 shrink-0 text-ink-faint sm:block"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v10M4 9l4 4 4-4" />
            </svg>
          </div>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item, i) => {
                const active = activeId === item.id
                return (
                  <li key={item.id}>
                    <a
                      data-nav-item
                      href={`#${item.id}`}
                      aria-current={active ? 'location' : undefined}
                      className={`group relative flex items-baseline gap-1.5 rounded px-3 py-2 font-mono text-[0.8rem] tracking-wide transition-colors ${
                        active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`text-[0.65rem] transition-colors ${
                          active ? item.indexClass : 'text-ink-faint group-hover:text-ink-muted'
                        }`}
                      >
                        {navIndex(i)}
                      </span>
                      <span>{item.label}</span>
                      <span
                        aria-hidden="true"
                        className={`from-accent to-ai absolute inset-x-3 -bottom-px h-px origin-left bg-linear-to-r transition-transform duration-300 ${
                          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                        }`}
                      />
                    </a>
                  </li>
                )
              })}
              <li>
                <a
                  data-nav-item
                  href="/resume.html"
                  className="border-accent/50 text-accent hover:bg-accent/10 ml-2 rounded border px-3 py-1.5 font-mono text-[0.8rem] tracking-wide transition-colors"
                >
                  Resume
                </a>
              </li>
            </ul>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
            className="relative flex h-10 w-10 items-center justify-center rounded md:hidden"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span
              aria-hidden="true"
              className={`absolute h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ${
                menuOpen ? 'rotate-45' : '-translate-y-[3.5px]'
              }`}
            />
            <span
              aria-hidden="true"
              className={`absolute h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ${
                menuOpen ? '-rotate-45' : 'translate-y-[3.5px]'
              }`}
            />
          </button>
        </div>

        {/* Era progress beam: legacy → cloud → ai */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
          <div
            ref={beamRef}
            className="from-legacy via-cloud to-ai h-full w-full origin-left scale-x-0 bg-linear-to-r"
          />
          {/* Surge flash: sweeps across the beam the instant scroll direction reverses */}
          <div
            ref={beamSurgeRef}
            className="absolute inset-y-0 w-1/3 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent opacity-0"
          />
        </div>
      </div>
    </header>
  )
}
