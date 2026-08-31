import { portfolio } from '@/data/portfolio'

/**
 * v5 redesign — replaces the old mega-nav (mobile overlay, scroll-spy, era beam).
 * The page is now five long sections, not six short ones, so a minimal fixed
 * header — identity plus two destinations — reads better than a full nav bar.
 */
export default function Header() {
  const { profile } = portfolio

  return (
    <header className="fixed inset-x-0 top-0 z-90 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-[clamp(18px,3.4vw,60px)] py-3.5">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="text-[11.5px] font-extrabold tracking-[0.15em] uppercase text-ink whitespace-nowrap">
          {profile.name}
        </span>
        <span className="hidden truncate text-[9px] font-semibold tracking-[0.22em] text-neutral-500 uppercase sm:inline">
          Data &amp; AI Architect
        </span>
      </div>
      <nav aria-label="Primary" className="flex gap-1.5">
        <a
          href="#ledger"
          className="border border-ink/25 px-3 py-1.5 text-[9px] font-semibold tracking-[0.16em] text-ink uppercase transition-colors hover:bg-ink/10 hover:no-underline"
        >
          Timeline
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="bg-accent-700 px-3 py-1.5 text-[9px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-accent-600 hover:no-underline"
        >
          Contact
        </a>
      </nav>
    </header>
  )
}
