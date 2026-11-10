import { COMPACT, viewHref } from '@/lib/view'

/**
 * Showcase <-> compact switch. A real link, not a toggle: it reloads into the other
 * mode at the same section, so middle-click, copy-link and sharing `/?view=compact`
 * all work. The label names the destination. Not `.rail__link` on purpose — the
 * pill's eight destinations are a tested contract and this is not one of them.
 */
export default function ViewSwitch({ section, className }: { section: string; className: string }) {
  const target = COMPACT ? 'showcase' : 'compact'
  const label = COMPACT ? 'Showcase' : 'Compact'
  return (
    <a
      href={viewHref(target, section)}
      className={className}
      data-view-switch={target}
      aria-label={
        COMPACT ? 'Switch to showcase view: the scroll film' : 'Switch to compact view: same content, no film'
      }
    >
      {label}
      <span className="view-switch__long">{"\u00a0"}view</span>
    </a>
  )
}
