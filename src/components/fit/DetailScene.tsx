import { useRef, useState } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import ItemModel from '@/components/fit/Models'
import { LEVEL_COLOR } from '@/components/fit/Scene'
import { fromDeskLocal, legInner, measureAgainstDesk, undersideOf, type DeskMeasure } from '@/lib/desk'
import { UNDER_MARGIN_MIN } from '@/lib/fit'
import type { Item, Level } from '@/lib/types'

const M = 1000
const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const NEUTRAL = '#5b6168'

type V3 = [number, number, number]

type DetailSceneProps = {
  desk: Item
  // 책상 아래 서랍장. 서랍장을 모두 뺀 뒤에는 없다.
  product: Item | null
  drawersOpen: boolean
  showDims: boolean
  autoRotate: boolean
  onMove: (x: number, z: number) => void
  // 책상 옆에 함께 보여 줄 가구(의자 등). 책상 기준 위치 그대로 그리고 끌어서 옮길 수 있다.
  extras?: Item[]
  onMoveExtra?: (id: string, x: number, z: number) => void
  onReady?: () => void
}

const mm = (value: number) => `${Math.round(value).toLocaleString()}mm`

const gapLevel = (mm: number): Level => (mm < 0 ? 'bad' : mm < UNDER_MARGIN_MIN ? 'warn' : 'ok')

export function Dim({ from, to, label, color = NEUTRAL, labelAt }: { from: V3; to: V3; label: string; color?: string; labelAt?: V3 }) {
  const mid: V3 = labelAt ?? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={1.8} />
      {[from, to].map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.006, 10, 10]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      <Html position={mid} center style={{ pointerEvents: 'none' }}>
        <span className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow" style={{ background: color }}>
          {label}
        </span>
      </Html>
    </group>
  )
}

function Dimensions({ desk, product, m }: { desk: Item; product: Item | null; m: DeskMeasure | null }) {
  const halfW = desk.w / 2 / M
  const halfD = desk.d / 2 / M
  const deskH = desk.h / M
  const under = undersideOf(desk) / M
  const inner = legInner(desk) / M
  const lineY = 0.12

  if (!product || !m) {
    return (
      <group>
        <Dim from={[-halfW, 0, halfD + 0.04]} to={[-halfW, deskH, halfD + 0.04]} label={`책상 높이 ${mm(desk.h)}`} />
        <Dim from={[-inner, 0, halfD - 0.02]} to={[-inner, under, halfD - 0.02]} label={`상판 아래 ${mm(undersideOf(desk))}`} labelAt={[-inner, under * 0.75, halfD - 0.02]} />
        <Dim from={[-inner, under - 0.04, -halfD + 0.04]} to={[inner, under - 0.04, -halfD + 0.04]} label={`다리 안쪽 ${mm(inner * 2 * M)}`} />
      </group>
    )
  }

  const r = { minX: m.rect.minX / M, maxX: m.rect.maxX / M, minZ: m.rect.minZ / M, maxZ: m.rect.maxZ / M }
  const cx = (r.minX + r.maxX) / 2
  const h = product.h / M

  return (
    <group>
      <Dim from={[-halfW, 0, halfD + 0.04]} to={[-halfW, deskH, halfD + 0.04]} label={`책상 높이 ${mm(desk.h)}`} />
      <Dim from={[-inner, 0, halfD - 0.02]} to={[-inner, under, halfD - 0.02]} label={`상판 아래 ${mm(m.underside)}`} labelAt={[-inner, under * 0.75, halfD - 0.02]} />
      <Dim from={[-inner, under - 0.04, -halfD + 0.04]} to={[inner, under - 0.04, -halfD + 0.04]} label={`다리 안쪽 ${mm(m.inner * 2)}`} />

      <Dim from={[r.minX, 0.004, r.maxZ + 0.06]} to={[r.maxX, 0.004, r.maxZ + 0.06]} label={`가로 ${mm(m.rect.maxX - m.rect.minX)}`} />
      <Dim from={[r.maxX + 0.05, 0.004, r.minZ]} to={[r.maxX + 0.05, 0.004, r.maxZ]} label={`깊이 ${mm(m.rect.maxZ - m.rect.minZ)}`} />
      <Dim from={[r.maxX + 0.05, 0, r.maxZ]} to={[r.maxX + 0.05, h, r.maxZ]} label={`높이 ${mm(product.h)}`} />

      {m.overlapsTop ? (
        <>
          <Dim
            from={[cx, h, r.maxZ - 0.03]}
            to={[cx, under, r.maxZ - 0.03]}
            label={m.topGap < 0 ? `상판보다 ${mm(-m.topGap)} 높아요` : `위 여유 ${mm(m.topGap)}`}
            color={LEVEL_COLOR[gapLevel(m.topGap)]}
            labelAt={[cx, under + 0.05, r.maxZ + 0.02]}
          />
          <Dim
            from={[-inner, lineY, r.maxZ]}
            to={[r.minX, lineY, r.maxZ]}
            label={m.leftLeg < 0 ? `왼쪽 다리에 ${mm(-m.leftLeg)} 걸림` : `왼쪽 다리까지 ${mm(m.leftLeg)}`}
            color={LEVEL_COLOR[gapLevel(m.leftLeg)]}
          />
          <Dim
            from={[r.maxX, lineY + 0.06, r.maxZ]}
            to={[inner, lineY + 0.06, r.maxZ]}
            label={m.rightLeg < 0 ? `오른쪽 다리에 ${mm(-m.rightLeg)} 걸림` : `오른쪽 다리까지 ${mm(m.rightLeg)}`}
            color={LEVEL_COLOR[gapLevel(m.rightLeg)]}
          />
          <Dim
            from={[cx, 0.01, r.maxZ]}
            to={[cx, 0.01, halfD]}
            label={m.frontEdge < 0 ? `책상 밖으로 ${mm(-m.frontEdge)} 나옴` : `상판 앞 끝까지 ${mm(m.frontEdge)}`}
            labelAt={[cx, 0.01, (r.maxZ + halfD) / 2 + 0.03]}
          />
          <Dim from={[cx, 0.01, -halfD]} to={[cx, 0.01, r.minZ]} label={`뒤 ${mm(m.backEdge)}`} />
        </>
      ) : (
        m.sideToDesk !== null && (
          <>
            <Dim
              from={[m.rect.minX >= desk.w / 2 ? halfW : r.maxX, h / 2, (r.minZ + r.maxZ) / 2]}
              to={[m.rect.minX >= desk.w / 2 ? r.minX : -halfW, h / 2, (r.minZ + r.maxZ) / 2]}
              label={`책상과 ${mm(m.sideToDesk)}`}
              color={LEVEL_COLOR[gapLevel(m.sideToDesk)]}
            />
            <Dim from={[cx, h, r.minZ]} to={[cx, deskH, r.minZ]} label={`상판보다 ${mm(desk.h - product.h)} 낮아요`} />
          </>
        )
      )}
    </group>
  )
}

// 서랍장이 없을 때 의자를 끌어 옮기면 따라 바뀌는 책상과의 간격(책상 앞 끝, 아래로 들어간 깊이, 다리·뒤 간격).
function ChairDims({ desk, chair }: { desk: Item; chair: Item }) {
  const m = measureAgainstDesk(desk, chair)
  const halfD = desk.d / 2 / M
  const inner = m.inner / M
  const r = { minX: m.rect.minX / M, maxX: m.rect.maxX / M, minZ: m.rect.minZ / M, maxZ: m.rect.maxZ / M }
  const cx = (r.minX + r.maxX) / 2
  const y = 0.01
  if (r.minZ >= halfD) {
    return <Dim from={[cx, y, halfD]} to={[cx, y, r.minZ]} label={`책상 앞 끝까지 ${mm((m.rect.minZ - desk.d / 2))}`} />
  }
  if (!m.overlapsTop) {
    return m.sideToDesk === null ? null : (
      <Dim
        from={[m.rect.minX >= desk.w / 2 ? desk.w / 2 / M : r.maxX, y, (r.minZ + r.maxZ) / 2]}
        to={[m.rect.minX >= desk.w / 2 ? r.minX : -desk.w / 2 / M, y, (r.minZ + r.maxZ) / 2]}
        label={`책상과 ${mm(m.sideToDesk)}`}
        color={LEVEL_COLOR[gapLevel(m.sideToDesk)]}
      />
    )
  }
  const tuck = Math.min(m.rect.maxZ, desk.d / 2) - m.rect.minZ
  return (
    <>
      <Dim from={[cx, y, r.minZ]} to={[cx, y, Math.min(r.maxZ, halfD)]} label={`책상 아래로 ${mm(tuck)} 들어감`} />
      <Dim from={[cx, y, -halfD]} to={[cx, y, r.minZ]} label={`뒤 ${mm(m.backEdge)}`} />
      <Dim
        from={[-inner, 0.12, r.maxZ]}
        to={[r.minX, 0.12, r.maxZ]}
        label={m.leftLeg < 0 ? `왼쪽 다리에 ${mm(-m.leftLeg)} 걸림` : `왼쪽 다리까지 ${mm(m.leftLeg)}`}
        color={LEVEL_COLOR[gapLevel(m.leftLeg)]}
      />
      <Dim
        from={[r.maxX, 0.18, r.maxZ]}
        to={[inner, 0.18, r.maxZ]}
        label={m.rightLeg < 0 ? `오른쪽 다리에 ${mm(-m.rightLeg)} 걸림` : `오른쪽 다리까지 ${mm(m.rightLeg)}`}
        color={LEVEL_COLOR[gapLevel(m.rightLeg)]}
      />
    </>
  )
}

// 책상 기준 좌표에서 끌어 옮길 수 있는 가구(서랍장, 의자).
function DraggableProduct({ desk, product, drawersOpen, onMove, onDrag }: {
  desk: Item
  product: Item
  drawersOpen: boolean
  onMove: (x: number, z: number) => void
  onDrag: (dragging: boolean) => void
}) {
  const m = measureAgainstDesk(desk, product)
  const offset = useRef<[number, number] | null>(null)
  const hit = useRef(new THREE.Vector3())
  const cx = (m.rect.minX + m.rect.maxX) / 2
  const cz = (m.rect.minZ + m.rect.maxZ) / 2

  const local = (event: ThreeEvent<PointerEvent>) =>
    event.ray.intersectPlane(FLOOR, hit.current) ? ([hit.current.x * M, hit.current.z * M] as [number, number]) : null

  return (
    <group
      position={[cx / M, 0, cz / M]}
      rotation={[0, (m.relRot * Math.PI) / 2, 0]}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.stopPropagation()
        const point = local(event)
        if (!point) return
        offset.current = [cx - point[0], cz - point[1]]
        ;(event.target as unknown as Element).setPointerCapture(event.pointerId)
        onDrag(true)
        document.body.style.cursor = 'grabbing'
      }}
      onPointerMove={(event) => {
        if (!offset.current) return
        event.stopPropagation()
        const point = local(event)
        if (point) onMove(...fromDeskLocal(desk, point[0] + offset.current[0], point[1] + offset.current[1]))
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
      <ItemModel item={product} drawersOpen={drawersOpen} />
    </group>
  )
}

export default function DetailScene({ desk, product, drawersOpen, showDims, autoRotate, onMove, extras = [], onMoveExtra, onReady }: DetailSceneProps) {
  const [dragging, setDragging] = useState(false)
  const m = product ? measureAgainstDesk(desk, product) : null
  const span = Math.max(desk.w, desk.d, 900, extras.length ? 1900 : 0) / M

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 38, near: 0.02, far: 50, position: [span * 0.9, span * 0.75, span * 1.15] }} onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))}>
      <color attach="background" args={['#f7f8fa']} />
      <hemisphereLight args={['#ffffff', '#e6e2dc', 1.2]} />
      <directionalLight position={[1.5, 3, 2]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[-2, 1.5, -1.5]} intensity={0.5} />

      <group>
        <ItemModel item={{ ...desk, rot: 0 }} />
        {extras.map((extra) => (
          <DraggableProduct key={extra.id} desk={desk} product={extra} drawersOpen={false} onMove={(x, z) => onMoveExtra?.(extra.id, x, z)} onDrag={setDragging} />
        ))}
        {product && <DraggableProduct desk={desk} product={product} drawersOpen={drawersOpen} onMove={onMove} onDrag={setDragging} />}
        {showDims && <Dimensions desk={desk} product={product} m={m} />}
        {showDims && !product && extras.map((extra) => <ChairDims key={extra.id} desk={desk} chair={extra} />)}
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
        target={[0, 0.35, 0]}
        minDistance={0.6}
        maxDistance={6}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </Canvas>
  )
}
