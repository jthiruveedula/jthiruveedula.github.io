/**
 * DustField — a WebGL dust-particle field layered over the hero flight.
 *
 * 2,400 GPU point sprites drift forward through the camera (positions advance
 * toward the viewer and wrap around). An independent scrubbed ScrollTrigger on
 * `#top` feeds scroll progress into the particle speed and into a shader
 * uniform that grades the field from warm amber (early scroll, legacy era) to
 * the site's cyan accent (deep scroll, AI era).
 *
 * ── Chunk boundary ──
 * `three` is deliberately NEVER imported statically in this module. The
 * `await import('three')` inside the async init below makes Vite emit three
 * as its own lazy chunk (~600 kB) that only loads for this WebGL path — it
 * never enters the main bundle. The `import type` at the top is erased at
 * compile time and adds nothing to any chunk. `webgl-detect` has no three
 * import by design so the gating decision stays in the main chunk.
 *
 * Gating (mirrors JourneyApp exactly): renders null unless motion is allowed
 * AND WebGL is available. Zero-cost failure — no WebGL means no canvas and
 * the existing CSS flight is the complete fallback. Nothing here throws.
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type * as ThreeNS from 'three'
import { useReducedMotion } from '@/lib/hooks'
import { hasWebGL } from '@/journey/webgl-detect'

gsap.registerPlugin(ScrollTrigger)

const PARTICLE_COUNT = 2400
const FIELD_DEPTH = 60
const FIELD_HALF_WIDTH = 30
const FIELD_HALF_HEIGHT = 17
const BASE_SPEED = 6 // world units/sec at scroll progress 0; up to 3x at progress 1

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Gentle lateral drift so the field feels alive between scrolls.
    mv.x += sin(uTime * 0.35 + aSeed * 6.2831) * 0.4;
    mv.y += cos(uTime * 0.27 + aSeed * 4.7124) * 0.3;
    vDepth = clamp(-mv.z / ${FIELD_DEPTH.toFixed(1)}, 0.0, 1.0);
    gl_PointSize = aSize * uPixelRatio * (170.0 / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uProgress;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float disc = smoothstep(0.5, 0.08, d); // soft round sprite, procedural
    float core = smoothstep(0.16, 0.0, d); // hot center
    float alpha = disc * (0.28 + 0.5 * core) * (1.0 - vDepth * 0.8);
    if (alpha < 0.003) discard;
    vec3 amber = vec3(1.0, 0.64, 0.27); // legacy warmth, early scroll
    vec3 cyan = vec3(0.30, 0.82, 0.92); // ≈ --color-accent-500 (oklch 76% 0.17 215)
    vec3 color = mix(amber, cyan, uProgress) + core * 0.4;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`

/** The live scene — mounted only after the gating checks pass. Owns the
 *  ScrollTrigger that drives speed/grading and the pause logic when the
 *  flight section leaves the viewport or the tab hides. */
function DustScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const progressRef = useRef(0)
  const [stage, setStage] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setStage(document.querySelector<HTMLElement>('#top .flight__stage'))
  }, [])

  useEffect(() => {
    if (!stage) return

    let cancelled = false
    let trigger: ScrollTrigger | null = null
    let renderer: ThreeNS.WebGLRenderer | null = null
    let geometry: ThreeNS.BufferGeometry | null = null
    let material: ThreeNS.ShaderMaterial | null = null
    let raf = 0
    let running = false
    let last = 0

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const updateRunning = () => {
      // Pause the rAF loop entirely when the flight section is off-screen or
      // the tab is hidden — zero GPU work while invisible.
      if (trigger && trigger.isActive && !document.hidden) start()
      else stop()
    }
    const onVisibility = () => updateRunning()

    const tick = (now: number) => {
      if (!running || !renderer || !geometry || !material) return
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now

      // Speed accelerates as scroll progress deepens (0 → 1 across the flight).
      const speed = BASE_SPEED * (0.5 + progressRef.current * 2.5)
      const step = speed * dt
      const pos = geometry.attributes.position as ThreeNS.BufferAttribute
      const arr = pos.array as Float32Array
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3
        let z = arr[ix + 2] + step
        if (z > 0.5) {
          // Wrap back to the far plane with a fresh x/y — forward flight.
          z -= FIELD_DEPTH + 0.5
          arr[ix] = (Math.random() * 2 - 1) * FIELD_HALF_WIDTH
          arr[ix + 1] = (Math.random() * 2 - 1) * FIELD_HALF_HEIGHT
        }
        arr[ix + 2] = z
      }
      pos.needsUpdate = true

      material.uniforms.uTime.value = now / 1000
      material.uniforms.uProgress.value = progressRef.current
      renderer.render(rendererScene, rendererCamera)
    }

    // rendererScene / rendererCamera are assigned in init(); tick guards on
    // renderer !== null which is only set after both exist.
    let rendererScene: ThreeNS.Scene
    let rendererCamera: ThreeNS.PerspectiveCamera

    const init = async () => {
      try {
        // Decorative: wait for idle so the 700 kB three chunk never competes
        // with the hero's first paint.
        await new Promise<void>((resolve) =>
          'requestIdleCallback' in window
            ? window.requestIdleCallback(() => resolve(), { timeout: 3000 })
            : setTimeout(resolve, 1500),
        )
        if (cancelled) return
        const THREE = await import('three')
        if (cancelled || !canvasRef.current) return

        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        })
        renderer.setClearColor(0x000000, 0)

        rendererScene = new THREE.Scene()
        rendererCamera = new THREE.PerspectiveCamera(60, 1, 0.1, FIELD_DEPTH + 20)

        const positions = new Float32Array(PARTICLE_COUNT * 3)
        const sizes = new Float32Array(PARTICLE_COUNT)
        const seeds = new Float32Array(PARTICLE_COUNT)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          positions[i * 3] = (Math.random() * 2 - 1) * FIELD_HALF_WIDTH
          positions[i * 3 + 1] = (Math.random() * 2 - 1) * FIELD_HALF_HEIGHT
          positions[i * 3 + 2] = -Math.random() * FIELD_DEPTH
          sizes[i] = 0.5 + Math.random() * 1.8
          seeds[i] = Math.random()
        }
        geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

        material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uPixelRatio: { value: 1 },
          },
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
        })

        const points = new THREE.Points(geometry, material)
        points.frustumCulled = false
        rendererScene.add(points)

        const resize = () => {
          if (!renderer || !material) return
          const w = canvasRef.current?.clientWidth || 1
          const h = canvasRef.current?.clientHeight || 1
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          renderer.setPixelRatio(dpr)
          renderer.setSize(w, h, false)
          rendererCamera.aspect = w / h
          rendererCamera.updateProjectionMatrix()
          material.uniforms.uPixelRatio.value = dpr
        }
        window.addEventListener('resize', resize)
        resize()

        // Independent scrubbed trigger on the same section Flight uses — no
        // pinning anywhere. onUpdate feeds the speed/color ref.
        trigger = ScrollTrigger.create({
          trigger: '#top',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
          onToggle: updateRunning,
        })
        document.addEventListener('visibilitychange', onVisibility)

        // If the section is already in view at mount, start the loop now.
        updateRunning()

        return () => {
          window.removeEventListener('resize', resize)
        }
      } catch {
        // Zero-cost failure: context creation or the dynamic import failed —
        // leave the CSS flight standing alone. Never throws.
      }
    }

    let removeResize: (() => void) | undefined
    init().then((cleanup) => {
      removeResize = cleanup
    })

    return () => {
      cancelled = true
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      removeResize?.()
      trigger?.kill()
      trigger = null
      geometry?.dispose()
      material?.dispose()
      renderer?.dispose()
      renderer = null
    }
  }, [stage])

  if (!stage) return null

  // Portaled INTO .flight__stage so the wrapper shares its stacking context
  // (it has `isolation: isolate`). Stage children: planes z 1–7, vignette 15,
  // grain 18, horizon line 20, letterbox bars 25, copy/counter/skip 30 — so
  // z-index 21 sits above every plate and the horizon but below the letterbox
  // chrome and all copy/furniture. Absolute + inset-0 inside the sticky stage
  // contributes zero layout shift; pointer-events none; decorative only.
  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 21,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        data-dust
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>,
    stage,
  )
}

export default function DustField() {
  const reduced = useReducedMotion()
  const [webgl, setWebgl] = useState<boolean | null>(null)

  useEffect(() => {
    setWebgl(hasWebGL())
  }, [])

  // webgl === null is the one-tick "not yet checked" state — render nothing
  // until the check resolves.
  if (reduced || webgl !== true) return null
  return <DustScene />
}
