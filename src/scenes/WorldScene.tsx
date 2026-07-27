import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { worldScenes } from '@/data/scenes'

/**
 * The scroll-driven camera flight.
 *
 * There is no video and no timeline: the camera's position is a pure function of
 * `progressRef.current` (0 → 1), so scrolling up reverses the flight exactly and
 * a scene boundary has nothing to snap to. Nothing here triggers a React render
 * per frame — progress arrives through a ref and is applied straight to the
 * object matrices.
 *
 * Station geometry: scene `i` sits at z = -(BASE + (i - t) * SPACING) where
 * t = progress * (N - 1). At t === i the quad is BASE away and fills the frame;
 * at t === i - 1 it is one SPACING further out, so the next scene is visible as a
 * small lit rectangle in the void long before you arrive at it. Because SPACING >
 * BASE the quad crosses the camera plane shortly after its station, which reads as
 * sweeping past rather than dissolving.
 */

const BASE = 8 // distance from camera to a scene at its station
const SPACING = 10 // z-distance between consecutive stations
const FOV = 45
const IMAGE_ASPECT = 16 / 9
const OVERSCAN = 1.1 // hides the quad edge during lateral camera drift
/** Extra zoom applied to a station as the camera passes through it. */
const PASS_ZOOM = 0.55
/** Depth of the drifting dust volume, and how far ahead/behind a quad stays mounted. */
const DUST_RANGE = 46
const MOUNT_WINDOW = 1.75

const VOID = new THREE.Color('#050810')

function smoothstep(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/**
 * Shared alpha map that feathers each quad's outermost band to nothing.
 *
 * Quads are scaled to cover the frame at any depth (see `SceneQuad`), so this band
 * normally sits just outside the viewport — it exists so lateral camera drift can
 * never expose a hard rectangle edge against the void. Built once, reused by every
 * station. Keep it narrower than `OVERSCAN` or it will darken the visible frame.
 */
const FEATHER = 0.04
function buildFeatherMap(): THREE.Texture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size
      const v = (y + 0.5) / size
      const edge = Math.min(u, 1 - u, v, 1 - v)
      const a = Math.round(smoothstep(edge / FEATHER) * 255)
      const i = (y * size + x) * 4
      image.data[i] = a
      image.data[i + 1] = a
      image.data[i + 2] = a
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

interface QuadFrame {
  size: [number, number]
  /** Vertical placement at the station distance; scales with depth in `SceneQuad`. */
  offsetY: number
}

/**
 * Quad geometry at the station distance, in world units.
 *
 * Landscape viewports **cover**: the 16:9 still is scaled until it fills the frame,
 * losing a little top and bottom.
 *
 * Portrait viewports **contain** instead. Covering a 16:9 image on a tall phone would
 * crop away roughly three quarters of its width and leave only the centre strip — the
 * composition, and the whole point of the scene, goes with it. So the full frame is
 * fitted to the viewport width and anchored near the top, which both preserves the
 * shot and leaves clean void underneath for the copy to sit on legibly.
 */
function quadFrame(aspect: number, contain: boolean): QuadFrame {
  const visibleHeight = 2 * BASE * Math.tan((FOV / 2) * (Math.PI / 180))
  const visibleWidth = visibleHeight * aspect

  if (contain) {
    const w = visibleWidth
    const h = w / IMAGE_ASPECT
    // Top-anchored, nudged down slightly so it clears the fixed site header.
    const offsetY = visibleHeight / 2 - h / 2 - visibleHeight * 0.04
    return { size: [w, h], offsetY }
  }

  const [w, h] =
    aspect > IMAGE_ASPECT
      ? [visibleWidth, visibleWidth / IMAGE_ASPECT]
      : [visibleHeight * IMAGE_ASPECT, visibleHeight]
  return { size: [w * OVERSCAN, h * OVERSCAN], offsetY: 0 }
}

interface SceneQuadProps {
  index: number
  url: string
  progressRef: RefObject<{ p: number }>
  frame: QuadFrame
  featherMap: THREE.Texture
}

/** One station: a textured quad that dollies in, peaks, then sweeps past the camera. */
function SceneQuad({ index, url, progressRef, frame, featherMap }: SceneQuadProps) {
  const texture = useTexture(url)
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    // A station is only ever drawn at roughly 1:1 or larger, so mipmaps are never
    // sampled — generating them costs a third more GPU memory plus a per-texture
    // downsample chain on upload, which is pure waste here.
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
  }, [texture])

  // Free the GPU copy when the station unmounts. The decoded image stays in the loader
  // cache, so flying back to it re-uploads without re-downloading.
  useEffect(() => () => texture.dispose(), [texture])

  useFrame(() => {
    const mesh = meshRef.current
    const material = materialRef.current
    if (!mesh || !material) return

    const t = (progressRef.current?.p ?? 0) * (worldScenes.length - 1)
    const delta = index - t
    const distance = BASE + delta * SPACING

    mesh.position.z = -distance

    // Scale with distance so the quad subtends the same angle at any depth: a flat
    // plane cannot both dolly and stay edge-free, and a hard rectangle floating in
    // the void breaks the illusion far worse than a fixed framing does. The sense of
    // forward motion comes from the pass-through zoom below, the streaming dust, and
    // the drifting camera instead.
    const cover = Math.max(0.001, distance / BASE)
    // Once passed (delta < 0) the station blows up past the frame edges — that zoom
    // is what reads as flying *through* a scene rather than dissolving out of it.
    const passZoom = 1 + Math.max(0, -delta) * PASS_ZOOM
    mesh.scale.setScalar(cover * passZoom)
    // The offset scales with depth too, so a contained frame stays put on screen
    // instead of sliding as the station approaches.
    mesh.position.y = frame.offsetY * cover * passZoom

    // Asymmetric crossfade: a station ahead fades in over its full approach, but
    // clears out ~1.6x faster once passed. Symmetric fades leave two half-opacity
    // scenes stacked at the midpoint, which reads as a dissolve.
    const opacity = delta >= 0 ? smoothstep(1 - delta) : smoothstep(1 + delta * 1.6)
    material.opacity = opacity

    // Aerial perspective: the further out a station is, the more the haze eats it.
    const farness = Math.min(1, Math.max(0, delta))
    material.color.setScalar(1 - farness * 0.4)

    mesh.visible = opacity > 0.002
  })

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[frame.size[0], frame.size[1]]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        alphaMap={featherMap}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        // Scene fog is for the dust volume only — quads get their aerial perspective
        // from the explicit colour dim above, so they never double-darken.
        fog={false}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

/**
 * Mount gate: keeps only the quads near the current station in the scene graph, so the
 * seven stills are fetched as the flight approaches them rather than up front, and
 * stations left behind release their GPU memory instead of accumulating all seven
 * full-screen textures for the rest of the session.
 */
function useMountedStations(progressRef: RefObject<{ p: number }>) {
  const initial = [0, 1]
  const [mounted, setMounted] = useState<number[]>(initial)
  const mountedRef = useRef(initial)

  useFrame(() => {
    const t = (progressRef.current?.p ?? 0) * (worldScenes.length - 1)
    const next = worldScenes.map((_, i) => i).filter((i) => Math.abs(i - t) <= MOUNT_WINDOW)
    const previous = mountedRef.current
    if (next.length !== previous.length || next.some((i, index) => i !== previous[index])) {
      mountedRef.current = next
      setMounted(next)
    }
  })

  return mounted
}

/** Camera drift + era-tinted dust, both pure functions of scroll progress. */
function Flight({ progressRef, dustCount }: { progressRef: RefObject<{ p: number }>; dustCount: number }) {
  const { camera, scene } = useThree()
  const pointsRef = useRef<THREE.Points>(null)

  /**
   * The dust volume is built as two identical tiles, one a full `DUST_RANGE` behind
   * the other. Streaming it is then a single object translation wrapped into
   * [0, DUST_RANGE) — the trailing tile always covers the gap the leading one opens,
   * so the field looks infinite while costing nothing per frame. Writing every
   * vertex each frame instead meant a full buffer re-upload, which is what pushed
   * throttled mobile below 60fps.
   */
  const positions = useMemo(() => {
    const arr = new Float32Array(dustCount * 2 * 3)
    for (let i = 0; i < dustCount; i += 1) {
      const x = (Math.random() - 0.5) * 16
      const y = (Math.random() - 0.5) * 10
      const z = -Math.random() * DUST_RANGE
      arr[i * 3] = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
      const j = (dustCount + i) * 3
      arr[j] = x
      arr[j + 1] = y
      arr[j + 2] = z - DUST_RANGE
    }
    return arr
  }, [dustCount])

  const accentColors = useMemo(() => worldScenes.map((s) => new THREE.Color(s.accent)), [])
  const dustColor = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    scene.fog = new THREE.Fog(VOID.getHex(), BASE * 0.55, BASE + SPACING * 1.7)
    return () => {
      scene.fog = null
    }
  }, [scene])

  useFrame(() => {
    const p = progressRef.current?.p ?? 0
    const t = p * (worldScenes.length - 1)

    // Gentle flight path — never large enough to expose a quad edge, but enough
    // that the movement reads as a camera and not a crossfade.
    camera.position.x = Math.sin(t * 0.9) * 0.55
    camera.position.y = Math.cos(t * 0.7) * 0.34
    camera.rotation.z = Math.sin(t * 0.5) * 0.012
    camera.lookAt(camera.position.x * 0.35, camera.position.y * 0.35, -BASE)

    const points = pointsRef.current
    if (!points) return

    // Dust streams toward the camera and wraps — a pure function of t in both
    // directions, so reversing the scroll reverses the stream cleanly.
    const travel = t * SPACING
    points.position.z = ((travel % DUST_RANGE) + DUST_RANGE) % DUST_RANGE

    // Accent crossfades between the two stations the camera sits between.
    const lower = Math.max(0, Math.min(worldScenes.length - 1, Math.floor(t)))
    const upper = Math.min(worldScenes.length - 1, lower + 1)
    dustColor.copy(accentColors[lower]).lerp(accentColors[upper], t - lower)
    const material = points.material as THREE.PointsMaterial
    material.color.copy(dustColor)
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

function World({
  progressRef,
  isMobile,
  dustCount,
}: {
  progressRef: RefObject<{ p: number }>
  isMobile: boolean
  dustCount: number
}) {
  const { viewport } = useThree()
  // Portrait viewports get the contained frame; everything else covers.
  const frame = useMemo(() => quadFrame(viewport.aspect, viewport.aspect < 1), [viewport.aspect])
  const featherMap = useMemo(buildFeatherMap, [])
  const mounted = useMountedStations(progressRef)

  useEffect(() => () => featherMap.dispose(), [featherMap])

  return (
    <>
      <Flight progressRef={progressRef} dustCount={dustCount} />
      {mounted.map((i) => (
        <Suspense key={worldScenes[i].id} fallback={null}>
          <SceneQuad
            index={i}
            url={isMobile ? worldScenes[i].stillMobile : worldScenes[i].still}
            progressRef={progressRef}
            frame={frame}
            featherMap={featherMap}
          />
        </Suspense>
      ))}
    </>
  )
}

export interface WorldSceneProps {
  /** Scroll progress through the flight, 0 → 1. Written by ScrollTrigger. */
  progressRef: RefObject<{ p: number }>
  /** False when the world is offscreen — stops the frameloop entirely. */
  active: boolean
  isMobile: boolean
}

export default function WorldScene({ progressRef, active, isMobile }: WorldSceneProps) {
  const dustCount = isMobile ? 110 : 460

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      // Two or three full-screen transparent quads make this fill-rate bound, so the
      // mobile pixel ratio is capped well below device DPR.
      dpr={[1, isMobile ? 1.25 : 1.75]}
      gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
      camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 0, 0] }}
      onCreated={({ gl }) => {
        gl.setClearColor(VOID, 1)
      }}
    >
      <World progressRef={progressRef} isMobile={isMobile} dustCount={dustCount} />
    </Canvas>
  )
}
