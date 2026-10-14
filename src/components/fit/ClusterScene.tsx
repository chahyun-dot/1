import { Canvas } from '@react-three/fiber'
import { ContactShadows, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Dim } from '@/components/fit/DetailScene'
import ItemModel from '@/components/fit/Models'
import { LEVEL_COLOR } from '@/components/fit/Scene'
import { footprint } from '@/lib/fit'
import type { Item, Level } from '@/lib/types'

const M = 1000

export type PairGap = { a: Item; b: Item; axis: 'x' | 'z'; dist: number; from: [number, number]; to: [number, number] }

// 두 가구 사이의 가장 가까운 면 거리. 한 방향으로 마주 볼 때만 잰다(대각선이면 더 먼 방향).
export const gapOf = (a: Item, b: Item): PairGap => {
  const ra = footprint(a)
  const rb = footprint(b)
  const dx = Math.max(ra.minX - rb.maxX, rb.minX - ra.maxX)
  const dz = Math.max(ra.minZ - rb.maxZ, rb.minZ - ra.maxZ)
  if (dx >= dz) {
    const z = (Math.max(ra.minZ, rb.minZ) + Math.min(ra.maxZ, rb.maxZ)) / 2
    const left = ra.maxX <= rb.minX ? ra : rb
    const right = left === ra ? rb : ra
    return { a, b, axis: 'x', dist: Math.round(dx), from: [left.maxX, z], to: [right.minX, z] }
  }
  const x = (Math.max(ra.minX, rb.minX) + Math.min(ra.maxX, rb.maxX)) / 2
  const top = ra.maxZ <= rb.minZ ? ra : rb
  const bottom = top === ra ? rb : ra
  return { a, b, axis: 'z', dist: Math.round(dz), from: [x, top.maxZ], to: [x, bottom.minZ] }
}

// b 를 a 쪽으로 가깝게/멀게 움직여 둘 사이 거리를 dist 로 맞춘다. 새 가운데 좌표를 돌려준다.
export const moveToGap = (gap: PairGap, dist: number): { x: number; z: number } => {
  const delta = dist - gap.dist
  const ra = footprint(gap.a)
  const rb = footprint(gap.b)
  if (gap.axis === 'x') return { x: gap.b.x + (rb.minX >= ra.maxX - 1 ? delta : -delta), z: gap.b.z }
  return { x: gap.b.x, z: gap.b.z + (rb.minZ >= ra.maxZ - 1 ? delta : -delta) }
}

const yawOf = (item: Item) => (item.yaw !== undefined ? (item.yaw * Math.PI) / 180 : (item.rot * Math.PI) / 2)

const levelOf = (dist: number): Level => (dist < 0 ? 'bad' : dist < 20 ? 'warn' : 'ok')

const mm = (value: number) => `${Math.round(value).toLocaleString()}mm`

type ClusterSceneProps = {
  members: Item[]
  gaps: PairGap[]
  showDims: boolean
  autoRotate: boolean
  drawersOpen?: boolean
  onReady?: () => void
}

export default function ClusterScene({ members, gaps, showDims, autoRotate, drawersOpen = false, onReady }: ClusterSceneProps) {
  const rects = members.map((member) => footprint(member))
  const minX = Math.min(...rects.map((r) => r.minX))
  const maxX = Math.max(...rects.map((r) => r.maxX))
  const minZ = Math.min(...rects.map((r) => r.minZ))
  const maxZ = Math.max(...rects.map((r) => r.maxZ))
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  const span = Math.max(maxX - minX, maxZ - minZ, 900) / M
  const tallest = Math.max(...members.map((member) => (member.elevation ?? 0) + member.h)) / M
  const wx = (x: number) => (x - cx) / M
  const wz = (z: number) => (z - cz) / M

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 38, near: 0.02, far: 60, position: [span * 1.0, span * 1.05 + 0.5, span * 1.6] }} onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))}>
      <color attach="background" args={['#f7f8fa']} />
      <hemisphereLight args={['#ffffff', '#e6e2dc', 1.2]} />
      <directionalLight position={[1.5, 3, 2]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[-2, 1.5, -1.5]} intensity={0.5} />

      <group>
        {members.map((member) => (
          <group key={member.id} position={[wx(member.x), (member.elevation ?? 0) / M, wz(member.z)]} rotation={[0, yawOf(member), 0]}>
            <ItemModel item={member} drawersOpen={drawersOpen} />
            {showDims && member.kind !== 'rug' && (
              <Html position={[0, member.h / M + 0.12, 0]} center style={{ pointerEvents: 'none' }}>
                <span className="whitespace-nowrap rounded-md bg-inverse-surface/85 px-2 py-0.5 text-[11px] font-medium text-inverse-on-surface shadow">
                  {member.name} · W{member.w} × D{member.d} × H{member.h}
                </span>
              </Html>
            )}
          </group>
        ))}
        {showDims &&
          gaps.map((gap) => (
            <Dim
              key={`${gap.a.id}-${gap.b.id}`}
              from={[wx(gap.from[0]), 0.05, wz(gap.from[1])]}
              to={[wx(gap.to[0]), 0.05, wz(gap.to[1])]}
              label={
                gap.dist < 0
                  ? gap.b.model.includes('chair')
                    ? `${gap.b.name}가 ${gap.a.name} 아래로 ${mm(-gap.dist)} 들어가 있어요`
                    : `${gap.b.name}와 ${mm(-gap.dist)} 겹침`
                  : `${gap.a.name} ↔ ${gap.b.name} ${mm(gap.dist)}`
              }
              color={LEVEL_COLOR[gap.dist < 0 && gap.b.model.includes('chair') ? 'ok' : levelOf(gap.dist)]}
            />
          ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <circleGeometry args={[span * 1.1, 64]} />
        <meshStandardMaterial color="#eceae6" roughness={1} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <ContactShadows position={[0, 0.001, 0]} scale={span * 2.2} blur={2.2} opacity={0.35} far={1.2} />

      <OrbitControls
        makeDefault
        enableDamping
        autoRotate={autoRotate}
        autoRotateSpeed={1.6}
        target={[0, Math.min(0.5, tallest / 2), 0]}
        minDistance={0.8}
        maxDistance={12}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </Canvas>
  )
}
