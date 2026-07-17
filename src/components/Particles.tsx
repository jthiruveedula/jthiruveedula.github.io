import { useEffect, useRef } from 'react'
import { useReducedMotion, useIsMobile } from '@/lib/hooks'

const COLORS = ['#f59e0b', '#22d3ee', '#a78bfa']

interface Mote {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
  twinkle: number
  color: string
}

/**
 * Ambient particle field — drifting era-tinted motes that impersonate the
 * "particles" effect in Higgsfield's cinematic stack (grain + vignette +
 * glass + tints + scroll pacing already covered). Lightweight canvas, no
 * layout cost, paused when offscreen/hidden. Reduced-motion + touch: nothing.
 */
export default function Particles() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced || isMobile) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let motes: Mote[] = []
    let raf = 0
    let running = true

    const seed = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(64, Math.floor((width * height) / 24000))
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.5,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12 - 0.04,
        alpha: Math.random() * 0.4 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }))
    }

    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, width, height)
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
        m.twinkle += 0.02
        if (m.x < -4) m.x = width + 4
        else if (m.x > width + 4) m.x = -4
        if (m.y < -4) m.y = height + 4
        else if (m.y > height + 4) m.y = -4

        const a = m.alpha * (0.65 + Math.sin(m.twinkle) * 0.35)
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = m.color
        ctx.globalAlpha = Math.max(0, a)
        ctx.shadowBlur = 6
        ctx.shadowColor = m.color
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(draw)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        raf = requestAnimationFrame(draw)
      }
    }

    seed()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', seed)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', seed)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, isMobile])

  if (reduced || isMobile) return null

  return <canvas ref={canvasRef} aria-hidden="true" className="atmosphere__particles" />
}
