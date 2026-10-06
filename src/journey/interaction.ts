import * as THREE from 'three'

export interface HoverEvent {
  id: string | null
  x: number
  y: number
}
export interface Interaction {
  /** Light the tower for a landmark id (keyboard focus on its link); null clears. */
  highlight(id: string | null): void
  /** Drop the current hover (sheet dismissed) so the next tap re-selects instead of opening. */
  clearHover(): void
  dispose(): void
}

const TAP_SLOP_PX = 10
const MOVE_EPS_PX = 2
const IDLE_TINT = 0.25
const HOVER_TINT = 0.55
const HOVER_LIFT = 1.15
const DEFAULT_ACCENT = '#00caf4'

export function createInteraction(o: {
  canvas: HTMLCanvasElement
  camera: THREE.Camera
  buildings: THREE.InstancedMesh
  instanceIds: ReadonlyMap<number, string>
  extraTargets?: ReadonlyArray<{ object: THREE.Object3D; id: string }>
  accent?: THREE.Color
  onHover(e: HoverEvent): void
  onSelect(id: string, via: 'mouse' | 'touch'): void
}): Interaction {
  const { canvas, camera, buildings, instanceIds, onHover, onSelect } = o
  const extras = o.extraTargets ?? []
  const accent = o.accent ?? new THREE.Color(DEFAULT_ACCENT)

  // City rewrites instance matrices every frame, so three's lazily computed sphere goes stale.
  buildings.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100)

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const hits: THREE.Intersection[] = []
  const tmp = new THREE.Color()

  const base = new Map<number, THREE.Color>()
  const hasColors = !!buildings.instanceColor
  if (hasColors) {
    instanceIds.forEach((_, idx) => {
      const c = new THREE.Color()
      buildings.getColorAt(idx, c)
      base.set(idx, c)
    })
  }
  const paint = (idx: number, hover: boolean) => {
    const b = base.get(idx)
    if (!b) return
    tmp.copy(b).lerp(accent, hover ? HOVER_TINT : IDLE_TINT)
    if (hover) tmp.multiplyScalar(HOVER_LIFT)
    buildings.setColorAt(idx, tmp)
    buildings.instanceColor!.needsUpdate = true
  }
  base.forEach((_, idx) => paint(idx, false))

  let hoverId: string | null = null
  let hoverIdx = -1
  let focusIdx = -1
  let lastX = 0
  let lastY = 0
  let px = 0
  let py = 0
  let inside = false
  let raf = 0
  const prevCursor = canvas.style.cursor

  const pick = (cx: number, cy: number): { id: string; idx: number } | null => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)

    // Nearest hit across all instances, so non-landmark buildings occlude landmarks.
    hits.length = 0
    raycaster.intersectObject(buildings, false, hits)
    let best: { id: string; idx: number } | null = null
    let bestDist = Infinity
    if (hits.length) {
      bestDist = hits[0].distance
      const idx = hits[0].instanceId
      const id = idx === undefined ? undefined : instanceIds.get(idx)
      if (id !== undefined) best = { id, idx: idx! }
    }
    for (const t of extras) {
      hits.length = 0
      raycaster.intersectObject(t.object, true, hits)
      if (hits.length && hits[0].distance < bestDist) {
        bestDist = hits[0].distance
        best = { id: t.id, idx: -1 }
      }
    }
    return best
  }

  const setHover = (hit: { id: string; idx: number } | null, x: number, y: number) => {
    const id = hit ? hit.id : null
    const moved = Math.abs(x - lastX) > MOVE_EPS_PX || Math.abs(y - lastY) > MOVE_EPS_PX
    if (id === hoverId && !(id && moved)) return
    if (hoverIdx >= 0 && id !== hoverId) paint(hoverIdx, hoverIdx === focusIdx)
    if (hit && hit.idx >= 0 && id !== hoverId) paint(hit.idx, true)
    hoverId = id
    hoverIdx = hit ? hit.idx : -1
    lastX = x
    lastY = y
    onHover({ id, x, y })
  }

  const setCursor = (on: boolean) => {
    canvas.style.cursor = on ? 'pointer' : prevCursor
  }

  const tick = () => {
    raf = 0
    if (!inside) return
    const hit = pick(px, py)
    setHover(hit, px, py)
    setCursor(!!hit)
    raf = requestAnimationFrame(tick)
  }

  let downX = 0
  let downY = 0
  let downType = ''
  let down = false

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    px = e.clientX
    py = e.clientY
    inside = true
    if (!raf) raf = requestAnimationFrame(tick)
  }
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    inside = false
    cancelAnimationFrame(raf)
    raf = 0
    setHover(null, e.clientX, e.clientY)
    setCursor(false)
  }
  const onDown = (e: PointerEvent) => {
    down = true
    downType = e.pointerType
    downX = e.clientX
    downY = e.clientY
  }
  const onUp = (e: PointerEvent) => {
    if (!down) return
    down = false
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > TAP_SLOP_PX) return
    const hit = pick(e.clientX, e.clientY)
    if (downType === 'touch') {
      if (hit && hit.id === hoverId) onSelect(hit.id, 'touch')
      else {
        lastX = lastY = -1e4 // force an event even if the same id
        setHover(hit, e.clientX, e.clientY)
      }
    } else if (hit) onSelect(hit.id, 'mouse')
  }
  const onCancel = () => {
    down = false
    if (downType === 'touch') setHover(null, lastX, lastY)
  }
  const onScroll = () => {
    if (hoverId && downType === 'touch') setHover(null, lastX, lastY)
  }

  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)
  window.addEventListener('scroll', onScroll, { passive: true })

  return {
    highlight(id) {
      let idx = -1
      if (id) instanceIds.forEach((v, k) => v === id && (idx = k))
      if (focusIdx >= 0 && focusIdx !== hoverIdx) paint(focusIdx, false)
      focusIdx = idx
      if (idx >= 0) paint(idx, true)
    },
    clearHover() {
      lastX = lastY = -1e4
      setHover(null, 0, 0)
    },
    dispose() {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      raf = 0
      inside = false
      canvas.style.cursor = prevCursor
      if (hasColors) {
        base.forEach((c, idx) => buildings.setColorAt(idx, c))
        buildings.instanceColor!.needsUpdate = true
      }
    },
  }
}
