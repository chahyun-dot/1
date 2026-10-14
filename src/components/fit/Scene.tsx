import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import ItemModel from '@/components/fit/Models'
import RoomShell from '@/components/fit/RoomShell'
import { DRAWER_PULL, cm, footprint, frontZone } from '@/lib/fit'
import { fromWorld, toWorld } from '@/lib/room'
import type { FitResult, Item, Level, Rect, Room } from '@/lib/types'

export type View = 'persp' | 'top'

const M = 1000
const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
export const LEVEL_COLOR: Record<Level, string> = { ok: '#10b981', warn: '#f59e0b', bad: '#f75656' }

type SceneProps = {
  room: Room
  items: Item[]
  selectedId: string | null
  focus: Item | null
  fit: FitResult | null
  view: View
  drawersOpen: boolean
  // 서랍이 열린 가구를 따로 정할 때(기본은 drawersOpen 이 true 일 때 서랍장 제품만 연다).
  isDrawerOpen?: (item: Item) => boolean
  // 서랍 앞 공간 표시는 서랍장 전용이라 데모처럼 다른 가구를 볼 때는 끈다.
  showFrontZone?: boolean
  // 카메라를 기본보다 멀리(1보다 크게) 두면 좁은 화면에서도 방이 덜 잘린다.
  distance?: number
  onSelect: (id: string | null) => void
  onMove: (id: string, x: number, z: number) => void
  onOpenDetail: (id: string) => void
  // 눌렀을 때 상세 보기로 넘어가는 가구. 기본은 책상 모델(desk)이다.
  canOpenDetail?: (item: Item) => boolean
  // 첫 화면이 그려진 뒤 한 번 불린다(로딩 표시를 끄는 용도).
  onReady?: () => void
  // true 면 가구를 눌러도 바로 상세로 가지 않고, 가구 위에 뜨는 "제품 상세 페이지 이동" 버튼으로 간다. 러그도 눌러 고를 수 있다.
  detailButton?: boolean
}

const CLICK_SLOP = 5

const yawOf = (item: Item) => (item.yaw !== undefined ? (item.yaw * Math.PI) / 180 : (item.rot * Math.PI) / 2)

type ControlsLike = { target: THREE.Vector3; update: () => void }

function CameraRig({ view, room, distance }: { view: View; room: Room; distance: number }) {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as unknown as ControlsLike | null

  useEffect(() => {
    const span = (Math.max(room.w, room.d) / M) * distance
    // 이미지처럼 모서리를 비스듬히 내려다보는 아이소메트릭 시점 (좁은 화각으로 원근을 줄인다)
    if (view === 'top') camera.position.set(0, span * 3.4, 0.001)
    else camera.position.set(-span * 1.8, span * 1.33, span * 1.8)
    controls?.target.set(0, 0.7, 0)
    controls?.update()
  }, [view, room.w, room.d, distance, camera, controls])

  return null
}

const rectPoints = (room: Room, r: Rect, y: number) =>
  [
    [r.minX, r.minZ],
    [r.maxX, r.minZ],
    [r.maxX, r.maxZ],
    [r.minX, r.maxZ],
    [r.minX, r.minZ],
  ].map(([x, z]) => {
    const [wx, wz] = toWorld(room, x, z)
    return [wx, y, wz] as [number, number, number]
  })

function Outline({ room, item, color }: { room: Room; item: Item; color: string }) {
  return <Line points={rectPoints(room, footprint(item), 0.012)} color={color} lineWidth={2.5} />
}

function DrawerZone({ room, item, fit }: { room: Room; item: Item; fit: FitResult }) {
  const zone = frontZone(item, DRAWER_PULL)
  const [cx, cz] = toWorld(room, (zone.minX + zone.maxX) / 2, (zone.minZ + zone.maxZ) / 2)
  const front = fit.gaps.find((gap) => gap.side === '앞')
  const blocked = (front?.distance ?? 0) < DRAWER_PULL
  const color = blocked ? LEVEL_COLOR.bad : '#35c5f0'
  return (
    <group>
      <mesh position={[cx, 0.006, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[(zone.maxX - zone.minX) / M, (zone.maxZ - zone.minZ) / M]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <Line points={rectPoints(room, zone, 0.008)} color={color} lineWidth={1.5} dashed dashSize={0.04} gapSize={0.03} />
    </group>
  )
}

function GapLines({ room, fit }: { room: Room; fit: FitResult }) {
  return (
    <>
      {fit.gaps
        .filter((gap) => gap.distance >= 5)
        .map((gap) => {
          const [ax, az] = toWorld(room, ...gap.from)
          const [bx, bz] = toWorld(room, ...gap.to)
          const color = gap.side === '앞' ? LEVEL_COLOR[gap.level] : '#828c94'
          return (
            <group key={gap.dir}>
              <Line points={[[ax, 0.02, az], [bx, 0.02, bz]]} color={color} lineWidth={2} dashed dashSize={0.05} gapSize={0.03} />
              <Html position={[(ax + bx) / 2, 0.03, (az + bz) / 2]} center style={{ pointerEvents: 'none' }}>
                <span
                  className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow"
                  style={{ background: color }}
                >
                  {gap.side} {cm(gap.distance)}
                </span>
              </Html>
            </group>
          )
        })}
    </>
  )
}

// 선택한 가구 위에 뜨는 이름표. detailButton 이면 이름 아래에 상세 이동 버튼이 붙는다.
function ItemLabel({ item, onClick, detailButton }: { item: Item; onClick?: () => void; detailButton: boolean }) {
  return (
    <Html position={[0, item.h / M + 0.18, 0]} center style={{ pointerEvents: 'none' }}>
      {detailButton ? (
        <div className="flex flex-col items-center gap-1">
          <span className="whitespace-nowrap rounded-md bg-inverse-surface/90 px-2 py-1 text-[11px] font-medium text-inverse-on-surface shadow">{item.name}</span>
          {onClick && (
            <button
              type="button"
              onClick={onClick}
              style={{ pointerEvents: 'auto' }}
              className="cursor-pointer whitespace-nowrap rounded-full bg-primary-container px-2 py-[3px] text-[8px] font-bold text-white shadow-md hover:opacity-90"
            >
              제품 상세 페이지 이동
            </button>
          )}
        </div>
      ) : (
        <span className="whitespace-nowrap rounded-md bg-inverse-surface/90 px-2 py-1 text-[11px] font-medium text-inverse-on-surface shadow">
          {onClick ? <span className="text-primary-container">상품 자세히 보기</span> : item.name}
        </span>
      )}
    </Html>
  )
}

function DraggableItem({
  room,
  item,
  selected,
  drawersOpen,
  onSelect,
  onMove,
  onDragChange,
  onClick,
  detailButton,
}: {
  room: Room
  item: Item
  selected: boolean
  drawersOpen: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, z: number) => void
  onDragChange: (dragging: boolean) => void
  onClick?: () => void
  detailButton: boolean
}) {
  const offset = useRef<[number, number] | null>(null)
  const downAt = useRef<[number, number] | null>(null)
  const hit = useRef(new THREE.Vector3())
  const [x, z] = toWorld(room, item.x, item.z)

  if (item.kind === 'rug') {
    return (
      <group
        position={[x, 0, z]}
        rotation={[0, yawOf(item), 0]}
        onClick={
          detailButton
            ? (event) => {
                event.stopPropagation()
                onSelect(item.id)
              }
            : undefined
        }
        onPointerOver={detailButton ? () => (document.body.style.cursor = 'pointer') : undefined}
        onPointerOut={detailButton ? () => (document.body.style.cursor = '') : undefined}
      >
        <ItemModel item={item} />
        {detailButton && selected && <ItemLabel item={item} onClick={onClick} detailButton />}
      </group>
    )
  }

  const floorPoint = (event: ThreeEvent<PointerEvent>) =>
    event.ray.intersectPlane(FLOOR, hit.current) ? fromWorld(room, hit.current.x, hit.current.z) : null

  const handleDown = (event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return
    event.stopPropagation()
    onSelect(item.id)
    downAt.current = [event.nativeEvent.clientX, event.nativeEvent.clientY]
    const point = floorPoint(event)
    if (!point) return
    offset.current = [item.x - point[0], item.z - point[1]]
    ;(event.target as unknown as Element).setPointerCapture(event.pointerId)
    onDragChange(true)
    document.body.style.cursor = 'grabbing'
  }

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    if (!offset.current) return
    event.stopPropagation()
    const point = floorPoint(event)
    if (point) onMove(item.id, point[0] + offset.current[0], point[1] + offset.current[1])
  }

  const handleUp = (event: ThreeEvent<PointerEvent>) => {
    if (!offset.current) return
    offset.current = null
    ;(event.target as unknown as Element).releasePointerCapture(event.pointerId)
    onDragChange(false)
    document.body.style.cursor = 'grab'
    const start = downAt.current
    downAt.current = null
    const moved = start ? Math.hypot(event.nativeEvent.clientX - start[0], event.nativeEvent.clientY - start[1]) : Infinity
    if (moved < CLICK_SLOP && !detailButton) onClick?.()
  }

  return (
    <group
      position={[x, (item.elevation ?? 0) / M, z]}
      rotation={[0, yawOf(item), 0]}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (!offset.current) document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        if (!offset.current) document.body.style.cursor = ''
      }}
    >
      <ItemModel item={item} drawersOpen={drawersOpen} />
      {selected && <ItemLabel item={item} onClick={onClick} detailButton={detailButton} />}
    </group>
  )
}

export default function Scene({ room, items, selectedId, focus, fit, view, drawersOpen, isDrawerOpen, showFrontZone = true, distance = 1, onSelect, onMove, onOpenDetail, canOpenDetail = (item) => item.model === 'desk', onReady, detailButton = false }: SceneProps) {
  const [dragging, setDragging] = useState(false)

  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 24, near: 0.1, far: 200, position: [-10.8, 8, 10.8] }}
      onPointerMissed={(event) => event.button === 0 && onSelect(null)}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))}
    >
      <color attach="background" args={['#2b2c2f']} />
      <hemisphereLight args={['#ffffff', '#8a8d93', 1.25]} />
      <directionalLight
        position={[2.5, 6, 3.5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />

      <RoomShell room={room} />

      {items.map((item) => (
        <DraggableItem
          key={item.id}
          room={room}
          item={item}
          selected={item.id === selectedId}
          drawersOpen={isDrawerOpen ? isDrawerOpen(item) : drawersOpen && item.kind === 'product'}
          onSelect={onSelect}
          onMove={onMove}
          onDragChange={setDragging}
          onClick={canOpenDetail(item) ? () => onOpenDetail(item.id) : undefined}
          detailButton={detailButton}
        />
      ))}

      {items
        .filter((item) => item.id === selectedId && item.kind !== 'product')
        .map((item) => (
          <Outline key={item.id} room={room} item={item} color="#35c5f0" />
        ))}
      {focus && fit && (
        <>
          <Outline room={room} item={focus} color={LEVEL_COLOR[fit.verdict]} />
          {showFrontZone && <DrawerZone room={room} item={focus} fit={fit} />}
          <GapLines room={room} fit={fit} />
        </>
      )}

      <OrbitControls
        makeDefault
        enabled={!dragging}
        enableDamping
        minDistance={1}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
      <CameraRig view={view} room={room} distance={distance} />
    </Canvas>
  )
}
