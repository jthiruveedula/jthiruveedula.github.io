import * as THREE from 'three'
import { chapters, ERA_COLOR } from './chapters'
import { createSky, litRatio } from './sky'
import { createLabels, type LabelSpec } from './labels'
import { createBloom, type Bloom } from './bloom'
import { createInteraction, type Interaction } from './interaction'
import type { Layer } from './layers'
import type { Landmark, LandmarkApi, LandmarkHandlers } from './landmarks'

/**
 * Plain three.js (no @react-three/fiber: a second reconciler isn't justified
 * for one imperative scene). One compact city on a blueprint grid, four
 * districts around a central AI spire, one district per chapter:
 *
 *   0 foundations  SW  low warehouses
 *   1 cloud        SE  towers
 *   2 accelerators NE  towers with glowing crowns
 *   3 deployed     NW  towers + bridges linking every district
 *   4 applied AI   centre spire, beams from every district's tallest tower
 *
 * `setProgress(0..1)` is the only input. The camera orbits clockwise from
 * district to district and then pulls back to the whole skyline. Buildings,
 * crowns and traffic are InstancedMeshes, and the windows are drawn in the
 * building shader from world position, so the draw-call count stays flat.
 */

const DISTRICTS = [
  { cx: -6.5, cz: 6.5, hMin: 1.0, hMax: 2.2 },
  { cx: 6.5, cz: 6.5, hMin: 3.5, hMax: 7.5 },
  { cx: 6.5, cz: -6.5, hMin: 4.5, hMax: 9.0 },
  { cx: -6.5, cz: -6.5, hMin: 3.0, hMax: 6.5 },
]
const LOTS = 3 // lots per side in each district
const LOT = 2.3 // lot spacing
const SPIRE_H = 17
const PLAZA = { x: 2.4, z: 2.4, w: 1.3, h: 6 } // district 4: tower beside the spire
const PLAZA_PROJECT = 'wiley-snowflake-bigquery'
const INTRO_SEC = 2
const INTRO_FROM = { pos: [34, 38, 34], look: [0, 4, 0] } as const
const PACKETS = 90
const BEAM_PULSES = 4

// Camera stops, one per chapter; the final stop pulls back to the full skyline.
const STOPS = [
  { focus: [-6.5, 1, 6.5], az: 135, radius: 15, height: 8 },
  { focus: [6.5, 3, 6.5], az: 45, radius: 19, height: 11 },
  { focus: [6.5, 4, -6.5], az: -45, radius: 21, height: 13 },
  { focus: [-6.5, 3, -6.5], az: -135, radius: 22, height: 15 },
  { focus: [0, 7.5, 0], az: -200, radius: 44, height: 21 },
] as const

const dummy = new THREE.Object3D()
const smooth = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

type Building = { d: number; x: number; z: number; w: number; dpt: number; h: number; stagger: number }

export class City implements LandmarkApi {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300)
  private clock = new THREE.Clock()
  private uniforms = { uTime: { value: 0 }, uLit: { value: 0.35 } }
  private resizeObserver: ResizeObserver
  private raf = 0
  private progress = 0
  private disposables: { dispose(): void }[] = []

  private buildings: Building[] = []
  private buildingMesh: THREE.InstancedMesh
  private crownMesh: THREE.InstancedMesh
  private crownIdx: number[] = []
  private packetMesh: THREE.InstancedMesh
  private packetPaths: { a: THREE.Vector3; b: THREE.Vector3; speed: number; phase: number }[] = []
  private bridges: THREE.Mesh[] = []
  private beams: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3 }[] = []
  private pulseMesh: THREE.InstancedMesh
  private spire: THREE.Group
  private spireGlow: THREE.Mesh
  private spireRing: THREE.Mesh
  private spireLight: THREE.PointLight
  private sky: Layer
  private labels: Layer
  private bloom: Bloom
  private interaction: Interaction | null = null
  private handlers: LandmarkHandlers | null = null
  private introStart = -1
  private lookAt = new THREE.Vector3()

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    this.renderer.setClearColor(0x05070d, 0)
    this.scene.fog = new THREE.Fog(0x05070d, 30, 95)
    this.sky = createSky({ scene: this.scene })

    this.scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x05070d, 0.75))
    const sun = new THREE.DirectionalLight(0xffffff, 0.9)
    sun.position.set(-10, 22, 14)
    this.scene.add(sun)

    const ai = new THREE.Color(ERA_COLOR.ai)
    this.buildGround(ai)
    this.buildingMesh = this.buildBuildings(ai)
    this.crownMesh = this.buildCrowns(ai)
    this.packetMesh = this.buildTraffic(ai)
    this.buildBridges(ai)
    const spire = this.buildSpire(ai)
    this.spire = spire.group
    this.spireGlow = spire.glow
    this.spireRing = spire.ring
    this.spireLight = spire.light
    this.pulseMesh = this.buildBeams(ai)
    this.labels = createLabels(this.scene, this.camera, this.labelSpecs(), (d, p) => this.growth(d, p))
    this.bloom = createBloom({ scene: this.scene, camera: this.camera, renderer: this.renderer })

    this.setProgress(0)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
  }

  private track<T extends { dispose(): void }>(x: T): T {
    this.disposables.push(x)
    return x
  }

  private buildGround(ai: THREE.Color) {
    const ground = new THREE.Mesh(
      this.track(new THREE.PlaneGeometry(200, 200)),
      this.track(new THREE.MeshStandardMaterial({ color: 0x080b13, roughness: 1 })),
    )
    ground.rotation.x = -Math.PI / 2
    this.scene.add(ground)

    const grid = new THREE.GridHelper(48, 48, ai, 0x1a2230)
    const gm = grid.material as THREE.LineBasicMaterial
    gm.transparent = true
    gm.opacity = 0.18
    grid.position.y = 0.01
    this.track(grid.geometry)
    this.track(gm)
    this.scene.add(grid)

    // District plots and avenues: the land is surveyed before anything is built.
    const plotMat = this.track(new THREE.MeshStandardMaterial({ color: 0x0f1420, roughness: 0.9 }))
    const plotGeo = this.track(new THREE.BoxGeometry(1, 0.08, 1))
    for (const d of DISTRICTS) {
      const plot = new THREE.Mesh(plotGeo, plotMat)
      plot.scale.set(LOTS * LOT + 0.8, 1, LOTS * LOT + 0.8)
      plot.position.set(d.cx, 0.04, d.cz)
      this.scene.add(plot)
    }
    const roadMat = this.track(new THREE.MeshStandardMaterial({ color: 0x151b27, roughness: 0.8 }))
    for (const [w, dpt] of [[1.4, 30], [30, 1.4]]) {
      const road = new THREE.Mesh(plotGeo, roadMat)
      road.scale.set(w, 0.5, dpt)
      road.position.y = 0.02
      this.scene.add(road)
    }
    const ring = new THREE.Mesh(
      this.track(new THREE.RingGeometry(12.3, 13.1, 4, 1, Math.PI / 4)),
      roadMat,
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.03
    this.scene.add(ring)
  }

  private buildBuildings(ai: THREE.Color): THREE.InstancedMesh {
    let seed = 20150101
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }
    DISTRICTS.forEach((dist, d) => {
      for (let i = 0; i < LOTS; i++) {
        for (let j = 0; j < LOTS; j++) {
          if (d === 0 && i === 1 && j === 1) continue // courtyard in the old district
          const legacy = d === 0
          const w = legacy ? 1.9 : 1.1 + rand() * 0.5
          const dpt = legacy ? 1.5 + rand() * 0.4 : 1.1 + rand() * 0.5
          // Taller towers toward the city centre, so the skyline climbs to the spire.
          const toCentre = 1 - (Math.abs(dist.cx + (i - 1) * LOT) + Math.abs(dist.cz + (j - 1) * LOT)) / 22
          const h = dist.hMin + (dist.hMax - dist.hMin) * clamp01(0.35 * rand() + 0.9 * toCentre)
          this.buildings.push({
            d,
            x: dist.cx + (i - 1) * LOT,
            z: dist.cz + (j - 1) * LOT,
            w,
            dpt,
            h,
            stagger: rand() * 0.45,
          })
        }
      }
    })

    this.buildings.push({ d: 4, x: PLAZA.x, z: PLAZA.z, w: PLAZA.w, dpt: PLAZA.w, h: PLAZA.h, stagger: 0.1 })

    const mat = this.track(new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.15 }))
    const uniforms = this.uniforms
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uLit = uniforms.uLit
      shader.uniforms.uWindow = { value: ai.clone().lerp(new THREE.Color(0xffffff), 0.35) }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNormal;')
        .replace(
          '#include <project_vertex>',
          `#include <project_vertex>
          vec4 wp = vec4(transformed, 1.0);
          vec3 wn = objectNormal;
          #ifdef USE_INSTANCING
            wp = instanceMatrix * wp;
            wn = mat3(instanceMatrix) * wn;
          #endif
          vWPos = (modelMatrix * wp).xyz;
          vWNormal = normalize(mat3(modelMatrix) * wn);`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNormal;\nuniform float uTime;\nuniform float uLit;\nuniform vec3 uWindow;',
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          if (abs(vWNormal.y) < 0.5) {
            vec2 f = vec2(abs(vWNormal.x) > 0.5 ? vWPos.z : vWPos.x, vWPos.y);
            vec2 g = fract(f * vec2(2.6, 2.0));
            vec2 cell = floor(f * vec2(2.6, 2.0)) + floor(vWPos.xz * 0.5);
            float win = step(0.28, g.x) * step(g.x, 0.72) * step(0.3, g.y) * step(g.y, 0.78) * step(0.45, vWPos.y);
            float h = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
            float lit = step(1.0 - uLit, h) * (0.65 + 0.35 * sin(uTime * (0.6 + h) + h * 40.0));
            totalEmissiveRadiance += uWindow * win * lit * 0.9;
            diffuseColor.rgb *= 1.0 - 0.45 * win * (1.0 - lit);
          }`,
        )
    }

    const mesh = new THREE.InstancedMesh(this.track(new THREE.BoxGeometry(1, 1, 1)), mat, this.buildings.length)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const color = new THREE.Color()
    const legacy = new THREE.Color(ERA_COLOR.legacy)
    const cloud = new THREE.Color(ERA_COLOR.cloud)
    this.buildings.forEach((b, i) => {
      color.copy(b.d === 0 ? legacy : cloud)
      if (b.d === 4) color.lerp(ai, 0.3)
      if (b.d === 2) color.lerp(ai, 0.12)
      if (b.d === 3) color.multiplyScalar(0.85)
      mesh.setColorAt(i, color)
    })
    this.scene.add(mesh)
    return mesh
  }

  private buildCrowns(ai: THREE.Color): THREE.InstancedMesh {
    this.buildings.forEach((b, i) => b.d === 2 && this.crownIdx.push(i))
    const mesh = new THREE.InstancedMesh(
      this.track(new THREE.BoxGeometry(1, 1, 1)),
      this.track(new THREE.MeshBasicMaterial({ color: ai, toneMapped: false })),
      this.crownIdx.length,
    )
    this.scene.add(mesh)
    return mesh
  }

  private buildTraffic(ai: THREE.Color): THREE.InstancedMesh {
    const lanes: [THREE.Vector3, THREE.Vector3][] = [
      [new THREE.Vector3(-15, 0.15, 0.35), new THREE.Vector3(15, 0.15, 0.35)],
      [new THREE.Vector3(15, 0.15, -0.35), new THREE.Vector3(-15, 0.15, -0.35)],
      [new THREE.Vector3(0.35, 0.15, 15), new THREE.Vector3(0.35, 0.15, -15)],
      [new THREE.Vector3(-0.35, 0.15, -15), new THREE.Vector3(-0.35, 0.15, 15)],
    ]
    for (let i = 0; i < PACKETS; i++) {
      const [a, b] = lanes[i % lanes.length]
      this.packetPaths.push({ a, b, speed: 0.05 + ((i * 37) % 11) / 200, phase: ((i * 0.618) % 1) })
    }
    const mesh = new THREE.InstancedMesh(
      this.track(new THREE.BoxGeometry(0.28, 0.12, 0.28)),
      this.track(new THREE.MeshBasicMaterial({ color: ai, toneMapped: false })),
      PACKETS,
    )
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.scene.add(mesh)
    return mesh
  }

  private tallest(d: number): THREE.Vector3 {
    const b = this.buildings.filter((x) => x.d === d).sort((p, q) => q.h - p.h)[0]
    return new THREE.Vector3(b.x, b.h, b.z)
  }

  private labelSpecs(): LabelSpec[] {
    const names = ['Foundations', 'Cloud', 'Accelerators', 'Deployed', 'Applied GenAI']
    return chapters.map((c, d) => {
      const years = c.years.split(/\s/)[0]
      const top = d < 4 ? this.tallest(d) : new THREE.Vector3(0, 1.2 + SPIRE_H, 0)
      return {
        text: d < 4 ? `${years} · ${names[d]}` : names[d],
        sub: d < 4 ? c.title : c.years,
        position: d < 4 ? new THREE.Vector3(DISTRICTS[d].cx, top.y + 2.6, DISTRICTS[d].cz) : new THREE.Vector3(4.2, top.y - 4, 0),
        district: d,
      }
    })
  }

  setLandmarkHandlers(h: LandmarkHandlers) {
    this.handlers = h
  }

  setLandmarks(landmarks: readonly Landmark[]) {
    this.interaction?.dispose()
    const claimed = new Set<number>()
    const instanceIds = new Map<number, string>()
    const extraTargets: { object: THREE.Object3D; id: string }[] = []
    for (const l of landmarks) {
      if (l.district === 4 && l.id !== PLAZA_PROJECT) {
        extraTargets.push({ object: this.spire, id: l.id })
        continue
      }
      const idx = this.buildings
        .map((b, i) => ({ b, i }))
        .filter(({ b, i }) => b.d === l.district && !claimed.has(i))
        .sort((p, q) => q.b.h - p.b.h)[0]?.i
      if (idx === undefined) continue
      claimed.add(idx)
      instanceIds.set(idx, l.id)
    }
    // Must run after every setColorAt: interaction snapshots base colours.
    this.interaction = createInteraction({
      canvas: this.canvas,
      camera: this.camera,
      buildings: this.buildingMesh,
      instanceIds,
      extraTargets,
      accent: new THREE.Color(ERA_COLOR.ai),
      onHover: (e) => this.handlers?.onHover(e),
      onSelect: (id, via) => this.handlers?.onSelect(id, via),
    })
  }

  highlight(id: string | null) {
    this.interaction?.highlight(id)
  }

  clearHover() {
    this.interaction?.clearHover()
  }

  private arcCurve(a: THREE.Vector3, b: THREE.Vector3, lift: number) {
    const mid = a.clone().add(b).multiplyScalar(0.5)
    mid.y = Math.max(a.y, b.y) + lift
    return new THREE.QuadraticBezierCurve3(a, mid, b)
  }

  private buildBridges(ai: THREE.Color) {
    const mat = this.track(new THREE.MeshBasicMaterial({ color: ai, transparent: true, opacity: 0.55, toneMapped: false }))
    for (let d = 0; d < DISTRICTS.length; d++) {
      const a = new THREE.Vector3(DISTRICTS[d].cx, 2.4, DISTRICTS[d].cz)
      const n = DISTRICTS[(d + 1) % DISTRICTS.length]
      const b = new THREE.Vector3(n.cx, 2.4, n.cz)
      const geo = this.track(new THREE.TubeGeometry(this.arcCurve(a, b, 3), 64, 0.07, 6))
      const mesh = new THREE.Mesh(geo, mat)
      this.bridges.push(mesh)
      this.scene.add(mesh)
    }
  }

  private buildSpire(ai: THREE.Color) {
    const group = new THREE.Group()
    const bodyMat = this.track(
      new THREE.MeshStandardMaterial({ color: 0x9fb4c8, roughness: 0.3, metalness: 0.6, emissive: ai, emissiveIntensity: 0.25 }),
    )
    const base = new THREE.Mesh(this.track(new THREE.CylinderGeometry(1.6, 2.0, 1.2, 6)), bodyMat)
    base.position.y = 0.6
    const shaft = new THREE.Mesh(this.track(new THREE.CylinderGeometry(0.28, 1.25, SPIRE_H, 6)), bodyMat)
    shaft.position.y = 1.2 + SPIRE_H / 2
    const stripes = new THREE.Mesh(
      this.track(new THREE.CylinderGeometry(0.3, 1.28, SPIRE_H * 0.92, 6, 1, true)),
      this.track(new THREE.MeshBasicMaterial({ color: ai, wireframe: true, transparent: true, opacity: 0.35, toneMapped: false })),
    )
    stripes.position.y = shaft.position.y
    group.add(base, shaft, stripes)
    this.scene.add(group)

    const top = new THREE.Vector3(0, 1.2 + SPIRE_H, 0)
    const glow = new THREE.Mesh(
      this.track(new THREE.SphereGeometry(0.55, 24, 16)),
      this.track(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })),
    )
    glow.position.copy(top)
    const ring = new THREE.Mesh(
      this.track(new THREE.TorusGeometry(1.6, 0.05, 8, 64)),
      this.track(new THREE.MeshBasicMaterial({ color: ai, toneMapped: false })),
    )
    ring.position.copy(top)
    ring.rotation.x = Math.PI / 2.4
    const light = new THREE.PointLight(ai, 0, 40, 1.6)
    light.position.copy(top)
    this.scene.add(glow, ring, light)
    return { group, glow, ring, light }
  }

  private buildBeams(ai: THREE.Color): THREE.InstancedMesh {
    const top = new THREE.Vector3(0, 1.2 + SPIRE_H, 0)
    const mat = this.track(new THREE.MeshBasicMaterial({ color: ai, transparent: true, opacity: 0.7, toneMapped: false }))
    for (let d = 0; d < DISTRICTS.length; d++) {
      const curve = this.arcCurve(this.tallest(d), top, 2.5)
      const mesh = new THREE.Mesh(this.track(new THREE.TubeGeometry(curve, 64, 0.045, 6)), mat)
      this.beams.push({ mesh, curve })
      this.scene.add(mesh)
    }
    const pulses = new THREE.InstancedMesh(
      this.track(new THREE.SphereGeometry(0.16, 10, 8)),
      this.track(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })),
      DISTRICTS.length * BEAM_PULSES,
    )
    pulses.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.scene.add(pulses)
    return pulses
  }

  /** How far chapter d's construction has got at progress t (0..1). */
  private growth(d: number, t: number) {
    const start = d / chapters.length - 0.07
    return clamp01((t - start) / 0.15)
  }

  setProgress(t: number) {
    this.progress = clamp01(t)
    this.update()
  }

  private update() {
    const t = this.progress
    const time = this.clock.getElapsedTime()
    this.uniforms.uTime.value = time
    this.uniforms.uLit.value = litRatio(t)

    this.buildings.forEach((b, i) => {
      const g = smooth(clamp01((this.growth(b.d, t) - b.stagger) / (1 - b.stagger)))
      const h = Math.max(0.0001, b.h * g)
      const foot = g > 0.02 ? 1 : 0.0001
      dummy.position.set(b.x, h / 2 + 0.08, b.z)
      dummy.scale.set(b.w * foot, h, b.dpt * foot)
      dummy.updateMatrix()
      this.buildingMesh.setMatrixAt(i, dummy.matrix)
    })
    this.buildingMesh.instanceMatrix.needsUpdate = true

    this.crownIdx.forEach((bi, i) => {
      const b = this.buildings[bi]
      const g = smooth(clamp01((this.growth(2, t) - b.stagger) / (1 - b.stagger)))
      const pulse = 1 + 0.15 * Math.sin(time * 2 + i)
      const s = g > 0.95 ? pulse : 0.0001
      dummy.position.set(b.x, b.h + 0.12 + 0.08, b.z)
      dummy.scale.set(b.w * 0.7 * s, 0.22, b.dpt * 0.7 * s)
      dummy.updateMatrix()
      this.crownMesh.setMatrixAt(i, dummy.matrix)
    })
    this.crownMesh.instanceMatrix.needsUpdate = true

    // Traffic gets busier with every chapter.
    const active = Math.round(PACKETS * (0.15 + 0.85 * t))
    const pos = new THREE.Vector3()
    this.packetPaths.forEach((p, i) => {
      pos.lerpVectors(p.a, p.b, (p.phase + time * p.speed) % 1)
      dummy.position.copy(pos)
      dummy.scale.setScalar(i < active ? 1 : 0.0001)
      dummy.updateMatrix()
      this.packetMesh.setMatrixAt(i, dummy.matrix)
    })
    this.packetMesh.instanceMatrix.needsUpdate = true

    const bridgeG = this.growth(3, t)
    for (const m of this.bridges) {
      const count = (m.geometry.index?.count ?? 0)
      m.geometry.setDrawRange(0, Math.floor(count * smooth(bridgeG) / 6) * 6)
    }

    const aiG = smooth(this.growth(4, t))
    this.spire.scale.set(1, Math.max(0.0001, aiG), 1)
    const lit = clamp01((aiG - 0.8) / 0.2)
    this.spireGlow.scale.setScalar(0.0001 + lit * (1 + 0.2 * Math.sin(time * 3)))
    this.spireRing.scale.setScalar(0.0001 + lit)
    this.spireRing.rotation.z = time * 0.6
    this.spireLight.intensity = lit * 60
    const beamG = clamp01((aiG - 0.5) / 0.5)
    this.beams.forEach(({ mesh, curve }, d) => {
      const count = mesh.geometry.index?.count ?? 0
      mesh.geometry.setDrawRange(0, Math.floor(count * beamG / 6) * 6)
      for (let k = 0; k < BEAM_PULSES; k++) {
        const u = (time * 0.35 + k / BEAM_PULSES + d * 0.13) % 1
        curve.getPointAt(u, pos)
        dummy.position.copy(pos)
        dummy.scale.setScalar(beamG >= 1 ? 1 : 0.0001)
        dummy.updateMatrix()
        this.pulseMesh.setMatrixAt(d * BEAM_PULSES + k, dummy.matrix)
      }
    })
    this.pulseMesh.instanceMatrix.needsUpdate = true

    this.placeCamera(t, time)
    this.sky.update(t, time)
    this.labels.update(t, time)
  }

  private placeCamera(t: number, time: number) {
    // Stops sit at even scroll intervals; ease between neighbours.
    const scaled = t * (STOPS.length - 1)
    const i = Math.min(STOPS.length - 2, Math.floor(scaled))
    const k = smooth(clamp01(scaled - i))
    const a = STOPS[i]
    const b = STOPS[i + 1]
    const lerp = (p: number, q: number) => p + (q - p) * k
    const fx = lerp(a.focus[0], b.focus[0])
    const fy = lerp(a.focus[1], b.focus[1])
    const fz = lerp(a.focus[2], b.focus[2])
    const az = THREE.MathUtils.degToRad(lerp(a.az, b.az) + Math.sin(time * 0.15) * 2)
    const r = lerp(a.radius, b.radius)
    this.camera.position.set(fx + Math.cos(az) * r, lerp(a.height, b.height), fz + Math.sin(az) * r)
    this.lookAt.set(fx, fy, fz)
    if (this.introStart >= 0) {
      const u = clamp01((time - this.introStart) / INTRO_SEC)
      if (u >= 1) this.introStart = -2
      else {
        const e = 1 - Math.pow(1 - u, 3)
        this.camera.position.lerpVectors(new THREE.Vector3(...INTRO_FROM.pos), this.camera.position, e)
        this.lookAt.lerpVectors(new THREE.Vector3(...INTRO_FROM.look), this.lookAt, e)
      }
    }
    this.camera.lookAt(this.lookAt)
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas
    if (w === 0 || h === 0) return
    this.camera.aspect = w / h
    this.camera.fov = w / h < 1 ? Math.min(75, 38 * Math.pow(h / w, 0.75)) : 38 // portrait: keep the skyline in frame
    // Chapter text sits on the left on wide screens: frame the city to the right of it.
    if (w > 900) this.camera.setViewOffset(w, h, -w * 0.17, 0, w, h)
    else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
    this.bloom.setSize(w, h, this.renderer.getPixelRatio())
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    this.update()
    this.bloom.render()
  }

  start() {
    if (this.introStart === -1) this.introStart = this.clock.getElapsedTime() // once, first start
    if (!this.raf) this.raf = requestAnimationFrame(this.loop)
  }

  pause() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  dispose() {
    this.pause()
    this.resizeObserver.disconnect()
    this.interaction?.dispose()
    this.labels.dispose()
    this.sky.dispose()
    for (const m of [this.buildingMesh, this.crownMesh, this.packetMesh, this.pulseMesh]) m.dispose()
    this.disposables.forEach((d) => d.dispose())
    this.bloom.dispose()
    this.renderer.dispose()
  }
}
