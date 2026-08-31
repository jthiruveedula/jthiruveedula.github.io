import { useReducedMotion } from '@/lib/hooks'

/**
 * The page's single hand-built apparatus — a topology graph, not a glowing orb.
 *
 * Six source/target nodes ring one governed core, which is the actual shape of
 * every platform in the dataset: heterogeneous sources land in one governed
 * plane, and everything downstream reads from there. Packets walk the edges
 * inward on a slow loop; the core pulses. It never rotates.
 *
 * Every leader-line callout carries a real number from `portfolio.ts` — the
 * apparatus is a readout, so an invented value would make it a decoration.
 */
const CX = 200
const CY = 200
const R = 138

const NODES = [
  { label: 'COBOL', angle: -90 },
  { label: 'Teradata', angle: -30 },
  { label: 'Kafka', angle: 30 },
  { label: 'BigQuery', angle: 90 },
  { label: 'Vertex AI', angle: 150 },
  { label: 'Snowflake', angle: 210 },
] as const

function pointAt(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

/** Where a node's label sits, and which way it reads, so nothing collides with the ring. */
function labelFor(angle: number) {
  const p = pointAt(angle, R + 22)
  if (angle === -90) return { ...p, anchor: 'middle' as const, dy: -4 }
  if (angle === 90) return { ...p, anchor: 'middle' as const, dy: 12 }
  return {
    ...p,
    anchor: (Math.cos((angle * Math.PI) / 180) > 0 ? 'start' : 'end') as 'start' | 'end',
    dy: 3,
  }
}

export default function Apparatus() {
  const reduced = useReducedMotion()

  return (
    <figure className="apparatus" aria-hidden="true">
      <svg viewBox="0 0 400 400" role="presentation">
        {/* Edges: satellite → governed core. Drawn first so nodes sit on top. */}
        {NODES.map(({ label, angle }) => {
          const outer = pointAt(angle, R)
          const inner = pointAt(angle, 46)
          return (
            <line
              key={`edge-${label}`}
              className="apparatus__edge"
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
            />
          )
        })}

        {/* The ring itself — a hairline hexagon through the six nodes. */}
        <polygon
          className="apparatus__edge"
          points={NODES.map(({ angle }) => {
            const p = pointAt(angle, R)
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
          }).join(' ')}
          opacity={0.45}
        />

        {/* Governed core */}
        <circle className="apparatus__core-glow" cx={CX} cy={CY} r={52} />
        <circle className="apparatus__node apparatus__node--core" cx={CX} cy={CY} r={40} />
        <text
          className="apparatus__label"
          x={CX}
          y={CY - 2}
          textAnchor="middle"
          style={{ fill: 'var(--color-accent)' }}
        >
          GOVERNED
        </text>
        <text className="apparatus__label" x={CX} y={CY + 12} textAnchor="middle">
          PLANE
        </text>

        {/* Satellites */}
        {NODES.map(({ label, angle }) => {
          const p = pointAt(angle, R)
          const l = labelFor(angle)
          return (
            <g key={label}>
              <circle className="apparatus__node" cx={p.x} cy={p.y} r={5.5} />
              <text
                className="apparatus__label"
                x={l.x}
                y={l.y + l.dy}
                textAnchor={l.anchor}
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Packets walking inward. Motion is the only thing gated on the
            reduced-motion preference; the topology itself always renders. */}
        {!reduced &&
          NODES.map(({ label, angle }, i) => {
            const outer = pointAt(angle, R)
            const inner = pointAt(angle, 46)
            return (
              <circle key={`packet-${label}`} className="apparatus__packet" r={2.5}>
                <animateMotion
                  dur="4.6s"
                  begin={`${i * 0.72}s`}
                  repeatCount="indefinite"
                  path={`M${outer.x.toFixed(1)},${outer.y.toFixed(1)} L${inner.x.toFixed(1)},${inner.y.toFixed(1)}`}
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
                <animate
                  attributeName="opacity"
                  dur="4.6s"
                  begin={`${i * 0.72}s`}
                  repeatCount="indefinite"
                  values="0;1;1;0"
                  keyTimes="0;0.12;0.8;1"
                />
              </circle>
            )
          })}
      </svg>

      {/* All four callouts hang off the left edge. Splitting them left/right
          pushed the right-hand pair past the viewport at every width below
          ~1400px, which is most desktops. */}
      <ul className="callout-list">
        <li className="callout" data-side="left" style={{ '--y': '14%' } as React.CSSProperties}>
          <span>500+ TIB · MIGRATED</span>
        </li>
        <li className="callout" data-side="left" style={{ '--y': '32%' } as React.CSSProperties}>
          <span>1B+ EVENTS · DAILY</span>
        </li>
        <li className="callout" data-side="left" style={{ '--y': '62%' } as React.CSSProperties}>
          <span>50M+ DOCS · IN RAG</span>
        </li>
        <li className="callout" data-side="left" style={{ '--y': '80%' } as React.CSSProperties}>
          <span>P95 · UNDER 1.5 S</span>
        </li>
      </ul>
    </figure>
  )
}
