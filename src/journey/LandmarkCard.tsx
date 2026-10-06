import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { JourneyProject } from './projects'

const GAP = 16
const MARGIN = 8

const isCoarse = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** Fine pointer: decorative hover card following the cursor (the chapter lists are the
 *  accessible path). Coarse pointer: a real bottom sheet with a 44px Open link and
 *  dismiss, exposed to assistive tech. */
export default function LandmarkCard({
  project,
  x,
  y,
  hint,
  onDismiss,
}: {
  project: JourneyProject | null
  x: number
  y: number
  hint: string
  onDismiss: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const [sheet, setSheet] = useState(isCoarse)
  const openRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const on = () => setSheet(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // Sheet: move focus in when it opens, hand it back when it closes.
  const id = project?.id
  useEffect(() => {
    if (!sheet || !id) return
    const prev = document.activeElement as HTMLElement | null
    openRef.current?.focus({ preventScroll: true })
    return () => {
      if (prev && prev !== document.body && prev.isConnected) prev.focus({ preventScroll: true })
    }
  }, [sheet, id])

  useLayoutEffect(() => {
    const el = ref.current
    if (sheet || !el || !project) return
    const { offsetWidth: w, offsetHeight: h } = el
    const { innerWidth: vw, innerHeight: vh } = window
    let left = x + GAP
    if (left + w > vw - MARGIN) left = x - GAP - w
    let top = y + GAP
    if (top + h > vh - MARGIN) top = y - GAP - h
    setPos({
      left: Math.max(MARGIN, Math.min(left, vw - w - MARGIN)),
      top: Math.max(MARGIN, Math.min(top, vh - h - MARGIN)),
    })
  }, [project, x, y, sheet])

  useEffect(() => {
    if (!sheet || !project) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDismiss()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet, project, onDismiss])

  const body = project && (
    <>
      <p className="landmark-card__name">{project.name}</p>
      <p className="landmark-card__sub">
        {project.client ? `${project.client} · ` : ''}
        {project.tagline}
      </p>
      {project.metric && (
        <p className="landmark-card__metric">
          <b>{project.metric.value}</b> <span>{project.metric.label}</span>
        </p>
      )}
      <ul className="landmark-card__tech">
        {project.tech.slice(0, 5).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </>
  )

  if (sheet) {
    if (!project) return null
    return (
      <div role="dialog" aria-modal="true" aria-label={project.name} className="landmark-card landmark-card--sheet is-visible">
        {body}
        <div className="landmark-card__actions">
          <a ref={openRef} href={project.href} className="landmark-card__open">
            Open case study
          </a>
          <button type="button" className="landmark-card__dismiss" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`landmark-card${project ? ' is-visible' : ''}`}
      style={{ left: pos.left, top: pos.top }}
    >
      {body}
      {project && <p className="landmark-card__hint">{hint}</p>}
    </div>
  )
}
