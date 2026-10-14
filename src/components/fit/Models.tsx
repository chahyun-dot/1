import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { DESK_TOP, FOOT_W, LEG_W, legCenter, undersideOf } from '@/lib/desk'
import { DRAWER_PULL } from '@/lib/fit'
import { PROP_MODELS } from '@/components/fit/ArchiProps'
import { AraliaPlant, ArdenMirror, BedWithBedding, BlackBed, ChromeCabinet, CoreRack, DrawerUnit, FkSofa, MeshOfficeChair, MotionDesk, PegBoard, SteelShelf, WallTv, WalnutDiningChair, WoodBlind } from '@/components/fit/ArchiModels'
import type { Item } from '@/lib/types'

const M = 1000
const DEFAULT_CASTER = 50
const TOP_DRAWER = 0.075
const DRAWER_COUNT = 4

type ModelProps = { item: Item; drawersOpen?: boolean }

function Cabinet({ item, drawersOpen = false }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const caster = (item.caster ?? DEFAULT_CASTER) / M
  const bodyH = h - caster
  const inner = bodyH - 0.024
  const rowH = (inner - TOP_DRAWER) / DRAWER_COUNT
  const rows = [TOP_DRAWER, ...Array.from({ length: DRAWER_COUNT }, () => rowH)]
  const drawerRefs = useRef<(THREE.Group | null)[]>([])
  const steel = { color: item.color, roughness: 0.45, metalness: 0.35 }

  useFrame((_, delta) => {
    drawerRefs.current.forEach((group, index) => {
      if (!group) return
      const target = drawersOpen ? (DRAWER_PULL / M) * (index === 0 ? 0.8 : 1) : 0
      group.position.z = THREE.MathUtils.damp(group.position.z, target, 8, delta)
    })
  })

  let cursor = caster + bodyH - 0.012
  return (
    <group>
      {caster > 0 &&
        [-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.035), caster / 2, sz * (d / 2 - 0.045)]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[caster / 2, caster / 2, 0.018, 16]} />
              <meshStandardMaterial color="#26272a" roughness={0.6} />
            </mesh>
          )),
        )}
      <mesh position={[0, caster + bodyH / 2, -0.006]} castShadow receiveShadow>
        <boxGeometry args={[w, bodyH, d - 0.012]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      {rows.map((rh, index) => {
        const y = cursor - rh / 2
        cursor -= rh
        return (
          <group key={index} ref={(el) => { drawerRefs.current[index] = el }}>
            <mesh position={[0, y, d / 2 - 0.006]} castShadow>
              <boxGeometry args={[w - 0.01, rh - 0.006, 0.014]} />
              <meshStandardMaterial {...steel} />
            </mesh>
            <mesh position={[0, y + rh / 2 - 0.02, d / 2 + 0.0015]}>
              <boxGeometry args={[w * 0.46, 0.012, 0.004]} />
              <meshStandardMaterial color="#1b1c1f" roughness={0.8} />
            </mesh>
            <mesh position={[0, y - 0.004, -0.004]}>
              <boxGeometry args={[w - 0.03, rh - 0.03, d - 0.035]} />
              <meshStandardMaterial color={item.color} roughness={0.7} metalness={0.2} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}


function Desk({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const top = DESK_TOP / M
  const under = h - top
  const underside = undersideOf(item) / M
  const apron = under - underside
  const legX = legCenter(item) / M
  const frame = { color: item.color, roughness: 0.55, metalness: 0.05 }
  return (
    <group>
      <mesh position={[0, h - top / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, top, d]} />
        <meshStandardMaterial color={item.color} roughness={0.5} />
      </mesh>
      {apron > 0.004 && (
        <mesh position={[0, underside + apron / 2, 0]} castShadow>
          <boxGeometry args={[legX * 2 - LEG_W / M, apron, d * 0.9]} />
          <meshStandardMaterial color={item.color} roughness={0.55} />
        </mesh>
      )}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * legX, 0, 0]}>
          <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
            <boxGeometry args={[FOOT_W / M, 0.03, d * 0.92]} />
            <meshStandardMaterial {...frame} />
          </mesh>
          <mesh position={[0, (under - 0.03) / 2 + 0.03, 0]} castShadow>
            <boxGeometry args={[LEG_W / M, under - 0.06, LEG_W / M]} />
            <meshStandardMaterial {...frame} />
          </mesh>
          <mesh position={[0, under - 0.015, 0]} castShadow>
            <boxGeometry args={[0.05, 0.03, d * 0.86]} />
            <meshStandardMaterial {...frame} />
          </mesh>
        </group>
      ))}
      <mesh position={[legX - 0.12, underside - 0.012, d / 2 - 0.06]}>
        <boxGeometry args={[0.14, 0.024, 0.05]} />
        <meshStandardMaterial color="#1d1e21" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Chair({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const seat = 0.46
  return (
    <group>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[w * 0.42, w * 0.42, 0.03, 5]} />
        <meshStandardMaterial color="#1f2023" />
      </mesh>
      <mesh position={[0, seat / 2, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, seat, 12]} />
        <meshStandardMaterial color="#6b6e74" metalness={0.6} roughness={0.3} />
      </mesh>
      <RoundedBox args={[w * 0.9, 0.07, d * 0.85]} radius={0.03} smoothness={3} position={[0, seat, 0.02]} castShadow>
        <meshStandardMaterial color={item.color} roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[w * 0.85, h - seat - 0.05, 0.05]} radius={0.02} smoothness={3} position={[0, (seat + h) / 2 + 0.02, -d / 2 + 0.06]} castShadow>
        <meshStandardMaterial color={item.color} roughness={0.9} />
      </RoundedBox>
    </group>
  )
}

function Bed({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.28, d]} />
        <meshStandardMaterial color={item.color} roughness={0.7} />
      </mesh>
      <RoundedBox args={[w - 0.05, 0.2, d - 0.08]} radius={0.04} smoothness={4} position={[0, 0.38, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#f7f6f2" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[w - 0.04, 0.05, d * 0.55]} radius={0.02} smoothness={3} position={[0, 0.5, d * 0.2]} castShadow>
        <meshStandardMaterial color="#5b5957" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[w * 0.6, 0.1, 0.35]} radius={0.05} smoothness={4} position={[0, 0.53, -d / 2 + 0.3]} castShadow>
        <meshStandardMaterial color="#8d8b8a" roughness={1} />
      </RoundedBox>
      <mesh position={[0, h / 2, -d / 2 + 0.03]} castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.06]} />
        <meshStandardMaterial color={item.color} roughness={0.7} />
      </mesh>
    </group>
  )
}

function Rug({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const bordered = Math.min(w, d) > 1
  return (
    <group>
      <mesh position={[0, 0.003, 0]} receiveShadow>
        <boxGeometry args={[w, 0.006, d]} />
        <meshStandardMaterial color={item.color} roughness={1} />
      </mesh>
      {bordered && (
        <>
          <mesh position={[0, 0.0045, 0]} receiveShadow>
            <boxGeometry args={[w - 0.16, 0.007, d - 0.16]} />
            <meshStandardMaterial color="#e9e9ea" roughness={1} />
          </mesh>
          <mesh position={[0, 0.006, 0]} receiveShadow>
            <boxGeometry args={[w - 0.22, 0.008, d - 0.22]} />
            <meshStandardMaterial color={item.color} roughness={1} />
          </mesh>
        </>
      )}
    </group>
  )
}

function RoundRug({ item }: ModelProps) {
  const r = item.w / 2 / M
  return (
    <group>
      <mesh position={[0, 0.003, 0]} receiveShadow>
        <cylinderGeometry args={[r, r, 0.006, 64]} />
        <meshStandardMaterial color={item.color} roughness={1} />
      </mesh>
      <mesh position={[0, 0.004, 0]} receiveShadow>
        <cylinderGeometry args={[r * 0.9, r * 0.9, 0.008, 64]} />
        <meshStandardMaterial color="#efeeea" roughness={1} />
      </mesh>
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <cylinderGeometry args={[r * 0.78, r * 0.78, 0.01, 64]} />
        <meshStandardMaterial color={item.color} roughness={1} />
      </mesh>
    </group>
  )
}

const BOOKS = ['#2f7d4f', '#3a6ea5', '#c8553d', '#e2b94a']

// 앞이 열린 상자(벽 5면). 앞쪽은 로컬 +z.
export function OpenBox({ w, h, d, color, t = 0.028 }: { w: number; h: number; d: number; color: string; t?: number }) {
  const board = (key: string, size: [number, number, number], position: [number, number, number]) => (
    <mesh key={key} position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
  return (
    <group>
      {board('l', [t, h, d], [-w / 2 + t / 2, h / 2, 0])}
      {board('r', [t, h, d], [w / 2 - t / 2, h / 2, 0])}
      {board('top', [w, t, d], [0, h - t / 2, 0])}
      {board('bottom', [w, t, d], [0, t / 2, 0])}
      {board('back', [w, h, t], [0, h / 2, -d / 2 + t / 2])}
    </group>
  )
}

// 이미지처럼 아래 칸(책)과 위 칸(작은 상자)이 엇갈려 쌓인 협탁 책장. 위 칸 옆에 조명이 켜져 있다.
function Shelf({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const lowerH = h * 0.5
  const upperH = h - lowerH
  const upperW = w * 0.7
  return (
    <group>
      <OpenBox w={w} h={lowerH} d={d} color={item.color} />
      <group position={[w / 2 - upperW / 2, lowerH, -d * 0.05]}>
        <OpenBox w={upperW} h={upperH} d={d * 0.9} color={item.color} />
      </group>
      {BOOKS.map((color, index) => (
        <mesh key={color} position={[-w * 0.38 + index * 0.045, 0.028 + 0.11, -d * 0.05]} castShadow>
          <boxGeometry args={[0.035, 0.22 - (index % 2) * 0.03, d * 0.55]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-w / 2 + (w - upperW) / 2, lowerH + 0.09, d * 0.12]}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial color="#ffe27a" emissive="#ffd24a" emissiveIntensity={1.6} />
      </mesh>
    </group>
  )
}

function Sofa({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const arm = 0.14
  const mat = <meshStandardMaterial color={item.color} roughness={0.9} />
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.24, d]} />
        {mat}
      </mesh>
      {[-1, 1].map((sx) => (
        <RoundedBox key={sx} args={[w / 2 - arm, 0.16, d * 0.72]} radius={0.05} smoothness={3} position={[sx * (w / 4 - arm / 4), 0.36, d * 0.1]} castShadow>
          {mat}
        </RoundedBox>
      ))}
      <RoundedBox args={[w, h - 0.2, 0.2]} radius={0.08} smoothness={3} position={[0, 0.2 + (h - 0.2) / 2, -d / 2 + 0.1]} castShadow>
        {mat}
      </RoundedBox>
      {[-1, 1].map((sx) => (
        <RoundedBox key={`a${sx}`} args={[arm, h * 0.62, d]} radius={0.05} smoothness={3} position={[sx * (w / 2 - arm / 2), h * 0.31 + 0.12, 0]} castShadow>
          <meshStandardMaterial color="#2f2f31" roughness={0.7} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.34, 0.3, 0.1]} radius={0.04} smoothness={3} position={[-w * 0.3, 0.62, -d / 2 + 0.3]} rotation={[-0.25, 0, 0.1]} castShadow>
        <meshStandardMaterial color="#2b2b2d" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.3, 0.1]} radius={0.04} smoothness={3} position={[-w * 0.18, 0.6, -d / 2 + 0.3]} rotation={[-0.25, 0, -0.1]} castShadow>
        <meshStandardMaterial color="#d8c3b0" roughness={1} />
      </RoundedBox>
    </group>
  )
}

function Table({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <mesh position={[0, (h - 0.06) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.92, h - 0.06, d * 0.9]} />
        <meshStandardMaterial color="#6f7073" roughness={0.6} />
      </mesh>
      <RoundedBox args={[w, 0.06, d]} radius={0.015} smoothness={3} position={[0, h - 0.03, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={item.color} roughness={0.35} />
      </RoundedBox>
    </group>
  )
}

// 데모 페이지에서 고른 가구: 3D 모델이 없어서 치수 그대로의 상자로 보여 준다. 앞면(+z) 위쪽에 흰 줄을 둬 방향을 알 수 있게 한다.
function Box({ item }: ModelProps) {
  const w = item.w / M
  const d = item.d / M
  const h = Math.max(item.h / M, 0.01)
  const radius = Math.min(0.02, w / 4, h / 4, d / 4)
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={radius} smoothness={3} position={[0, h / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={item.color} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, h * 0.85, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.7, Math.min(0.03, h * 0.1)]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

// 두 점 사이를 잇는 가는 막대(다리, 파이프용).
function Tube({ from, to, radius, color }: { from: [number, number, number]; to: [number, number, number]; radius: number; color: string }) {
  const a = new THREE.Vector3(...from)
  const b = new THREE.Vector3(...to)
  const dir = b.clone().sub(a)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  return (
    <mesh position={a.clone().add(b).multiplyScalar(0.5).toArray()} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, dir.length(), 12]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} />
    </mesh>
  )
}

// Archisketch "W1000 원형테이블": 얇은 둥근 상판, 가운데 기둥, 바깥으로 벌어졌다가 끝이 아래로 꺾이는 가는 다리 3개.
function RoundTable({ item }: ModelProps) {
  const r = item.w / 2 / M
  const h = item.h / M
  const topThickness = 0.025
  const underside = h - topThickness
  const joint = h * 0.8
  const reach = r * 0.9
  const foot = 0.05
  const metal = '#1b1b1d'
  return (
    <group>
      <mesh position={[0, h - topThickness / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, topThickness, 64]} />
        <meshStandardMaterial color="#3e3e40" roughness={0.55} />
      </mesh>
      <mesh position={[0, (underside + joint) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, underside - joint, 16]} />
        <meshStandardMaterial color={metal} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, joint, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.02, 0.05, 16]} />
        <meshStandardMaterial color={metal} metalness={0.5} roughness={0.35} />
      </mesh>
      {[0, 1, 2].map((index) => {
        const angle = Math.PI / 2 + (index * Math.PI * 2) / 3
        const cx = Math.cos(angle)
        const cz = Math.sin(angle)
        const kneeY = foot
        return (
          <group key={index}>
            <Tube from={[cx * 0.02, joint, cz * 0.02]} to={[cx * reach, kneeY, cz * reach]} radius={0.0105} color={metal} />
            <Tube from={[cx * reach, kneeY, cz * reach]} to={[cx * reach, 0.004, cz * reach]} radius={0.0105} color={metal} />
            <mesh position={[cx * reach, kneeY, cz * reach]} castShadow>
              <sphereGeometry args={[0.0105, 12, 12]} />
              <meshStandardMaterial color={metal} metalness={0.5} roughness={0.35} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Plant({ item }: ModelProps) {
  const r = item.w / 2 / M
  const leaves = Array.from({ length: 9 }, (_, index) => index)
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[r * 0.75, r * 0.55, 0.3, 20]} />
        <meshStandardMaterial color="#efeeea" roughness={0.8} />
      </mesh>
      {leaves.map((index) => (
        <group key={index} rotation={[0, (index / leaves.length) * Math.PI * 2, 0]}>
          <mesh position={[r * 0.55, 0.62 + (index % 3) * 0.14, 0]} rotation={[0, 0, -0.5 - (index % 3) * 0.12]} scale={[0.5, 1.8, 0.14]} castShadow>
            <sphereGeometry args={[0.13, 14, 14]} />
            <meshStandardMaterial color={item.color} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function ItemModel(props: ModelProps) {
  switch (props.item.model) {
    case 'cabinet':
      return <Cabinet {...props} />
    case 'desk':
      return <Desk {...props} />
    case 'chair':
      return <Chair {...props} />
    case 'bed':
      return <Bed {...props} />
    case 'rug':
      return <Rug {...props} />
    case 'roundrug':
      return <RoundRug {...props} />
    case 'shelf':
      return <Shelf {...props} />
    case 'sofa':
      return <Sofa {...props} />
    case 'table':
      return <Table {...props} />
    case 'plant':
      return <Plant {...props} />
    case 'box':
      return <Box {...props} />
    case 'roundtable':
      return <RoundTable {...props} />
    case 'bedframe':
      return <BlackBed {...props} />
    case 'bedset':
      return <BedWithBedding {...props} />
    case 'steelshelf':
      return <SteelShelf {...props} />
    case 'pegboard':
      return <PegBoard {...props} />
    case 'mirror':
      return <ArdenMirror {...props} />
    case 'blind':
      return <WoodBlind {...props} />
    case 'fksofa':
      return <FkSofa {...props} />
    case 'meshchair':
      return <MeshOfficeChair {...props} />
    case 'diningchair':
      return <WalnutDiningChair {...props} />
    case 'motiondesk':
      return <MotionDesk {...props} />
    case 'chromecabinet':
      return <ChromeCabinet {...props} />
    case 'corerack':
      return <CoreRack {...props} />
    case 'aralia':
      return <AraliaPlant {...props} />
    case 'drawerunit':
      return <DrawerUnit {...props} />
    case 'walltv':
      return <WallTv {...props} />
    default: {
      const Prop = PROP_MODELS[props.item.model]
      return <Prop {...props} />
    }
  }
}
