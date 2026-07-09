import { useEffect, useState } from 'react'
import { audioManager } from '@/lib/audio'
import { useReducedMotion } from '@/lib/hooks'

/** Muted-by-default ambient audio toggle.
 *
 *  The control is hidden under reduced-motion because audio is gated by that
 *  preference too. Clicking to enable bootstraps the Web AudioContext on the
 *  user gesture, satisfying autoplay policies.
 */
export default function AudioToggle() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(() => audioManager.isEnabled())

  useEffect(() => {
    if (reduced && enabled) setEnabled(false)
  }, [reduced, enabled])

  if (reduced) return null

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? 'Disable UI sounds' : 'Enable UI sounds'}
      onClick={() => {
        const next = audioManager.toggle()
        setEnabled(next)
        if (next) audioManager.playBlip('click')
      }}
      className="fixed bottom-4 right-4 z-[180] flex items-center gap-2 rounded-full border border-panel-edge bg-surface/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted backdrop-blur-md transition-colors hover:border-accent hover:text-ink"
    >
      <span aria-hidden="true" className="size-2 rounded-full" style={{ background: enabled ? '#34d399' : '#5b6780' }} />
      {enabled ? 'Sound on' : 'Sound off'}
    </button>
  )
}
