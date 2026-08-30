import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/hooks'

/* ------------------------------------------------------------------------- *
 * Sequence — the career-story scroll sequence (replaces the WebGL ScrollWorld
 * hero). Six sticky full-viewport "stations" — Ingress, Legacy, Migration,
 * Realtime, Translation, Grounded AI — each with scroll-linked stat counters
 * and a bespoke chart.
 *
 * Ported as-is from the v5 prototype: one rAF-throttled scroll driver reads
 * each station's getBoundingClientRect() to compute a 0..1 "how far scrolled
 * through this station" progress value, then walks every [data-anim]
 * descendant and writes its animated style directly to the DOM — no
 * animation library; matches the prototype's hand-rolled driver and the
 * imperative rAF+rect pattern SignalPath/ReadingLight already use elsewhere
 * in this codebase.
 *
 * Copy/metrics are the real resume data (same source as data/portfolio.ts),
 * kept verbatim from the v5 design. Chart geometry (bar heights, dot
 * positions) is decorative filler, not resume data, so it's generated
 * deterministically rather than reverse-engineered from the prototype.
 * ------------------------------------------------------------------------- */

type AnimKind = 'fill' | 'count' | 'countdown' | 'parallax' | 'ghost' | 'sweep' | 'scanline' | 'seq'

interface ParsedAnim {
  el: HTMLElement
  kind: AnimKind
  t: string
  order: number
  count: number
  rate: number
  start: number
  end: number
  num: number
  dec: number
  pre: string
  suf: string
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const easeOut = (n: number) => 1 - (1 - n) ** 3
const fmtNum = (n: number, dec: number) => (dec ? n.toFixed(dec) : String(Math.round(n)))

function parseAnim(el: HTMLElement): ParsedAnim {
  const d = el.dataset
  const kind = (d.anim ?? 'seq') as AnimKind
  const order = Number(d.order ?? 0)
  const count = Number(d.count ?? 1)
  let start = d.in !== undefined ? Number(d.in) : NaN
  let end = d.out !== undefined ? Number(d.out) : NaN
  if (Number.isNaN(start) || Number.isNaN(end)) {
    if (kind === 'sweep') {
      start = 0.12
      end = 0.88
    } else {
      start = 0.1 + (order / count) * 0.52
      end = Math.min(0.92, start + 0.2)
    }
  }
  return {
    el,
    kind,
    t: d.t ?? 'none',
    order,
    count,
    rate: Number(d.rate ?? 0),
    start,
    end,
    num: Number(d.num ?? 0),
    dec: Number(d.decimals ?? 0),
    pre: d.prefix ?? '',
    suf: d.suffix ?? '',
  }
}

/** Maps station progress -> per-element visual state. `prog` is the station's
 *  raw 0..1 scroll-through progress; `l` is that windowed into [a.start,a.end]
 *  and eased. `travel` deliberately uses the raw station `prog`, not the
 *  window — it represents one continuous signal sweeping the whole diagram. */
function applyAnim(a: ParsedAnim, prog: number, accent: string) {
  const raw = clamp01((prog - a.start) / (a.end - a.start || 1))
  const l = easeOut(raw)
  const { el } = a
  const style = el.style

  if (a.kind === 'count') {
    style.opacity = String(0.25 + 0.75 * l)
    el.textContent = a.pre + fmtNum(a.num * l, a.dec) + a.suf
    return
  }
  if (a.kind === 'countdown') {
    style.opacity = String(0.25 + 0.75 * l)
    el.textContent = a.pre + fmtNum(a.num * (3 - 2 * l), a.dec) + a.suf
    return
  }
  if (a.kind === 'fill') {
    style.transform = `scaleX(${l})`
    return
  }
  if (a.kind === 'parallax') {
    style.transform = `translate3d(0, ${(prog - 0.5) * a.rate}px, 0)`
    return
  }
  if (a.kind === 'ghost') {
    style.opacity = String(0.015 + 0.05 * Math.sin(Math.PI * clamp01(prog)))
    return
  }
  if (a.kind === 'scanline') {
    style.top = `${l * 100}%`
    style.opacity = prog >= a.start && prog <= a.end ? '1' : '0'
    return
  }
  if (a.kind === 'sweep') {
    style.top = `${l * 100}%`
    style.opacity = String(Math.sin(Math.PI * l) * 0.85)
    return
  }

  // kind === 'seq' — sub-typed by data-t
  switch (a.t) {
    case 'dim':
      style.transform = 'scale(0.34)'
      style.opacity = '0.13'
      return
    case 'travel': {
      const head = prog * (a.count * 1.18)
      const near = Math.max(0, 1 - Math.abs(head - a.order) / 9)
      const passed = a.order < head ? 0.5 : 0.1
      const v = Math.min(1, passed + near)
      style.transform = `scale(${0.4 + 0.6 * v})`
      style.opacity = String(0.1 + 0.9 * v)
      style.background = near > 0.55 ? accent : 'var(--color-ink)'
      return
    }
    case 'scaleY': {
      style.transform = `scaleY(${0.06 + 0.94 * l})`
      style.opacity = String(0.16 + 0.84 * l)
      const flow = el.nextElementSibling as HTMLElement | null
      if (flow?.hasAttribute('data-flow')) {
        if (raw > 0.94) {
          flow.style.animationPlayState = 'running'
          flow.style.opacity = ''
        } else {
          flow.style.animationPlayState = 'paused'
          flow.style.opacity = '0'
        }
      }
      return
    }
    case 'scaleXLeft':
      style.transform = `scaleX(${l})`
      style.opacity = String(0.25 + 0.75 * l)
      return
    case 'scale':
      style.transform = `scale(${0.25 + 0.75 * l})`
      style.opacity = String(0.12 + 0.88 * l)
      return
    case 'out':
      style.opacity = String(1 - 0.86 * l)
      style.transform = `translateX(${l * 10}px)`
      return
    default:
      style.opacity = String(l)
  }
}

function snapFinal(a: ParsedAnim) {
  const { el } = a
  const style = el.style
  if (a.kind === 'fill') {
    style.transform = 'scaleX(1)'
    return
  }
  if (a.kind === 'parallax') {
    style.transform = 'translate3d(0,0,0)'
    return
  }
  if (a.kind === 'ghost') {
    style.opacity = '0.045'
    return
  }
  if (a.kind === 'scanline' || a.kind === 'sweep') {
    style.opacity = '0'
    return
  }
  if (a.kind === 'count' || a.kind === 'countdown') {
    return // JSX already renders the settled value
  }
  switch (a.t) {
    case 'dim':
      style.transform = 'scale(0.34)'
      style.opacity = '0.13'
      return
    case 'scaleY': {
      style.transform = 'scaleY(1)'
      style.opacity = '1'
      const flow = el.nextElementSibling as HTMLElement | null
      if (flow?.hasAttribute('data-flow')) {
        flow.style.animationPlayState = 'running'
        flow.style.opacity = ''
      }
      return
    }
    case 'scale':
    case 'travel':
      style.transform = 'scale(1)'
      style.opacity = '1'
      return
    case 'scaleXLeft':
      style.transform = 'scaleX(1)'
      style.opacity = '1'
      return
    case 'out':
      style.opacity = '0.18'
      return
    default:
      style.opacity = '1'
      style.transform = 'none'
  }
}

/* --------------------------------- data ---------------------------------- */

const GHOST = ['Origin', 'Legacy', 'Migration', 'Realtime', 'Translation', 'Grounded AI']

interface StationMeta {
  image: string
  filter: string
  heightVh: number
  accent: string
  accentSoft: string
}

const STATIONS: StationMeta[] = [
  { image: '/scenes/01-ingress@sm.jpg', filter: 'grayscale(1) contrast(1.4) brightness(0.42) sepia(0.34) hue-rotate(158deg) saturate(1.55)', heightVh: 220, accent: '#17a6d2', accentSoft: '#7fd8f4' },
  { image: '/scenes/02-legacy-substrate@sm.jpg', filter: 'grayscale(1) contrast(1.45) brightness(0.34) sepia(0.34) hue-rotate(158deg) saturate(1.55)', heightVh: 260, accent: '#808a91', accentSoft: '#a6aeb4' },
  { image: '/scenes/03-great-migration@sm.jpg', filter: 'grayscale(1) contrast(1.42) brightness(0.36) sepia(0.34) hue-rotate(158deg) saturate(1.55)', heightVh: 280, accent: '#0a5c78', accentSoft: '#46c9f0' },
  { image: '/scenes/04-governed-realtime@sm.jpg', filter: 'grayscale(1) contrast(1.42) brightness(0.36) sepia(0.34) hue-rotate(158deg) saturate(1.55)', heightVh: 280, accent: '#0b7fa4', accentSoft: '#46c9f0' },
  { image: '/scenes/05-translation-engine@sm.jpg', filter: 'grayscale(1) contrast(1.42) brightness(0.36) sepia(0.34) hue-rotate(158deg) saturate(1.55)', heightVh: 280, accent: '#17a6d2', accentSoft: '#46c9f0' },
  { image: '/scenes/06-grounded-mind@sm.jpg', filter: 'grayscale(1) contrast(1.42) brightness(0.36) sepia(0.34) hue-rotate(158deg) saturate(1.55)', heightVh: 300, accent: '#46c9f0', accentSoft: '#7fd8f4' },
]

/* Decorative chart geometry — not resume data, generated deterministically. */
const pipelineBars = Array.from({ length: 20 }, (_, i) => 28 + ((i * 37) % 62))
const sourceBars = Array.from({ length: 50 }, (_, i) => 18 + ((i * 53) % 72))
const cobolWidths = Array.from({ length: 12 }, (_, i) => 52 + ((i * 17) % 42))
const sqlWidths = Array.from({ length: 12 }, (_, i) => 58 + ((i * 23) % 36))
const DOC_COUNT = 120
const docDim = new Set(Array.from({ length: 6 }, (_, i) => i * 20 + 19)) // 6/120 = the 5% not grounded
const STREAM_COLS = 26
const STREAM_ROWS = 5

/* ------------------------------- helpers ---------------------------------- */

function Eyebrow({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        data-anim="fill"
        data-in="0"
        data-out="0.18"
        style={{ display: 'block', width: 70, height: 1, background: 'color-mix(in srgb, var(--color-ink) 45%, transparent)', transformOrigin: 'left center', transform: 'scaleX(0)' }}
      />
      <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
        {text}
      </span>
    </div>
  )
}

function Stat({
  num,
  prefix = '',
  suffix = '',
  decimals = 0,
  inAt,
  outAt,
  kind = 'count',
}: {
  num: number
  prefix?: string
  suffix?: string
  decimals?: number
  inAt: number
  outAt: number
  kind?: 'count' | 'countdown'
}) {
  return (
    <div>
      <div
        data-anim={kind}
        data-num={num}
        data-prefix={prefix}
        data-suffix={suffix}
        data-decimals={decimals}
        data-in={inAt}
        data-out={outAt}
        style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 2.8vw, 44px)', lineHeight: 1, letterSpacing: '-0.04em' }}
      >
        {prefix}
        {fmtNum(num, decimals)}
        {suffix}
      </div>
    </div>
  )
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 7, fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
      {children}
    </div>
  )
}

function VizFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(90deg, color-mix(in srgb, var(--color-ink) 6%, transparent) 1px, transparent 1px)',
        backgroundSize: 'calc(100% / 12) 100%',
        paddingTop: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <span data-anim="ghost" aria-hidden="true" style={{ position: 'absolute', right: '-0.06em', top: '-0.34em', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(52px, 8vw, 128px)', lineHeight: 0.78, letterSpacing: '-0.05em', textTransform: 'uppercase', color: 'var(--color-ink)', opacity: 0, pointerEvents: 'none' }} />
      <span data-anim="sweep" aria-hidden="true" style={{ position: 'absolute', left: -10, right: -10, top: 0, height: 1, background: 'var(--sa)', opacity: 0, pointerEvents: 'none' }} />
      {children}
    </div>
  )
}

/* ------------------------------- stations ---------------------------------- */

function StationShell({
  meta,
  stationRef,
  ghostLabel,
  frame,
  children,
}: {
  meta: StationMeta
  stationRef: (el: HTMLDivElement | null) => void
  ghostLabel: string
  /** false only for station 0, which uses its own centered layout, not the copy/viz grid. */
  frame?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      ref={stationRef}
      data-station
      data-ghost-label={ghostLabel}
      style={{ position: 'relative', height: `${meta.heightVh}vh`, ...({ '--sa': meta.accent, '--sa-soft': meta.accentSoft } as React.CSSProperties) }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: 'var(--color-ground)' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            data-plate
            src={meta.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: meta.filter, transform: 'scale(1.08)', willChange: 'transform' }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--color-ground) 92%, transparent) 0%, color-mix(in srgb, var(--color-ground) 60%, transparent) 45%, color-mix(in srgb, var(--color-ground) 97%, transparent) 100%)',
            }}
          />
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '7.5vh', background: 'var(--color-ground)', borderBottom: '1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7.5vh', background: 'var(--color-ground)', borderTop: '1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)' }} />
        <div
          data-station-content
          style={{
            position: 'absolute',
            inset: '7.5vh 0',
            display: frame ? 'grid' : 'flex',
            flexDirection: frame ? undefined : 'column',
            justifyContent: frame ? undefined : 'center',
            gridTemplateColumns: frame ? 'minmax(0, 0.85fr) minmax(0, 1.15fr)' : undefined,
            alignItems: 'center',
            gap: frame ? 'clamp(20px, 4vw, 70px)' : 30,
            padding: frame ? 'clamp(20px, 4vh, 50px) clamp(18px, 3.4vw, 60px)' : '0 clamp(18px, 3.4vw, 60px)',
            opacity: 1,
            transform: 'none',
            willChange: 'transform, opacity',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function StationIngress({ stationRef }: { stationRef: (el: HTMLDivElement | null) => void }) {
  return (
    <StationShell meta={STATIONS[0]} stationRef={stationRef} ghostLabel={GHOST[0]}>
      <Eyebrow text="Dallas–Fort Worth, TX · 2015 — present" />
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(40px, 8vw, 142px)', lineHeight: 0.86, letterSpacing: '-0.05em', textTransform: 'uppercase' }}>
        Data &amp; AI{' '}
        <br />
        Architect
      </h1>
      <div data-figs style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', borderTop: '2px solid color-mix(in srgb, var(--color-ink) 30%, transparent)', maxWidth: 1180 }}>
        <div style={{ padding: '14px 18px 0 0', borderRight: '1px solid color-mix(in srgb, var(--color-ink) 16%, transparent)' }}>
          <Stat num={11} suffix="+" inAt={0.05} outAt={0.4} />
          <StatLabel>Years</StatLabel>
        </div>
        <div style={{ padding: '14px 18px 0', borderRight: '1px solid color-mix(in srgb, var(--color-ink) 16%, transparent)' }}>
          <Stat num={2} prefix="$" suffix="M+" inAt={0.08} outAt={0.44} />
          <StatLabel>Saved</StatLabel>
        </div>
        <div style={{ padding: '14px 18px 0', borderRight: '1px solid color-mix(in srgb, var(--color-ink) 16%, transparent)' }}>
          <Stat num={500} suffix="+" inAt={0.11} outAt={0.48} />
          <StatLabel>TiB migrated</StatLabel>
        </div>
        <div style={{ padding: '14px 0 0 18px' }}>
          <Stat num={99.9} decimals={1} suffix="%" inAt={0.14} outAt={0.52} />
          <StatLabel>Uptime</StatLabel>
        </div>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', left: 'clamp(18px, 3.4vw, 60px)', bottom: 'calc(7.5vh + 26px)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 1, height: 28, overflow: 'hidden', background: 'color-mix(in srgb, var(--color-ink) 18%, transparent)', position: 'relative' }}>
          <span style={{ position: 'absolute', left: -1, top: 0, width: 3, height: 3, marginLeft: -1, borderRadius: '50%', background: 'var(--sa)', animation: 'om-scrolldot 1.8s ease-in-out infinite' }} />
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Scroll to begin</span>
      </div>
    </StationShell>
  )
}

function StationLegacy({ stationRef }: { stationRef: (el: HTMLDivElement | null) => void }) {
  return (
    <StationShell meta={STATIONS[1]} stationRef={stationRef} ghostLabel={GHOST[1]} frame>
      <div data-copy style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Eyebrow text="2015 — 2019" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px, 4.6vw, 76px)', lineHeight: 0.94, letterSpacing: '-0.04em' }}>
          It starts underground.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-400)', maxWidth: '32ch' }}>Twenty pipelines, built by hand.</p>
      </div>
      <div data-viz>
        <VizFrame>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>
            <span>Pipelines, one per bar · left to right, 2015 → 2019</span>
            <span data-anim="seq" data-t="none" data-order="19" data-count="20" data-in="0.6" data-out="0.82" style={{ color: 'var(--sa-soft)', opacity: 0 }}>
              Accent — became the standing framework
            </span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 'clamp(3px, 0.7vw, 9px)', height: 'clamp(150px, 30vh, 300px)', borderBottom: '2px solid color-mix(in srgb, var(--color-ink) 28%, transparent)' }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: -1, right: 0, height: 1, background: 'color-mix(in srgb, var(--color-ink) 10%, transparent)' }} />
            <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: '50%', right: 0, height: 1, background: 'color-mix(in srgb, var(--color-ink) 8%, transparent)' }} />
            {pipelineBars.map((h, i) => {
              const isFramework = i === pipelineBars.length - 1
              return (
                <span key={i} style={{ position: 'relative', display: 'block', flex: 1, height: `${h}%`, overflow: 'visible' }}>
                  <span
                    data-anim="seq"
                    data-t="scaleY"
                    data-order={i}
                    data-count="20"
                    style={{ position: 'absolute', inset: 0, display: 'block', background: isFramework ? 'var(--sa)' : 'var(--color-neutral-500)', transformOrigin: 'bottom center', transform: 'scaleY(0)', opacity: 0.2 }}
                  />
                  {isFramework && (
                    <span data-flow aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: 'linear-gradient(180deg, transparent, #fff, transparent)', mixBlendMode: 'overlay', opacity: 0, animation: 'om-pipeflow 1.6s linear infinite', animationPlayState: 'paused' }} />
                  )}
                </span>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <Stat num={20} suffix="+" inAt={0.12} outAt={0.62} />
              <StatLabel>ETL pipelines</StatLabel>
            </div>
            <div>
              <Stat num={5} suffix="M+" inAt={0.2} outAt={0.68} />
              <StatLabel>Records / day</StatLabel>
            </div>
            <div>
              <Stat num={25} suffix="%" inAt={0.28} outAt={0.74} />
              <StatLabel>Fewer defects</StatLabel>
            </div>
          </div>
        </VizFrame>
      </div>
    </StationShell>
  )
}

function StationMigration({ stationRef }: { stationRef: (el: HTMLDivElement | null) => void }) {
  const cells = Array.from({ length: STREAM_ROWS }, (_, row) => Array.from({ length: STREAM_COLS }, (_, col) => row * STREAM_COLS + col))
  return (
    <StationShell meta={STATIONS[2]} stationRef={stationRef} ghostLabel={GHOST[2]} frame>
      <div data-copy style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Eyebrow text="Charles Schwab" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px, 4.6vw, 76px)', lineHeight: 0.94, letterSpacing: '-0.04em' }}>
          Moved without losing a row.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-400)', maxWidth: '32ch' }}>A multi-petabyte estate, onto GCP.</p>
      </div>
      <div data-viz>
        <VizFrame>
          <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr) 84px', alignItems: 'center', gap: 12 }}>
            <div style={{ border: '1px solid color-mix(in srgb, var(--color-ink) 40%, transparent)', padding: '12px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-neutral-400)' }}>
              Hadoop{' '}
              <br />
              Teradata
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {cells.map((row, r) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.5vw, 6px)', height: 6 }}>
                  {row.map((order) => (
                    <span key={order} data-anim="seq" data-t="travel" data-order={order} data-count="130" style={{ display: 'block', flex: 1, height: 2, background: 'var(--color-ink)', transform: 'scale(0.4)', opacity: 0.12 }} />
                  ))}
                </div>
              ))}
            </div>
            <div data-anim="seq" data-t="none" data-order="120" data-count="130" style={{ border: '1px solid var(--sa)', padding: '12px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sa-soft)', opacity: 0.15 }}>
              GCP{' '}
              <br />
              BigQuery
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 26, paddingTop: 16, borderTop: '2px solid color-mix(in srgb, var(--color-ink) 28%, transparent)' }}>
            <div>
              <Stat num={1} suffix="B+" inAt={0.14} outAt={0.66} />
              <StatLabel>Records / day</StatLabel>
            </div>
            <div>
              <Stat num={1} prefix="$" suffix="M+" inAt={0.22} outAt={0.72} />
              <StatLabel>Saved / year</StatLabel>
            </div>
            <div>
              <Stat num={0} inAt={0.3} outAt={0.78} />
              <StatLabel>Rows lost</StatLabel>
            </div>
          </div>
        </VizFrame>
      </div>
    </StationShell>
  )
}

function StationRealtime({ stationRef }: { stationRef: (el: HTMLDivElement | null) => void }) {
  return (
    <StationShell meta={STATIONS[3]} stationRef={stationRef} ghostLabel={GHOST[3]} frame>
      <div data-copy style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Eyebrow text="HCA · NRG" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px, 4.6vw, 76px)', lineHeight: 0.94, letterSpacing: '-0.04em' }}>
          Scale under audit.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-400)', maxWidth: '32ch' }}>Fifty sources live, under HIPAA.</p>
      </div>
      <div data-viz>
        <VizFrame>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 'clamp(4px, 0.8vw, 10px)' }}>
            {sourceBars.map((h, i) => (
              <span key={i} data-anim="seq" data-t="scaleY" data-order={i} data-count="50" style={{ display: 'block', height: `clamp(18px, ${(h / 100) * 3.4}vh, ${(h / 100) * 34}px)`, background: 'var(--color-ink)', transformOrigin: 'bottom center', transform: 'scaleY(0.08)', opacity: 0.16 }} />
            ))}
          </div>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '2px solid color-mix(in srgb, var(--color-ink) 28%, transparent)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <Stat num={50} suffix="+" inAt={0.12} outAt={0.64} />
              <StatLabel>Live sources</StatLabel>
            </div>
            <div>
              <Stat num={100} suffix="%" inAt={0.2} outAt={0.7} />
              <StatLabel>Accuracy</StatLabel>
            </div>
            <div>
              <Stat num={30} prefix="<" suffix=" min" kind="countdown" inAt={0.3} outAt={0.8} />
              <StatLabel>Cutover downtime</StatLabel>
            </div>
          </div>
        </VizFrame>
      </div>
    </StationShell>
  )
}

function StationTranslation({ stationRef }: { stationRef: (el: HTMLDivElement | null) => void }) {
  return (
    <StationShell meta={STATIONS[4]} stationRef={stationRef} ghostLabel={GHOST[4]} frame>
      <div data-copy style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Eyebrow text="Definity" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px, 4.6vw, 76px)', lineHeight: 0.94, letterSpacing: '-0.04em' }}>
          COBOL, translated by LLMs.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-400)', maxWidth: '32ch' }}>Nothing ships until the eval scores it.</p>
      </div>
      <div data-viz>
        <VizFrame>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 40px minmax(0, 1fr)', alignItems: 'stretch', gap: 'clamp(8px, 1.4vw, 20px)', minHeight: 'clamp(160px, 27vh, 270px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', marginBottom: 4 }}>COBOL</span>
              {cobolWidths.map((w, i) => (
                <span key={i} data-anim="seq" data-t="out" data-order={i} data-count="12" style={{ display: 'block', width: `${w}%`, height: 4, background: 'var(--color-neutral-500)' }} />
              ))}
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span aria-hidden="true" style={{ display: 'block', width: 1, height: '100%', background: 'color-mix(in srgb, var(--color-ink) 16%, transparent)' }} />
              <span data-anim="scanline" data-in="0.1" data-out="0.62" aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 0, width: 9, height: 9, marginLeft: -4.5, marginTop: -4.5, borderRadius: '50%', background: 'var(--color-ground)', border: '2px solid var(--sa)', boxShadow: '0 0 8px var(--sa)', opacity: 0 }} />
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(90deg)', fontSize: 8, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sa-soft)', whiteSpace: 'nowrap', background: 'var(--color-ground)', padding: '0 4px' }}>Eval</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sa-soft)', marginBottom: 4 }}>BigQuery SQL</span>
              {sqlWidths.map((w, i) => (
                <span key={i} data-anim="seq" data-t="scaleXLeft" data-order={i} data-count="12" style={{ display: 'block', width: `${w}%`, height: 4, background: 'var(--color-ink)', transformOrigin: 'left center', transform: 'scaleX(0)', opacity: 0.25 }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 26, paddingTop: 16, borderTop: '2px solid color-mix(in srgb, var(--color-ink) 28%, transparent)' }}>
            <div>
              <Stat num={12} inAt={0.16} outAt={0.66} />
              <StatLabel>Workstreams triaged</StatLabel>
            </div>
            <div>
              <Stat num={5} inAt={0.26} outAt={0.74} />
              <StatLabel>Patterns codified</StatLabel>
            </div>
          </div>
        </VizFrame>
      </div>
    </StationShell>
  )
}

function StationGrounded({ stationRef }: { stationRef: (el: HTMLDivElement | null) => void }) {
  return (
    <StationShell meta={STATIONS[5]} stationRef={stationRef} ghostLabel={GHOST[5]} frame>
      <div data-copy style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Eyebrow text="John Wiley & Sons" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px, 4.6vw, 76px)', lineHeight: 0.94, letterSpacing: '-0.04em' }}>
          RAG that cites its sources.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-400)', maxWidth: '32ch' }}>Fifty million documents, inside their VPC.</p>
      </div>
      <div data-viz>
        <VizFrame>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, minmax(0, 1fr))', gap: 4 }}>
            {Array.from({ length: DOC_COUNT }, (_, i) => (
              <span key={i} data-anim="seq" data-t={docDim.has(i) ? 'dim' : 'scale'} data-order={i} data-count="120" style={{ display: 'block', aspectRatio: '1', background: 'var(--color-ink)', transform: 'scale(0.25)', opacity: 0.12 }} />
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 8 }}>
              <span>Grounded accuracy</span>
              <span data-anim="count" data-num="95" data-suffix="%" data-in="0.3" data-out="0.8" style={{ color: 'var(--color-ink)' }}>95%</span>
            </div>
            <div style={{ height: 6, background: 'color-mix(in srgb, var(--color-ink) 16%, transparent)' }}>
              <span data-anim="fill" data-in="0.3" data-out="0.8" style={{ display: 'block', height: '100%', width: '95%', background: 'var(--sa)', transformOrigin: 'left center', transform: 'scaleX(0)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 24, paddingTop: 16, borderTop: '2px solid color-mix(in srgb, var(--color-ink) 28%, transparent)' }}>
            <div>
              <Stat num={50} suffix="M+" inAt={0.12} outAt={0.68} />
              <StatLabel>Documents</StatLabel>
            </div>
            <div>
              <Stat num={60} suffix="%" inAt={0.22} outAt={0.74} />
              <StatLabel>Tickets deflected</StatLabel>
            </div>
            <div>
              <Stat num={1.5} decimals={1} prefix="<" suffix="s" kind="countdown" inAt={0.32} outAt={0.82} />
              <StatLabel>p95 latency</StatLabel>
            </div>
          </div>
        </VizFrame>
      </div>
    </StationShell>
  )
}

/* -------------------------------- driver ------------------------------------ */

export default function Sequence() {
  const reducedMotion = useReducedMotion()
  const stationEls = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number | null>(null)
  const introRef = useRef(0)
  const introTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const stations = stationEls.current.filter((el): el is HTMLDivElement => el !== null)
    if (stations.length === 0) return

    interface Collected {
      el: HTMLDivElement
      accent: string
      plate: HTMLElement | null
      content: HTMLElement | null
      anims: ParsedAnim[]
    }

    const collected: Collected[] = stations.map((el, i) => ({
      el,
      accent: STATIONS[i].accent,
      plate: el.querySelector('[data-plate]'),
      content: el.querySelector('[data-station-content]'),
      anims: Array.from(el.querySelectorAll<HTMLElement>('[data-anim]')).map(parseAnim),
    }))

    if (reducedMotion) {
      collected.forEach((s) => s.anims.forEach(snapFinal))
      return
    }

    const run = () => {
      const vh = window.innerHeight
      collected.forEach((s, i) => {
        const rect = s.el.getBoundingClientRect()
        const span = rect.height - vh
        const prog = clamp01(span > 0 ? -rect.top / span : 0)
        const onScreen = rect.top < vh && rect.bottom > 0
        const drive = i === 0 ? Math.max(prog, introRef.current) : prog

        if (!onScreen) {
          if (s.content) {
            s.content.style.transform = 'none'
            s.content.style.opacity = '1'
          }
          return
        }
        if (s.plate) s.plate.style.transform = `scale(${1.08 + drive * 0.1})`
        if (s.content) {
          const inP = clamp01(drive / 0.08)
          s.content.style.transform = `translate3d(0, ${(1 - inP) * 24}px, 0)`
          s.content.style.opacity = '1'
        }
        s.anims.forEach((a) => applyAnim(a, drive, s.accent))
      })
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        run()
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // One-shot hero intro: the first station reveals itself ~200ms after
    // mount over 1100ms, so the page animates in before the user scrolls.
    introTimerRef.current = window.setTimeout(() => {
      const duration = 1100
      const start = performance.now()
      const tick = (now: number) => {
        introRef.current = clamp01((now - start) / duration)
        run()
        if (introRef.current < 1) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 200)

    run()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (introTimerRef.current !== null) window.clearTimeout(introTimerRef.current)
    }
  }, [reducedMotion])

  const refAt = (i: number) => (el: HTMLDivElement | null) => {
    stationEls.current[i] = el
  }

  return (
    <section aria-label="Career sequence" style={{ position: 'relative' }}>
      <StationIngress stationRef={refAt(0)} />
      <StationLegacy stationRef={refAt(1)} />
      <StationMigration stationRef={refAt(2)} />
      <StationRealtime stationRef={refAt(3)} />
      <StationTranslation stationRef={refAt(4)} />
      <StationGrounded stationRef={refAt(5)} />
    </section>
  )
}
