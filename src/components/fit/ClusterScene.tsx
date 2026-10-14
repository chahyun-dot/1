import { useRef, useState } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Dim } from '@/components/fit/DetailScene'
import ItemModel from '@/components/fit/Models'
import { LEVEL_COLOR } from '@/components/fit/Scene'
import { footprint } from '@/lib/fit'
import type { Item, Level } from '@/lib/types'

const M = 1000
const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

// rest: b 가 a 위에 얹혀 있는 짝(서랍 위 조명, 소파 위 쿠션, 러그 위 테이블). 겹쳐 있는 것이 정상이다.
export type PairGap = { a: Item; b: Item; axis: 'x' | 'z'; dist: number; from: [number, number]; to: [number, number]; rest?: boolean }

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

// 3D 영역 글자에서는 침대 이름의 브랜드·모델 머리말(뷰티레스트 스위트 슈퍼싱글)을 뺀다.
const shortName = (name: string) => name.replace('뷰티레스트 스위트 슈퍼싱글 ', '')

const mm = (value: number) => `${Math.round(value).toLocaleString()}mm`

type ClusterSceneProps = {
  members: Item[]
  gaps: PairGap[]
  showDims: boolean
  autoRotate: boolean
  isDrawerOpen?: (item: Item) => boolean
  // 가구를 끌어서 옮길 때 방 좌표(mm)로 불린다.
  onMoveMember?: (id: string, x: number, z: number) => void
  onReady?: () => void
}

// 바닥 위에서 끌어 옮길 수 있는 가구 하나.
function DraggableMember({ position, yaw, onMove, onDrag, children }: { position: [number, number, number]; yaw: number; onMove: (wx: number, wz: number) => void; onDrag: (dragging: boolean) => void; children: React.ReactNode }) {
  const offset = useRef<[number, number] | null>(null)
  const hit = useRef(new THREE.Vector3())
  const floor = (event: ThreeEvent<PointerEvent>) => (event.ray.intersectPlane(FLOOR, hit.current) ? ([hit.current.x, hit.current.z] as [number, number]) : null)
  return (
    <group
      position={position}
      rotation={[0, yaw, 0]}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.stopPropagation()
        const point = floor(event)
        if (!point) return
        offset.current = [position[0] - point[0], position[2] - point[1]]
        ;(event.target as unknown as Element).setPointerCapture(event.pointerId)
        onDrag(true)
        document.body.style.cursor = 'grabbing'
      }}
      onPointerMove={(event) => {
        if (!offset.current) return
        event.stopPropagation()
        const point = floor(event)
        if (point) onMove(point[0] + offset.current[0], point[1] + offset.current[1])
      }}
      onPointerUp={(event) => {
        if (!offset.current) return
        offset.current = null
        ;(event.target as unknown as Element).releasePointerCapture(event.pointerId)
        onDrag(false)
        document.body.style.cursor = 'grab'
      }}
      onPointerOver={() => {
        if (!offset.current) document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        if (!offset.current) document.body.style.cursor = ''
      }}
    >
      {children}
    </group>
  )
}

export default function ClusterScene({ members, gaps, showDims, autoRotate, isDrawerOpen, onMoveMember, onReady }: ClusterSceneProps) {
  const [dragging, setDragging] = useState(false)
  // 가구를 끌어도 장면이 같이 움직이지 않도록 가운데와 카메라 거리는 처음 한 번만 잰다.
  const frame = useRef<{ cx: number; cz: number; span: number; tallest: number } | null>(null)
  if (!frame.current) {
    const first = members.map((member) => footprint(member))
    const x0 = Math.min(...first.map((r) => r.minX))
    const x1 = Math.max(...first.map((r) => r.maxX))
    const z0 = Math.min(...first.map((r) => r.minZ))
    const z1 = Math.max(...first.map((r) => r.maxZ))
    frame.current = { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, span: Math.max(x1 - x0, z1 - z0, 900) / M, tallest: Math.max(...members.map((member) => (member.elevation ?? 0) + member.h)) / M }
  }
  const { cx, cz, span, tallest } = frame.current
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
          <DraggableMember
            key={member.id}
            position={[wx(member.x), (member.elevation ?? 0) / M, wz(member.z)]}
            yaw={yawOf(member)}
            onMove={(mx, mz) => onMoveMember?.(member.id, mx * M + cx, mz * M + cz)}
            onDrag={setDragging}
          >
            <ItemModel item={member} drawersOpen={isDrawerOpen?.(member) ?? false} />
            {showDims && member.kind !== 'rug' && !['shirt', 'folded', 'shoes'].includes(member.model) && (
              <Html position={[0, member.h / M + 0.12, 0]} center style={{ pointerEvents: 'none' }}>
                <span className="whitespace-nowrap rounded-md bg-inverse-surface/85 px-2 py-0.5 text-[11px] font-medium text-inverse-on-surface shadow">
                  {shortName(member.name)} · W{member.w} × D{member.d} × H{member.h}
                </span>
              </Html>
            )}
          </DraggableMember>
        ))}
        {showDims &&
          gaps.map((gap) => (
            <Dim
              key={`${gap.a.id}-${gap.b.id}`}
              from={[wx(gap.from[0]), 0.05, wz(gap.from[1])]}
              to={[wx(gap.to[0]), 0.05, wz(gap.to[1])]}
              label={
                gap.rest
                  ? gap.dist < 0
                    ? `${shortName(gap.b.name)}이(가) ${shortName(gap.a.name)} 위에 놓여 있어요`
                    : `${shortName(gap.b.name)}이(가) ${shortName(gap.a.name)}에서 ${mm(gap.dist)} 떨어져 있어요`
                  : gap.dist < 0
                  ? gap.b.model.includes('chair')
                    ? `${shortName(gap.b.name)}가 ${shortName(gap.a.name)} 아래로 ${mm(-gap.dist)} 들어가 있어요`
                    : `${shortName(gap.b.name)}와 ${mm(-gap.dist)} 겹침`
                  : `${shortName(gap.a.name)} ↔ ${shortName(gap.b.name)} ${mm(gap.dist)}`
              }
              color={LEVEL_COLOR[gap.rest ? (gap.dist < 0 ? 'ok' : 'warn') : gap.dist < 0 && gap.b.model.includes('chair') ? 'ok' : levelOf(gap.dist)]}
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
        enabled={!dragging}
        enableDamping
        autoRotate={autoRotate && !dragging}
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
