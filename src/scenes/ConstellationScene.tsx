import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Billboard, Html, Text, useCursor } from '@react-three/drei'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { Skill, SkillDomain } from '@/data/types'

gsap.registerPlugin(useGSAP)

/** Domain → accent hex, anchored on the era tokens in globals.css. */
export const DOMAIN_COLORS: Record<SkillDomain, string> = {
  'Cloud Data Platforms': '#22d3ee', // --color-cloud
  'GenAI & LLM': '#a78bfa', // --color-ai
  'Data Engineering': '#34d399', // --color-success
  'Streaming & Realtime': '#f59e0b', // --color-legacy
  'Databases & Warehouses': '#60a5fa',
  Languages: '#f472b6',
  'DevOps & IaC': '#fb923c',
  'Governance & Quality': '#a3e635',
}

const TIER_WORDS: Record<Skill['tier'], string> = {
  1: 'core',
  2: 'strong',
  3: 'working knowledge',
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Deterministic PRNG so node jitter is stable across renders. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** i-th of n directions on a fibonacci sphere. */
function fibDir(i: number, n: number): THREE.Vector3 {
  const y = 1 - ((i + 0.5) * 2) / n
  const r = Math.sqrt(Math.max(0, 1 - y * y))
  const t = i * GOLDEN_ANGLE
  return new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r)
}

interface SkillNode {
  skill: Skill
  local: THREE.Vector3
}

interface DomainCluster {
  domain: SkillDomain
  color: string
  hub: THREE.Vector3
  hubSize: number
  /** Tier-1 skills — labeled constellation nodes wired to the hub. */
  tier1: SkillNode[]
  /** Tier-2/3 skills — unlabeled points orbiting the hub (label on hover/focus). */
  orbit: SkillNode[]
  orbitSpeed: number
}

function buildClusters(skills: Skill[]): DomainCluster[] {
  const rng = mulberry32(0x5eed)
  const domains = [...new Set(skills.map((s) => s.domain))]
  return domains.map((domain, i) => {
    const domainSkills = skills.filter((s) => s.domain === domain)
    const dir = fibDir(i, domains.length)
    dir.y *= 0.72 // flatten vertically so the graph reads wide, not tall
    dir.normalize()
    const hub = dir.multiplyScalar(3.0 + domainSkills.length * 0.009)
    const clusterRadius = 0.55 + Math.sqrt(domainSkills.length) * 0.15
    const tier1Skills = domainSkills.filter((s) => s.tier === 1)
    const restSkills = domainSkills.filter((s) => s.tier !== 1)
    return {
      domain,
      color: DOMAIN_COLORS[domain],
      hub,
      hubSize: 0.11 + Math.sqrt(domainSkills.length) * 0.018,
      tier1: tier1Skills.map((skill, j) => ({
        skill,
        local: fibDir(j, tier1Skills.length).multiplyScalar(clusterRadius * (0.6 + rng() * 0.18)),
      })),
      orbit: restSkills.map((skill, j) => ({
        skill,
        local: fibDir(j, Math.max(restSkills.length, 1)).multiplyScalar(
          clusterRadius * (skill.tier === 2 ? 1.0 : 1.32) * (0.85 + rng() * 0.3),
        ),
      })),
      orbitSpeed: (0.05 + rng() * 0.09) * (i % 2 === 0 ? 1 : -1),
    }
  })
}

interface HoverInfo {
  skill: Skill
  point: THREE.Vector3
}

const IDENTITY_QUAT = new THREE.Quaternion()

interface ClusterProps {
  cluster: DomainCluster
  focused: boolean
  dimmed: boolean
  isMobile: boolean
  animate: boolean
  selectedSkillName: string | null
  onHover: (info: HoverInfo | null) => void
  onSelect: (domain: SkillDomain) => void
  onSelectSkill: (skill: Skill) => void
}

function Cluster({
  cluster,
  focused,
  dimmed,
  isMobile,
  animate,
  selectedSkillName,
  onHover,
  onSelect,
  onSelectSkill,
}: ClusterProps) {
  const tier1Ref = useRef<THREE.InstancedMesh>(null)
  const orbitRef = useRef<THREE.InstancedMesh>(null)
  const orbitGroupRef = useRef<THREE.Group>(null)
  const [hubHover, setHubHover] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<{ type: 'tier1' | 'orbit'; index: number } | null>(null)
  const hoverT = useRef(0)
  const lastHover = useRef<{ type: 'tier1' | 'orbit'; index: number } | null>(null)
  const glowRef = useRef<THREE.MeshBasicMaterial>(null)
  const m = useMemo(() => new THREE.Matrix4(), [])
  const s = useMemo(() => new THREE.Vector3(), [])
  useCursor(hubHover || hoveredNode !== null)

  const baseScale = (type: 'tier1' | 'orbit', node: SkillNode) =>
    type === 'tier1' ? 1 : node.skill.tier === 2 ? 1 : 0.68

  // Write static instance matrices once per layout.
  useLayoutEffect(() => {
    const tier1Mesh = tier1Ref.current
    if (tier1Mesh) {
      cluster.tier1.forEach((node, i) => {
        m.compose(node.local, IDENTITY_QUAT, s.setScalar(1))
        tier1Mesh.setMatrixAt(i, m)
      })
      tier1Mesh.instanceMatrix.needsUpdate = true
      tier1Mesh.computeBoundingSphere()
    }
    const orbitMesh = orbitRef.current
    if (orbitMesh) {
      cluster.orbit.forEach((node, i) => {
        m.compose(node.local, IDENTITY_QUAT, s.setScalar(node.skill.tier === 2 ? 1 : 0.68))
        orbitMesh.setMatrixAt(i, m)
      })
      orbitMesh.instanceMatrix.needsUpdate = true
      orbitMesh.computeBoundingSphere()
    }
  }, [cluster])

  // Tier-2/3 points slowly orbit their domain hub (paused while focused so labels hold still).
  // Hovered node eases up in scale + drives an additive glow halo (the literal "light on hover").
  useFrame((_, delta) => {
    if (!animate || focused) return
    const g = orbitGroupRef.current
    if (g) g.rotation.y += delta * cluster.orbitSpeed

    const target = hoveredNode ? 1 : 0
    hoverT.current += (target - hoverT.current) * Math.min(1, delta * 12)
    const t = hoverT.current

    const applyScale = (type: 'tier1' | 'orbit', index: number, scale: number) => {
      const mesh = type === 'tier1' ? tier1Ref.current : orbitRef.current
      const nodesArr = type === 'tier1' ? cluster.tier1 : cluster.orbit
      const node = nodesArr[index]
      if (!mesh || !node) return
      m.compose(node.local, IDENTITY_QUAT, s.setScalar(scale))
      mesh.setMatrixAt(index, m)
      mesh.instanceMatrix.needsUpdate = true
    }

    if (hoveredNode) {
      const node = (hoveredNode.type === 'tier1' ? cluster.tier1 : cluster.orbit)[hoveredNode.index]
      if (node) applyScale(hoveredNode.type, hoveredNode.index, baseScale(hoveredNode.type, node) * (1 + t * 1.1))
    }
    if (lastHover.current && (!hoveredNode || hoveredNode.type !== lastHover.current.type || hoveredNode.index !== lastHover.current.index)) {
      const prev = lastHover.current
      const node = (prev.type === 'tier1' ? cluster.tier1 : cluster.orbit)[prev.index]
      if (node) applyScale(prev.type, prev.index, baseScale(prev.type, node))
      lastHover.current = hoveredNode
    }
    if (glowRef.current) glowRef.current.opacity = (hoveredNode ? 0.6 : 0) * t
  })

  const linePositions = useMemo(() => {
    const arr = new Float32Array(cluster.tier1.length * 6)
    cluster.tier1.forEach((node, i) => {
      arr.set([0, 0, 0, node.local.x, node.local.y, node.local.z], i * 6)
    })
    return arr
  }, [cluster])

  const makeOverHandler =
    (nodes: SkillNode[], type: 'tier1' | 'orbit') =>
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (e.instanceId === undefined) return
      const node = nodes[e.instanceId]
      if (node) {
        setHoveredNode({ type, index: e.instanceId })
        onHover({ skill: node.skill, point: e.point.clone() })
      }
    }
  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHoveredNode(null)
    onHover(null)
  }
  const makeClickHandler =
    (nodes: SkillNode[]) =>
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (e.instanceId === undefined) return
      const node = nodes[e.instanceId]
      if (node) onSelectSkill(node.skill)
    }

  const nodeOpacity = focused ? 1 : dimmed ? 0.14 : 0.95
  const labelOpacity = dimmed ? 0.1 : 0.88
  const showTier1Labels = focused || !isMobile

  return (
    <group position={cluster.hub}>
      {/* Hub core (click/tap → focus this domain) + additive halo */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(cluster.domain)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHubHover(true)
        }}
        onPointerOut={() => setHubHover(false)}
      >
        <sphereGeometry args={[cluster.hubSize, 24, 24]} />
        <meshBasicMaterial color={cluster.color} transparent opacity={dimmed ? 0.25 : 1} />
      </mesh>
      <mesh scale={hubHover || focused ? 3 : 2.4}>
        <sphereGeometry args={[cluster.hubSize, 16, 16]} />
        <meshBasicMaterial
          color={cluster.color}
          transparent
          opacity={dimmed ? 0.04 : focused ? 0.28 : 0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Billboard position={[0, cluster.hubSize + 0.24, 0]}>
        <Text
          fontSize={isMobile ? 0.17 : 0.15}
          letterSpacing={0.12}
          color="#e6edf7"
          fillOpacity={dimmed ? 0.18 : 1}
          outlineWidth={0.007}
          outlineColor="#050810"
          outlineOpacity={dimmed ? 0.15 : 0.9}
          anchorY="bottom"
          maxWidth={2.6}
          textAlign="center"
        >
          {cluster.domain.toUpperCase()}
        </Text>
      </Billboard>

      {/* Constellation wiring: hub → tier-1 (brightens when the domain is focused) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={cluster.color}
          transparent
          opacity={focused ? 0.5 : dimmed ? 0.04 : 0.26}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Tier-1: labeled instanced nodes */}
      <instancedMesh
        ref={tier1Ref}
        args={[undefined, undefined, cluster.tier1.length]}
        onPointerOver={makeOverHandler(cluster.tier1, 'tier1')}
        onPointerOut={handleOut}
        onClick={makeClickHandler(cluster.tier1)}
      >
        <sphereGeometry args={[0.078, 16, 16]} />
        <meshBasicMaterial color={cluster.color} transparent opacity={nodeOpacity} />
      </instancedMesh>
      {showTier1Labels &&
        cluster.tier1.map((node) => {
          const labelPos = node.local
            .clone()
            .multiplyScalar(1 + 0.1 / Math.max(node.local.length(), 0.001))
          return (
            <Billboard key={node.skill.name} position={[labelPos.x, labelPos.y + 0.09, labelPos.z]}>
              <Text
                fontSize={0.093}
                color="#c7d2e6"
                fillOpacity={labelOpacity}
                outlineWidth={0.005}
                outlineColor="#050810"
                outlineOpacity={dimmed ? 0.08 : 0.8}
                anchorY="bottom"
                maxWidth={1.35}
                textAlign="center"
              >
                {node.skill.name}
              </Text>
            </Billboard>
          )
        })}

      {/* Hover glow — tracks the hovered tier-1 node (fades via glowRef opacity) */}
      {hoveredNode?.type === 'tier1' && cluster.tier1[hoveredNode.index] && (
        <mesh position={cluster.tier1[hoveredNode.index].local}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshBasicMaterial
            ref={glowRef}
            color={cluster.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Tier-2/3: unlabeled orbiting points — labels appear on hover or domain focus */}
      <group ref={orbitGroupRef}>
        {cluster.orbit.length > 0 && (
          <instancedMesh
            ref={orbitRef}
            args={[undefined, undefined, cluster.orbit.length]}
            onPointerOver={makeOverHandler(cluster.orbit, 'orbit')}
            onPointerOut={handleOut}
            onClick={makeClickHandler(cluster.orbit)}
          >
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshBasicMaterial
              color={cluster.color}
              transparent
              opacity={focused ? 0.85 : dimmed ? 0.1 : 0.6}
            />
          </instancedMesh>
        )}
        {focused &&
          cluster.orbit.map((node) => (
            <Billboard
              key={node.skill.name}
              position={[node.local.x, node.local.y + 0.07, node.local.z]}
            >
              <Text
                fontSize={0.072}
                color="#8b98b3"
                fillOpacity={0.9}
                outlineWidth={0.004}
                outlineColor="#050810"
                outlineOpacity={0.8}
                anchorY="bottom"
                maxWidth={1.2}
                textAlign="center"
              >
                {node.skill.name}
              </Text>
            </Billboard>
          ))}

        {/* Hover glow — tracks the hovered orbit node (rendered inside the rotating group) */}
        {hoveredNode?.type === 'orbit' && cluster.orbit[hoveredNode.index] && (
          <mesh position={cluster.orbit[hoveredNode.index].local}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial
              ref={glowRef}
              color={cluster.color}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* Selection marker: pulsing ring on the skill the visitor is reading about */}
      {(() => {
        const selected =
          cluster.tier1.find((n) => n.skill.name === selectedSkillName) ??
          cluster.orbit.find((n) => n.skill.name === selectedSkillName)
        if (!selected) return null
        return (
          <mesh position={selected.local} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.128, 32]} />
            <meshBasicMaterial
              color={cluster.color}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )
      })()}
    </group>
  )
}

function Dust({ count, animate }: { count: number; animate: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const rng = mulberry32(0xd057)
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize()
      const radius = 5.2 + rng() * 5.5
      arr[i * 3] = dir.x * radius
      arr[i * 3 + 1] = dir.y * radius * 0.7
      arr[i * 3 + 2] = dir.z * radius
    }
    return arr
  }, [count])
  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.y -= delta * 0.008
  })
  return (
    <points ref={ref}>
      <bufferGeometry key={count}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color="#44567e"
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  )
}

export interface ConstellationSceneProps {
  skills: Skill[]
  focusDomain: SkillDomain | null
  /** Toggle focus on a domain — hub clicks route here so DOM legend state stays canonical. */
  onSelectDomain: (domain: SkillDomain) => void
  /** The skill currently shown in the field-story panel, if any — drives the deep zoom + ring marker. */
  selectedSkill: Skill | null
  /** A node (3D or chip) was activated — opens the field-story panel. */
  onSelectSkill: (skill: Skill) => void
  isMobile: boolean
  /** Idle motion allowed — false when offscreen or prefers-reduced-motion. */
  animate: boolean
  reducedMotion: boolean
}

export default function ConstellationScene({
  skills,
  focusDomain,
  onSelectDomain,
  selectedSkill,
  onSelectSkill,
  isMobile,
  animate,
  reducedMotion,
}: ConstellationSceneProps) {
  const rootRef = useRef<THREE.Group>(null)
  const introDone = useRef(reducedMotion)
  const [hover, setHover] = useState<HoverInfo | null>(null)
  useCursor(hover !== null)
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)

  const clusters = useMemo(() => buildClusters(skills), [skills])

  // Entrance: bloom the constellation open once on mount (skipped under reduced motion).
  useGSAP(() => {
    const root = rootRef.current
    if (!root || reducedMotion) {
      introDone.current = true
      return
    }
    const tl = gsap.timeline({
      onComplete: () => {
        introDone.current = true
      },
    })
    tl.from(root.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 1.5, ease: 'power3.out' }).from(
      root.rotation,
      { y: -0.85, duration: 1.7, ease: 'power2.out' },
      0,
    )
  })

  // Focus: ease the graph so the focus point (a hub, or a specific skill within it)
  // faces the camera, and dolly in — deeper for a single skill than for a whole domain.
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const duration = reducedMotion ? 0 : 1.1
      const cluster = focusDomain ? clusters.find((c) => c.domain === focusDomain) : undefined
      const selectedNode =
        cluster && selectedSkill
          ? (cluster.tier1.find((n) => n.skill.name === selectedSkill.name) ??
            cluster.orbit.find((n) => n.skill.name === selectedSkill.name))
          : undefined
      const focusPoint = selectedNode ? cluster!.hub.clone().add(selectedNode.local) : cluster?.hub

      const rotationTarget = focusPoint
        ? (() => {
            // Euler 'XYZ' applies yaw (y) to points before pitch (x), so solve yaw
            // from the raw focus point, then pitch from the post-yaw elevation.
            let yaw = -Math.atan2(focusPoint.x, focusPoint.z)
            while (yaw - root.rotation.y > Math.PI) yaw -= Math.PI * 2
            while (yaw - root.rotation.y < -Math.PI) yaw += Math.PI * 2
            const pitch = Math.atan2(focusPoint.y, Math.hypot(focusPoint.x, focusPoint.z))
            return { x: pitch, y: yaw }
          })()
        : { x: 0 }
      gsap.to(root.rotation, {
        ...rotationTarget,
        duration,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onUpdate: invalidate,
      })
      gsap.to(camera.position, {
        z: selectedNode ? (isMobile ? 6.2 : 6.8) : cluster ? (isMobile ? 7.4 : 8.2) : 10.5,
        duration,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onUpdate: invalidate,
      })
    },
    { dependencies: [focusDomain, selectedSkill, reducedMotion, isMobile, camera, clusters, invalidate] },
  )

  // Idle spin + pointer parallax; paused while a domain is focused or a node is inspected.
  useFrame((state, delta) => {
    const root = rootRef.current
    if (!root || !animate || !introDone.current || focusDomain || selectedSkill) return
    if (!hover) root.rotation.y += delta * 0.05
    root.rotation.x = THREE.MathUtils.damp(root.rotation.x, state.pointer.y * -0.07, 2.5, delta)
  })

  return (
    <>
      <group scale={isMobile ? 0.56 : 0.78}>
        <group ref={rootRef}>
          {clusters.map((cluster) => (
            <Cluster
              key={cluster.domain}
              cluster={cluster}
              focused={focusDomain === cluster.domain}
              dimmed={focusDomain !== null && focusDomain !== cluster.domain}
              isMobile={isMobile}
              animate={animate}
              selectedSkillName={focusDomain === cluster.domain ? (selectedSkill?.name ?? null) : null}
              onHover={setHover}
              onSelect={onSelectDomain}
              onSelectSkill={onSelectSkill}
            />
          ))}
        </group>
        <Dust count={isMobile ? 380 : 1200} animate={animate} />
      </group>

      {/* Hover tooltip — world-space anchor so it stays put while the graph drifts */}
      {hover && (
        <Html
          position={[hover.point.x, hover.point.y + 0.16, hover.point.z]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="glass-panel w-max max-w-60 -translate-y-1/2 rounded-lg px-3 py-2 text-center">
            <p className="font-mono text-xs text-ink">{hover.skill.name}</p>
            <p className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-muted">
              {hover.skill.years !== undefined ? `${hover.skill.years}y · ` : ''}
              {TIER_WORDS[hover.skill.tier]}
            </p>
          </div>
        </Html>
      )}
    </>
  )
}
