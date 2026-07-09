import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ERA_COLORS } from '@/data/types'

/**
 * Hero backdrop — the "data mindscape".
 *
 * Three instanced-cube clusters arranged left → right tell the career story:
 *  - amber legacy monolith: a rigid lattice grid (structured, on-prem)
 *  - cyan cloud stream: a loose swirling particle swarm (elastic, in motion)
 *  - violet AI constellation: points breathing on a neural shell with hub nodes
 * A migration flow of particles travels continuously legacy → cloud → AI,
 * recoloring through the era ramp as it crosses — data literally migrating.
 *
 * On load everything converges from a scattered burst (introRef, tweened by
 * GSAP in Hero.tsx); scroll shifts cluster emphasis (emphasisRef, ScrollTrigger
 * scrub in Hero.tsx); pointer move applies a damped parallax drift.
 *
 * Perf contract: ONE InstancedMesh (one draw call), 2400 instances desktop /
 * 720 mobile (≤2500 / ≤800), dpr [1, 2], frameloop paused when offscreen and
 * a single static frame under prefers-reduced-motion.
 */

const KIND_LEGACY = 0
const KIND_CLOUD = 1
const KIND_AI = 2
// any other kind value = migration flow

const CLUSTER_X = 8 // nominal half-distance between outer clusters (compressed on narrow viewports)

interface ClusterCounts {
  total: number
  legacyDims: [number, number, number]
  cloud: number
  ai: number
  flow: number
}

// 240 + 1200 + 560 + 400 = 2400 ≤ 2500
const DESKTOP_COUNTS: ClusterCounts = { total: 2400, legacyDims: [6, 10, 4], cloud: 1200, ai: 560, flow: 400 }
// 96 + 360 + 168 + 96 = 720 ≤ 800 (~70% cut per spec)
const MOBILE_COUNTS: ClusterCounts = { total: 720, legacyDims: [4, 6, 4], cloud: 360, ai: 168, flow: 96 }

export interface HeroSceneProps {
  /** Section on screen — drives the frameloop so an offscreen hero costs nothing. */
  active: boolean
  reducedMotion: boolean
  isMobile: boolean
  /** Normalized pointer (-1..1 both axes), written by the DOM layer in Hero.tsx. */
  pointerRef: RefObject<{ x: number; y: number }>
  /** Intro convergence progress (0 = scattered burst → 1 = mindscape), tweened by GSAP. */
  introRef: RefObject<{ p: number }>
  /** Scroll progress through the section (0..1) — shifts cluster emphasis left → right. */
  emphasisRef: RefObject<{ e: number }>
}

type SceneRefs = Pick<HeroSceneProps, 'pointerRef' | 'introRef' | 'emphasisRef'>

interface ParticleData {
  kind: Uint8Array
  /** Home position; for AI particles this holds the unit shell direction instead. */
  base: Float32Array
  radius: Float32Array
  theta0: Float32Array
  speed: Float32Array
  phase: Float32Array
  size: Float32Array
  flowT: Float32Array
  scatter: Float32Array
  colors: Float32Array
}

const STOP_LEGACY = new THREE.Color(ERA_COLORS.legacy)
const STOP_CLOUD = new THREE.Color(ERA_COLORS.cloud)
const STOP_AI = new THREE.Color(ERA_COLORS.ai)

const AI_CENTER = new THREE.Vector3(CLUSTER_X, 0.5, -1)

function smoothstep(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

/** Era color ramp along the migration path (0 = legacy amber → 1 = AI violet). */
function rampColor(t: number, out: THREE.Color): THREE.Color {
  if (t < 0.5) out.lerpColors(STOP_LEGACY, STOP_CLOUD, smoothstep(t / 0.5))
  else out.lerpColors(STOP_CLOUD, STOP_AI, smoothstep((t - 0.5) / 0.5))
  return out
}

/** Intro burst shell the particles collapse inward from. */
function setScatter(scatter: Float32Array, i: number, dir: THREE.Vector3): void {
  dir.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
  const dist = 12 + Math.random() * 12
  scatter[i * 3] = dir.x * dist
  scatter[i * 3 + 1] = dir.y * dist * 0.6
  scatter[i * 3 + 2] = dir.z * dist * 0.4 - 2
}

function setColor(colors: Float32Array, i: number, c: THREE.Color, brightness: number): void {
  colors[i * 3] = c.r * brightness
  colors[i * 3 + 1] = c.g * brightness
  colors[i * 3 + 2] = c.b * brightness
}

function buildParticles(counts: ClusterCounts): ParticleData {
  const n = counts.total
  const data: ParticleData = {
    kind: new Uint8Array(n),
    base: new Float32Array(n * 3),
    radius: new Float32Array(n),
    theta0: new Float32Array(n),
    speed: new Float32Array(n),
    phase: new Float32Array(n),
    size: new Float32Array(n),
    flowT: new Float32Array(n),
    scatter: new Float32Array(n * 3),
    colors: new Float32Array(n * 3),
  }
  const color = new THREE.Color()
  const dir = new THREE.Vector3()
  let i = 0

  // Legacy monolith — rigid amber lattice, the on-prem system of record.
  const [dx, dy, dz] = counts.legacyDims
  for (let ix = 0; ix < dx; ix++) {
    for (let iy = 0; iy < dy; iy++) {
      for (let iz = 0; iz < dz; iz++, i++) {
        data.kind[i] = KIND_LEGACY
        data.base[i * 3] = -CLUSTER_X + (ix - (dx - 1) / 2) * 0.52 + (Math.random() - 0.5) * 0.05
        data.base[i * 3 + 1] = (iy - (dy - 1) / 2) * 0.52 + 0.2 + (Math.random() - 0.5) * 0.05
        data.base[i * 3 + 2] = -1.2 + (iz - (dz - 1) / 2) * 0.52
        data.phase[i] = Math.random() * Math.PI * 2
        data.speed[i] = 0.4 + Math.random() * 0.4
        data.size[i] = 0.07 + Math.random() * 0.03
        setScatter(data.scatter, i, dir)
        setColor(data.colors, i, color.copy(STOP_LEGACY), 0.5 + Math.random() * 0.4)
      }
    }
  }

  // Cloud stream — loose cyan swarm swirling mid-frame (denser at the core).
  for (let k = 0; k < counts.cloud; k++, i++) {
    data.kind[i] = KIND_CLOUD
    const gx = (Math.random() + Math.random() + Math.random()) / 1.5 - 1
    const gy = (Math.random() + Math.random() + Math.random()) / 1.5 - 1
    const gz = (Math.random() + Math.random() + Math.random()) / 1.5 - 1
    data.base[i * 3] = gx * 3.4
    data.base[i * 3 + 1] = gy * 1.6 + 0.3
    data.base[i * 3 + 2] = gz * 1.3 - 0.8
    data.radius[i] = 0.2 + Math.random() * 0.55
    data.theta0[i] = Math.random() * Math.PI * 2
    data.speed[i] = 0.2 + Math.random() * 0.6
    data.phase[i] = Math.random() * Math.PI * 2
    data.size[i] = 0.03 + Math.random() * Math.random() * 0.05
    setScatter(data.scatter, i, dir)
    setColor(data.colors, i, color.copy(STOP_CLOUD), (0.45 + Math.random() * 0.55) * (1 - Math.abs(gx) * 0.3))
  }

  // AI constellation — violet neural shell with a few bright hub nodes.
  for (let k = 0; k < counts.ai; k++, i++) {
    data.kind[i] = KIND_AI
    dir.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
    data.base[i * 3] = dir.x
    data.base[i * 3 + 1] = dir.y
    data.base[i * 3 + 2] = dir.z
    data.radius[i] = 1.5 + Math.random() * 1.5 // shell radius
    data.speed[i] = 0.5 + Math.random() * 1.4 // twinkle rate
    data.phase[i] = Math.random() * Math.PI * 2
    const hub = k % 70 === 0
    data.size[i] = hub ? 0.12 : 0.03 + Math.random() * 0.045
    setScatter(data.scatter, i, dir)
    setColor(data.colors, i, color.copy(STOP_AI), hub ? 1 : 0.4 + Math.random() * 0.5)
  }

  // Migration flow — particles travelling legacy → cloud → AI, recolored en route.
  for (let k = 0; k < counts.flow; k++, i++) {
    data.kind[i] = 3
    data.flowT[i] = Math.random()
    data.speed[i] = 0.02 + Math.random() * 0.035 // loop progress per second
    data.phase[i] = Math.random() * Math.PI * 2
    data.size[i] = 0.03 + Math.random() * 0.035
    setScatter(data.scatter, i, dir)
    setColor(data.colors, i, rampColor(data.flowT[i], color), 0.9)
  }

  return data
}

function Mindscape({
  counts,
  reducedMotion,
  pointerRef,
  introRef,
  emphasisRef,
}: SceneRefs & { counts: ClusterCounts; reducedMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const invalidate = useThree((state) => state.invalidate)

  const data = useMemo(() => buildParticles(counts), [counts])
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
      color: new THREE.Color(),
    }),
    [],
  )

  // Per-instance colors, set once per particle set (flow colors update per frame).
  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < counts.total; i++) {
      scratch.color.setRGB(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2])
      mesh.setColorAt(i, scratch.color)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    invalidate() // guarantee one frame even in demand mode (reduced motion / offscreen)
  }, [counts, data, scratch, invalidate])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    // Reduced motion: freeze time — the mindscape renders as a single still frame.
    const time = reducedMotion ? 0 : state.clock.getElapsedTime()
    const e = easeInOutCubic(Math.min(Math.max(introRef.current.p, 0), 1))
    const grow = 0.25 + 0.75 * e
    // Compress cluster spread on narrow viewports so all three eras stay on screen.
    const xScale = Math.max(0.35, Math.min(1, state.viewport.width / 22))
    // Scroll emphasis pushes clusters apart and accelerates the migration flow.
    const emphasis = Math.min(Math.max(emphasisRef.current.e, 0), 1)
    const spread = 1 + emphasis * 0.7
    const flowBoost = 1 + emphasis * 1.2
    const { kind, base, radius, theta0, speed, phase, size, flowT, scatter } = data
    const { matrix, position, quaternion, scale, color } = scratch
    let flowDirty = false

    for (let i = 0; i < counts.total; i++) {
      const j = i * 3
      const ph = phase[i]
      let x = base[j]
      let y = base[j + 1]
      let z = base[j + 2]
      let s = size[i]

      switch (kind[i]) {
        case KIND_LEGACY:
          // Rigid grid with the faintest sway + pulse — old, but still alive.
          x *= spread
          y += Math.sin(time * speed[i] + ph) * 0.04
          s *= 0.9 + 0.1 * Math.sin(time * speed[i] * 2 + ph)
          break
        case KIND_CLOUD: {
          // Swirling orbit around each anchor point.
          const th = theta0[i] + time * speed[i]
          x += Math.cos(th) * radius[i] * 0.6 + Math.sin(time * 0.5 + ph) * 0.25
          y += Math.sin(th) * radius[i] * 0.4 + Math.sin(time * 0.7 + ph) * 0.3
          z += Math.sin(th) * radius[i] * 0.5
          s *= 0.8 + 0.2 * Math.sin(time * 1.4 + ph)
          break
        }
        case KIND_AI: {
          // Breathing shell + twinkle; base holds the unit direction.
          const shell = radius[i] + Math.sin(time * 0.4 + ph) * 0.12
          x = AI_CENTER.x * spread + base[j] * shell
          y = AI_CENTER.y + base[j + 1] * shell
          z = AI_CENTER.z + base[j + 2] * shell
          s *= 0.75 + 0.25 * Math.sin(time * speed[i] + ph)
          break
        }
        default: {
          // Migration flow: loop along the arc, recoloring through the eras.
          const t = (flowT[i] + time * speed[i] * flowBoost) % 1
          x = -CLUSTER_X * spread + t * CLUSTER_X * 2 * spread
          y = Math.sin(t * Math.PI) * 1.5 - 0.2 + Math.sin(time * 1.2 + ph) * 0.15
          z = -0.9 + Math.sin(t * 8 + ph) * 0.5
          if (!reducedMotion) {
            mesh.setColorAt(i, rampColor(t, color).multiplyScalar(0.9))
            flowDirty = true
          }
          break
        }
      }

      // Intro: lerp from the scattered burst into the mindscape.
      position.set(
        (scatter[j] + (x - scatter[j]) * e) * xScale,
        scatter[j + 1] + (y - scatter[j + 1]) * e,
        scatter[j + 2] + (z - scatter[j + 2]) * e,
      )
      scale.setScalar(s * grow)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(i, matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (flowDirty && mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    // Scroll emphasis pans attention legacy → AI; pointer adds damped parallax.
    const group = groupRef.current
    if (group) {
      const pointer = pointerRef.current
      const targetX = (0.5 - emphasis) * 3.5 * xScale
      const targetRotY = pointer.x * 0.12 + (emphasis - 0.5) * 0.18
      const targetRotX = -pointer.y * 0.07 + emphasis * 0.06
      const targetZ = -emphasis * 2.2
      if (reducedMotion) {
        group.position.x = targetX
        group.position.z = targetZ
      } else {
        group.position.x = THREE.MathUtils.damp(group.position.x, targetX, 2.5, delta)
        group.position.z = THREE.MathUtils.damp(group.position.z, targetZ, 2.5, delta)
        group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetRotY, 2.5, delta)
        group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetRotX, 2.5, delta)
      }
    }
  })

  return (
    <group ref={groupRef}>
      <instancedMesh key={counts.total} ref={meshRef} args={[geometry, material, counts.total]} frustumCulled={false} />
    </group>
  )
}

export default function HeroScene({
  active,
  reducedMotion,
  isMobile,
  pointerRef,
  introRef,
  emphasisRef,
}: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      flat
      frameloop={active && !reducedMotion ? 'always' : 'demand'}
      camera={{ position: [0, 0.2, 16], fov: 48, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Mindscape
        counts={isMobile ? MOBILE_COUNTS : DESKTOP_COUNTS}
        reducedMotion={reducedMotion}
        pointerRef={pointerRef}
        introRef={introRef}
        emphasisRef={emphasisRef}
      />
    </Canvas>
  )
}
