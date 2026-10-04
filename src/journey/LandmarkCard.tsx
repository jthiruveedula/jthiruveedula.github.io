import { useLayoutEffect, useRef, useState } from 'react'
import type { JourneyProject } from './projects'

const GAP = 16
const MARGIN = 8

/** Decorative hover card following the pointer; the chapter lists are the accessible path. */
export default function LandmarkCard({
  project,
  x,
  y,
  hint,
}: {
  project: JourneyProject | null
  x: number
  y: number
  hint: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !project) return
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
  }, [project, x, y])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`landmark-card${project ? ' is-visible' : ''}`}
      style={{ left: pos.left, top: pos.top }}
    >
      {project && (
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
          <p className="landmark-card__hint">{hint}</p>
        </>
      )}
    </div>
  )
}
