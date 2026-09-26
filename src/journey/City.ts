import * as THREE from 'three'
import { chapters, ERA_COLOR } from './chapters'

const DISTRICT_SPACING = 16
const BUILDINGS_PER_DISTRICT = 10
const WINDOWS_PER_BUILDING = 4
const PACKETS_PER_DISTRICT = 8

const dummy = new THREE.Object3D()

/**
 * Plain three.js (no @react-three/fiber — a second renderer/reconciler is not
 * justified for one imperative scene) isometric-ish low-poly city.
 *
 * Buildings, windows and traffic packets are each a single InstancedMesh —
 * three draw calls total regardless of chapter count, which is what keeps this
 * inside a 60fps budget on a mid laptop with no post-processing.
 *
 * `setProgress(0..1)` is the only thing scroll drives: each chapter's district
 * grows out of the ground as progress crosses its slice, and the camera dollies
 * forward + rises + gently orbits along the way. Nothing here reads or writes
 * DOM/scroll state directly, so the caller (JourneyScene) owns ScrollTrigger.
 */
export class City {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private buildings: THREE.InstancedMesh
  private windows: THREE.InstancedMesh
  private packets: THREE.InstancedMesh
  private ground: THREE.Mesh
  private raf = 0
  private paused = false
  private progress = 0
  private clock = new THREE.Clock()
  private resizeObserver: ResizeObserver
  private buildingMeta: { district: number; height: number; x: number; z: number }[] = []
  private packetMeta: { district: number; z0: number; speed: number; x: number }[] = []

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    this.renderer.setClearColor(0x05070d, 0)

    this.scene.fog = new THREE.Fog(0x05070d, 20, 90)

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)

    const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x05070d, 0.9)
    this.scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(6, 12, 6)
    this.scene.add(dir)

    const totalBuildings = chapters.length * BUILDINGS_PER_DISTRICT
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1)
    const buildingMat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.1 })
    this.buildings = new THREE.InstancedMesh(buildingGeo, buildingMat, totalBuildings)
    this.buildings.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const buildingColors = new Float32Array(totalBuildings * 3)
    this.buildings.instanceColor = new THREE.InstancedBufferAttribute(buildingColors, 3)

    const windowGeo = new THREE.BoxGeometry(0.14, 0.14, 0.05)
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
    this.windows = new THREE.InstancedMesh(windowGeo, windowMat, totalBuildings * WINDOWS_PER_BUILDING)
    const windowColors = new Float32Array(totalBuildings * WINDOWS_PER_BUILDING * 3)
    this.windows.instanceColor = new THREE.InstancedBufferAttribute(windowColors, 3)

    const packetGeo = new THREE.BoxGeometry(0.22, 0.14, 0.22)
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
    this.packets = new THREE.InstancedMesh(packetGeo, packetMat, chapters.length * PACKETS_PER_DISTRICT)
    const packetColors = new Float32Array(chapters.length * PACKETS_PER_DISTRICT * 3)
    this.packets.instanceColor = new THREE.InstancedBufferAttribute(packetColors, 3)

    const groundGeo = new THREE.PlaneGeometry(40, chapters.length * DISTRICT_SPACING + 20)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0b0e18, roughness: 0.95 })
    this.ground = new THREE.Mesh(groundGeo, groundMat)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.position.set(0, 0, -((chapters.length - 1) * DISTRICT_SPACING) / 2)

    this.scene.add(this.ground, this.buildings, this.windows, this.packets)

    this.buildRandomLayout()
    this.applyColors()
    this.setProgress(0)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
  }

  /** Deterministic pseudo-random layout (mulberry32) — no per-instance state
   *  needs to survive a re-mount, so a seeded generator keeps the skyline
   *  visually stable across renders without persisting anything. */
  private buildRandomLayout() {
    let seed = 1337
    const rand = () => {
      seed |= 0
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    for (let d = 0; d < chapters.length; d++) {
      const districtZ = -d * DISTRICT_SPACING
      for (let i = 0; i < BUILDINGS_PER_DISTRICT; i++) {
        const side = i % 2 === 0 ? -1 : 1
        const x = side * (3 + rand() * 6)
        const z = districtZ + (rand() - 0.5) * (DISTRICT_SPACING * 0.7)
        const height = 1.5 + rand() * (1.5 + d * 1.6)
        this.buildingMeta.push({ district: d, height, x, z })
      }
      for (let p = 0; p < PACKETS_PER_DISTRICT; p++) {
        this.packetMeta.push({
          district: d,
          z0: districtZ + (rand() - 0.5) * DISTRICT_SPACING,
          speed: 2 + rand() * 2 + d * 0.6,
          x: (rand() - 0.5) * 5,
        })
      }
    }
  }

  private applyColors() {
    const color = new THREE.Color()
    this.buildingMeta.forEach((b, i) => {
      color.set(ERA_COLOR[chapters[b.district].era])
      this.buildings.setColorAt(i, color)
    })
    this.buildingMeta.forEach((b, bi) => {
      for (let w = 0; w < WINDOWS_PER_BUILDING; w++) {
        const idx = bi * WINDOWS_PER_BUILDING + w
        color.set(ERA_COLOR[chapters[b.district].era]).lerp(new THREE.Color(0xffffff), 0.5)
        this.windows.setColorAt(idx, color)
      }
    })
    this.packetMeta.forEach((p, i) => {
      color.set(ERA_COLOR[chapters[p.district].era])
      this.packets.setColorAt(i, color)
    })
    if (this.buildings.instanceColor) this.buildings.instanceColor.needsUpdate = true
    if (this.windows.instanceColor) this.windows.instanceColor.needsUpdate = true
    if (this.packets.instanceColor) this.packets.instanceColor.needsUpdate = true
  }

  private districtGrowth(d: number, t: number): number {
    const slice = 1 / chapters.length
    const start = d * slice
    return Math.min(1, Math.max(0, (t - start) / (slice * 0.7)))
  }

  /** Scroll offset 0..1, driven externally by ScrollTrigger's onUpdate. */
  setProgress(t: number) {
    this.progress = Math.min(1, Math.max(0, t))

    this.buildingMeta.forEach((b, i) => {
      const growth = this.districtGrowth(b.district, this.progress)
      // Below 3% grown, collapse the whole footprint (not just height) to
      // near-zero — a height-only squash left a full-footprint flat tile
      // sitting on the ground before a district's reveal threshold, which
      // read as stray debris rather than "not built yet".
      const footprint = growth > 0.03 ? 1 : 0.0001
      const h = Math.max(0.001, b.height * growth)
      dummy.position.set(b.x, h / 2, b.z)
      dummy.scale.set(footprint, h, footprint)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      this.buildings.setMatrixAt(i, dummy.matrix)

      for (let w = 0; w < WINDOWS_PER_BUILDING; w++) {
        const idx = i * WINDOWS_PER_BUILDING + w
        const wy = (w + 0.5) * (b.height / WINDOWS_PER_BUILDING) * growth
        const visible = growth > 0.3 ? 1 : 0
        const faceSign = b.x >= 0 ? 1 : -1
        dummy.position.set(b.x + faceSign * 0.51, wy, b.z + ((w % 2) - 0.5) * 0.4)
        dummy.scale.setScalar(visible)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        this.windows.setMatrixAt(idx, dummy.matrix)
      }
    })

    const elapsed = this.clock.getElapsedTime()
    this.packetMeta.forEach((p, i) => {
      const growth = this.districtGrowth(p.district, this.progress)
      const span = DISTRICT_SPACING
      const z = p.z0 + (p.district * -DISTRICT_SPACING)
      const localZ = ((((z - elapsed * p.speed) % span) + span) % span) - span / 2 + p.district * -DISTRICT_SPACING
      dummy.position.set(p.x, 0.12, localZ)
      dummy.scale.setScalar(growth > 0.5 ? 1 : 0)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      this.packets.setMatrixAt(i, dummy.matrix)
    })

    this.buildings.instanceMatrix.needsUpdate = true
    this.windows.instanceMatrix.needsUpdate = true
    this.packets.instanceMatrix.needsUpdate = true

    // Camera: dollies forward down the boulevard (-z), rises, and holds a
    // gentle isometric-style orbit whose radius tightens slightly as it goes —
    // "slowly orbit/dolly up" from the brief, as one continuous function of t.
    const travel = this.progress * (chapters.length - 1) * DISTRICT_SPACING
    const targetZ = -travel
    const orbit = 0.5 + this.progress * 0.4
    const radius = 20 - this.progress * 6
    const height = 9 + this.progress * 9
    this.camera.position.set(Math.sin(orbit) * radius, height, targetZ + Math.cos(orbit) * radius)
    this.camera.lookAt(0, 2 + this.progress * 3, targetZ - 4)
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas
    if (w === 0 || h === 0) return
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
  }

  private loop = () => {
    if (this.paused) return
    this.raf = requestAnimationFrame(this.loop)
    this.setProgress(this.progress) // re-run packet animation each frame
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    if (this.raf) return
    this.paused = false
    this.raf = requestAnimationFrame(this.loop)
  }

  pause() {
    this.paused = true
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  dispose() {
    this.pause()
    this.resizeObserver.disconnect()
    this.buildings.geometry.dispose()
    ;(this.buildings.material as THREE.Material).dispose()
    this.windows.geometry.dispose()
    ;(this.windows.material as THREE.Material).dispose()
    this.packets.geometry.dispose()
    ;(this.packets.material as THREE.Material).dispose()
    this.ground.geometry.dispose()
    ;(this.ground.material as THREE.Material).dispose()
    this.renderer.dispose()
  }
}
