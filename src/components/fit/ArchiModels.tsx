import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { lighten } from '@/lib/color'
import { legCenter } from '@/lib/desk'
import type { Item } from '@/lib/types'

// Archisketch 가구 이미지(public/archisketch)를 보고 코드로 모양을 만든 모델들.
// 기준은 Models.tsx 와 같다: 가구 가운데 바닥이 (0,0,0), 앞이 +z, 단위는 m. 벽에 걸리는 가구는 뒷면이 -z(벽 쪽)다.

const M = 1000

type Props = { item: Item }

const rounded = (w: number, h: number, r: number) => {
  const x = -w / 2
  const y = -h / 2
  const radius = Math.min(r, w / 2, h / 2)
  const shape = new THREE.Shape()
  shape.moveTo(x + radius, y)
  shape.lineTo(x + w - radius, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + radius)
  shape.lineTo(x + w, y + h - radius)
  shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  shape.lineTo(x + radius, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

// 둥근 모서리의 얇은 판(거울 면 등). 앞면이 +z 를 본다.
export function RoundedPane({ w, h, r, depth, position, children }: { w: number; h: number; r: number; depth: number; position: [number, number, number]; children: React.ReactNode }) {
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(rounded(w, h, r), { depth, bevelEnabled: false, curveSegments: 10 }), [w, h, r, depth])
  return (
    <mesh geometry={geometry} position={position}>
      {children}
    </mesh>
  )
}

// D2178B 뷰티레스트 스위트 슈퍼싱글 침대(블랙): 낮은 검은 프레임, 뒤쪽의 높은 헤드보드, 프레임 안쪽에 얹은 흰 매트리스.
export function BlackBed({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const frameH = 0.3
  const mattressH = 0.22
  const board = 0.045
  const black = '#2d2d2f'
  const mattressLength = (d - board) * 0.9
  return (
    <group>
      <RoundedBox args={[w, frameH, d]} radius={0.01} smoothness={3} position={[0, frameH / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={black} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, h / 2, -d / 2 + board / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, board]} />
        <meshStandardMaterial color={black} roughness={0.7} />
      </mesh>
      <RoundedBox args={[w * 0.88, mattressH, mattressLength]} radius={0.06} smoothness={4} position={[0, frameH + mattressH / 2 - 0.01, -d / 2 + board + 0.02 + mattressLength / 2]} castShadow receiveShadow>
        <meshStandardMaterial color="#f2f2f0" roughness={0.95} />
      </RoundedBox>
    </group>
  )
}

// 침대 + Villette Blue 침구를 하나로: 검은 프레임·헤드보드·흰 매트리스 위에 푸른 이불이 덮이고(옆과 발치로 늘어짐),
// 머리맡에 푸른 베개 둘과 뒤에 세운 회색 베개가 놓인다. 크기는 침대(프레임) 기준이고 이불은 프레임보다 조금 넓게 덮는다.
export function BedWithBedding({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const frameH = 0.3
  const mattressH = 0.22
  const board = 0.045
  const mattressTop = frameH + mattressH - 0.01
  const head = -d / 2 + board + 0.02
  const length = (d - board) * 0.9
  const foot = head + length
  const duvetW = w * 1.08
  const duvetL = length * 0.72
  const duvetH = 0.13
  const duvetZ = foot - duvetL / 2 + 0.06
  const duvetTop = mattressTop + duvetH - 0.005
  const blue = item.tint ?? '#3c4f78'
  const pillow = item.tint ? lighten(item.tint, 0.05) : '#42557e'
  const fold = item.tint ? lighten(item.tint, 0.1) : '#4b5f8c'
  const drop = duvetTop - frameH
  const layer = (position: [number, number, number], size: [number, number, number], color: string, radius: number, rotation?: [number, number, number]) => (
    <RoundedBox args={size} radius={Math.min(radius, size[0] / 2.1, size[1] / 2.1, size[2] / 2.1)} smoothness={3} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} />
    </RoundedBox>
  )
  return (
    <group>
      <BlackBed item={item} />
      {layer([0, mattressTop + duvetH / 2 - 0.005, duvetZ], [duvetW, duvetH, duvetL], blue, 0.06)}
      {[-1, 1].map((side) => <group key={side}>{layer([side * (duvetW / 2 - 0.004), duvetTop - drop / 2, duvetZ], [0.016, drop, duvetL * 0.97], blue, 0.006, [0, 0, -side * 0.07])}</group>)}
      {layer([0, duvetTop - drop / 2, foot + 0.06 - 0.006], [duvetW * 0.985, drop, 0.016], blue, 0.006, [0.07, 0, 0])}
      {layer([0, duvetTop + 0.012, duvetZ - duvetL / 2 + 0.07], [duvetW * 0.99, 0.03, 0.12], fold, 0.012)}
      {layer([0, mattressTop + 0.15, head + 0.07], [w * 0.62, 0.3, 0.1], '#4b4b4f', 0.04, [-0.1, 0, 0])}
      {[-1, 1].map((side) => <group key={side}>{layer([side * w * 0.235, mattressTop + 0.07, head + 0.34], [w * 0.4, 0.13, 0.58], pillow, 0.05, [-0.12, 0, 0])}</group>)}
    </group>
  )
}

// H1740 5단 철제선반장(2단 도어): 아래는 양쪽으로 열리는 수납장, 위는 가는 기둥에 얹은 얇은 선반 3장과 뒷판.
export function SteelShelf({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const cabinetH = Math.min(0.74, h * 0.43)
  const dark = item.tint ?? '#46474b'
  const body = dark
  const door = dark
  const rod = '#1c1c1e'
  const shelves = [h - 0.006, h * 0.794, h * 0.583]
  const postsTop = h - 0.012
  const gap = 0.004
  const doorWidth = (w - 0.012 - gap) / 2
  const rodX = w / 2 - 0.014
  const rodZ = d / 2 - 0.02
  const rodHeight = postsTop - cabinetH
  return (
    <group>
      <RoundedBox args={[w, cabinetH, d * 0.98]} radius={0.004} smoothness={2} position={[0, cabinetH / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={body} roughness={0.6} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (doorWidth / 2 + gap / 2), cabinetH / 2, d * 0.49 + 0.002]} castShadow>
          <boxGeometry args={[doorWidth, cabinetH - 0.016, 0.006]} />
          <meshStandardMaterial color={door} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, (cabinetH + h) / 2, -d / 2 + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.96, h - cabinetH, 0.006]} />
        <meshStandardMaterial color={dark} roughness={0.7} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * rodX, cabinetH + rodHeight / 2, sz * rodZ]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, rodHeight, 10]} />
            <meshStandardMaterial color={rod} metalness={0.5} roughness={0.4} />
          </mesh>
        )),
      )}
      {shelves.map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.97, 0.012, d * 0.96]} />
          <meshStandardMaterial color={dark} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// perforated board(펀칭보드): 구멍이 촘촘한 검은 판에 포켓, 선반, 오디오, 우드 액자를 건 모습. 벽에 걸린다(뒷면 = -z).
function usePegTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#1d1d1f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#9a9a9c'
    const columns = 46
    const rows = 22
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const x = (col + 0.5 + (row % 2) * 0.5) * (canvas.width / columns)
        const y = (row + 0.5) * (canvas.height / rows)
        ctx.beginPath()
        ctx.ellipse(x, y, 3, 7, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return texture
  }, [])
}

export function PegBoard({ item }: Props) {
  const w = item.w / M
  const h = item.h / M
  const d = item.d / M
  const thickness = 0.02
  const texture = usePegTexture()
  const front = -d / 2 + thickness
  // 판 위 위치(가로·세로 비율)를 월드 좌표로.
  const at = (fx: number, fy: number): [number, number] => [(fx - 0.5) * w, fy * h]
  const [pocketX, pocketY] = at(0.137, 0.295)
  const [playerX, playerY] = at(0.4, 0.46)
  const [shelfX, shelfY] = at(0.5, 0.21)
  const [frameX, frameY] = at(0.84, 0.53)
  return (
    <group>
      <mesh position={[0, h / 2, -d / 2 + thickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, thickness]} />
        <meshStandardMaterial color="#1d1d1f" roughness={0.7} />
      </mesh>
      <mesh position={[0, h / 2, front + 0.0005]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} roughness={0.7} />
      </mesh>
      <group position={[pocketX, pocketY, front]}>
        <mesh position={[0, 0, 0.03]} castShadow>
          <boxGeometry args={[w * 0.2, h * 0.5, 0.06]} />
          <meshStandardMaterial color="#202022" roughness={0.6} />
        </mesh>
        <mesh position={[0, h * 0.2, 0.04]} castShadow>
          <boxGeometry args={[w * 0.15, h * 0.34, 0.012]} />
          <meshStandardMaterial color="#f1f1ee" roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[shelfX, shelfY, front + 0.045]} castShadow>
        <boxGeometry args={[w * 0.34, 0.012, 0.09]} />
        <meshStandardMaterial color="#17171a" roughness={0.5} />
      </mesh>
      <group position={[playerX, playerY, front]}>
        <mesh position={[0, 0, 0.025]} castShadow>
          <boxGeometry args={[w * 0.127, h * 0.31, 0.05]} />
          <meshStandardMaterial color="#f4f4f2" roughness={0.45} />
        </mesh>
        <mesh position={[0, h * 0.04, 0.052]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.004, 24]} />
          <meshStandardMaterial color="#c9c9c7" roughness={0.4} />
        </mesh>
      </group>
      <mesh position={[shelfX + w * 0.12, shelfY + 0.04, front + 0.05]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.05, 18]} />
        <meshStandardMaterial color="#151517" roughness={0.5} />
      </mesh>
      <mesh position={[shelfX + w * 0.2, shelfY + 0.03, front + 0.04]} castShadow>
        <boxGeometry args={[w * 0.08, 0.06, 0.06]} />
        <meshStandardMaterial color="#d9d9d6" roughness={0.5} />
      </mesh>
      <group position={[frameX, frameY, front]}>
        <mesh position={[0, 0, 0.035]} castShadow>
          <boxGeometry args={[w * 0.21, h * 0.52, 0.07]} />
          <meshStandardMaterial color="#d9b27d" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.066]}>
          <boxGeometry args={[w * 0.18, h * 0.45, 0.01]} />
          <meshStandardMaterial color="#c9c2b6" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

// 아르덴 미러: 둥근 모서리의 검은 판에 큰 거울 면과 길쭉한 작은 거울 면 두 개. 벽에 걸린다(뒷면 = -z).
export function ArdenMirror({ item }: Props) {
  const w = item.w / M
  const h = item.h / M
  const d = item.d / M
  const mirror = <meshStandardMaterial color="#b4b5bb" metalness={0.35} roughness={0.22} />
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={Math.min(0.008, d / 2.5)} smoothness={3} position={[0, h / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={item.tint ?? '#17171a'} roughness={0.6} />
      </RoundedBox>
      <RoundedPane w={w * 0.81} h={h * 0.57} r={0.09} depth={0.004} position={[0, h * 0.62, d / 2]}>
        {mirror}
      </RoundedPane>
      <RoundedPane w={w * 0.77} h={h * 0.22} r={0.06} depth={0.004} position={[0, h * 0.18, d / 2]}>
        {mirror}
      </RoundedPane>
    </group>
  )
}

// PREMIUM 맞춤 우드 블라인드: 위쪽 헤드레일, 가는 줄, 살짝 기울어진 슬랫(아래로 갈수록 촘촘히 쌓인 모습). 창에 걸린다(뒷면 = -z).
export function WoodBlind({ item }: Props) {
  const w = item.w / M
  const h = item.h / M
  const d = item.d / M
  const railH = 0.06
  const count = Math.max(12, Math.round(h / 0.055))
  const span = h - railH - 0.03
  const z = -d / 2 + 0.05
  const cords = [0.12, 0.31, 0.5, 0.69, 0.88]
  return (
    <group>
      <mesh position={[0, h - railH / 2, -d / 2 + 0.045]} castShadow>
        <boxGeometry args={[w, railH, 0.07]} />
        <meshStandardMaterial color="#4a3f3a" roughness={0.6} />
      </mesh>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={index} position={[0, h - railH - 0.01 - (1 - (1 - index / (count - 1)) ** 1.7) * span, z]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[w * 0.985, 0.006, 0.05]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#5f524b' : '#6a5c54'} roughness={0.75} />
        </mesh>
      ))}
      {cords.map((fraction) => (
        <mesh key={fraction} position={[(fraction - 0.5) * w, h - railH - 0.01 - span / 2, z]}>
          <boxGeometry args={[0.003, span, 0.003]} />
          <meshStandardMaterial color="#8b8079" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.012, z]} castShadow>
        <boxGeometry args={[w * 0.985, 0.014, 0.04]} />
        <meshStandardMaterial color="#4a3f3a" roughness={0.6} />
      </mesh>
    </group>
  )
}

// 두 점을 잇는 가는 막대(철제 다리, 줄기 등).
export function Rod({ from, to, r, color, metal = false }: { from: [number, number, number]; to: [number, number, number]; r: number; color: string; metal?: boolean }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const direction = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[r, r, length, 10]} />
      <meshStandardMaterial color={color} metalness={metal ? 0.6 : 0.1} roughness={metal ? 0.3 : 0.7} />
    </mesh>
  )
}

export const CHROME = '#c3c5c9'

// FK6720 2인 소파(블랙): 크롬 프레임 위에 검은 가죽 좌판 2개와 등받이 2개, 양쪽 끝에 우드 팔걸이.
export function FkSofa({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const seatY = 0.4
  const seatW = (w - 0.12) / 2 - 0.004
  const backH = h - seatY - 0.02
  const leather = <meshStandardMaterial color={item.tint ?? '#1f1f21'} roughness={0.45} />
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <RoundedBox args={[seatW, 0.12, d * 0.88]} radius={0.03} smoothness={3} position={[side * (seatW / 2 + 0.002), seatY - 0.02, 0.02]} castShadow receiveShadow>
            {leather}
          </RoundedBox>
          <RoundedBox args={[seatW, backH, 0.12]} radius={0.035} smoothness={3} position={[side * (seatW / 2 + 0.002), seatY + backH / 2 + 0.03, -d / 2 + 0.1]} rotation={[-0.12, 0, 0]} castShadow receiveShadow>
            {leather}
          </RoundedBox>
        </group>
      ))}
      {[-1, 1].map((side) => {
        const x = side * (w / 2 - 0.03)
        return (
          <group key={`arm${side}`}>
            <mesh position={[x, 0.62, 0.02]} rotation={[0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.035, 0.03, d * 0.62]} />
              <meshStandardMaterial color="#a97c4e" roughness={0.6} />
            </mesh>
            {[-1, 1].map((end) => (
              <group key={end}>
                <Rod from={[x, 0, end * (d / 2 - 0.1)]} to={[x, seatY - 0.05, end * (d / 2 - 0.1)]} r={0.01} color={CHROME} metal />
                <Rod from={[x, seatY - 0.05, end * (d / 2 - 0.1)]} to={[x, 0.6, end * (d * 0.3)]} r={0.008} color={CHROME} metal />
              </group>
            ))}
          </group>
        )
      })}
      <mesh position={[0, seatY - 0.1, 0.02]} castShadow>
        <boxGeometry args={[w - 0.05, 0.02, 0.03]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// 데스커 GX_HDA 의자: 흰 5발 베이스와 바퀴, 회색 좌판, 메쉬 등받이와 헤드레스트, 양쪽 팔걸이.
export function MeshOfficeChair({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const white = '#f1f1f0'
  const grey = '#b9b9b9'
  const seatY = 0.46
  const backZ = -d / 2 + 0.07
  return (
    <group>
      {Array.from({ length: 5 }, (_, index) => {
        const angle = (index / 5) * Math.PI * 2 + Math.PI / 2
        const x = Math.cos(angle) * 0.3
        const z = Math.sin(angle) * 0.3
        return (
          <group key={index}>
            <Rod from={[0, 0.1, 0]} to={[x, 0.07, z]} r={0.017} color={white} />
            <mesh position={[x, 0.03, z]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.05, 12]} />
              <meshStandardMaterial color="#8a8a8c" roughness={0.6} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.34, 12]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>
      <RoundedBox args={[0.5, 0.09, 0.5]} radius={0.04} smoothness={3} position={[0, seatY, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#aaa8a5" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.5, 0.04]} radius={0.02} smoothness={3} position={[0, seatY + 0.34, backZ]} rotation={[-0.1, 0, 0]} castShadow>
        <meshStandardMaterial color={grey} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, seatY + 0.34, backZ - 0.015]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.5, 0.56, 0.02]} />
        <meshStandardMaterial color={white} roughness={0.5} />
      </mesh>
      <RoundedBox args={[0.3, 0.13, 0.05]} radius={0.025} smoothness={3} position={[0, h - 0.07, backZ - 0.05]} rotation={[-0.1, 0, 0]} castShadow>
        <meshStandardMaterial color={grey} roughness={0.9} />
      </RoundedBox>
      <Rod from={[0, seatY + 0.55, backZ - 0.03]} to={[0, h - 0.12, backZ - 0.05]} r={0.008} color={white} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Rod from={[side * 0.26, seatY + 0.02, backZ + 0.05]} to={[side * 0.28, seatY + 0.2, backZ + 0.08]} r={0.012} color={white} />
          <RoundedBox args={[0.07, 0.035, 0.26]} radius={0.015} smoothness={2} position={[side * (w / 2 - 0.04), seatY + 0.22, 0.04]} castShadow>
            <meshStandardMaterial color={grey} roughness={0.8} />
          </RoundedBox>
          <Rod from={[side * 0.28, seatY + 0.2, backZ + 0.08]} to={[side * (w / 2 - 0.04), seatY + 0.21, 0.04]} r={0.01} color={white} />
        </group>
      ))}
    </group>
  )
}

// Archisketch Dining Chair6: 월넛 원형 좌판과 반달 등판, 가는 검은 철제 다리(바깥쪽으로 벌어짐)와 등판 지지대 2개.
export function WalnutDiningChair({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const seatY = 0.45
  const wood = item.tint ?? '#8a5a35'
  const black = '#161616'
  const backZ = -d / 2 + 0.03
  const legSpread = 0.04
  return (
    <group>
      <mesh position={[0, seatY, 0.01]} castShadow receiveShadow>
        <cylinderGeometry args={[Math.min(w, d) / 2 - 0.01, Math.min(w, d) / 2 - 0.01, 0.025, 40]} />
        <meshStandardMaterial color={wood} roughness={0.55} />
      </mesh>
      <RoundedPane w={w - 0.02} h={0.15} r={0.075} depth={0.014} position={[0, h - 0.085, backZ - 0.007]}>
        <meshStandardMaterial color={wood} roughness={0.55} />
      </RoundedPane>
      {[-1, 1].map((side) => (
        <Rod key={`post${side}`} from={[side * 0.1, seatY, backZ]} to={[side * 0.1, h - 0.16, backZ]} r={0.006} color={black} />
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Rod key={`${sx}${sz}`} from={[sx * (w / 2 - 0.07 + legSpread), 0, sz * (d / 2 - 0.06 + legSpread)]} to={[sx * (w / 2 - 0.09), seatY - 0.012, sz * (d / 2 - 0.1)]} r={0.007} color={black} />
        )),
      )}
    </group>
  )
}

// W1600×D800 모션데스크: 어두운 상판에 밝은 합판 단면, 앞뒤로 긴 T자 발이 달린 두 개의 기둥 다리.
export function MotionDesk({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const top = 0.03
  const black = '#1b1b1c'
  // 다리 간격·상판 아래 높이를 입력한 책상(내 공간 확인 팝업)은 그 값을 따르고, 없으면 기본 다리 자리를 쓴다.
  const legX = item.legGap !== undefined ? legCenter(item) / M : w / 2 - 0.12
  const underside = item.underClearance !== undefined ? item.underClearance / M : undefined
  const apron = underside !== undefined ? h - top - underside : 0
  return (
    <group>
      {apron > 0.004 && underside !== undefined && (
        <mesh position={[0, underside + apron / 2, 0]} castShadow>
          <boxGeometry args={[legX * 2 - 0.07, apron, d * 0.9]} />
          <meshStandardMaterial color="#cdb897" roughness={0.7} />
        </mesh>
      )}
      <mesh position={[0, h - top / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, top, d]} />
        <meshStandardMaterial color="#cdb897" roughness={0.7} />
      </mesh>
      <mesh position={[0, h - 0.008, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.004, 0.018, d - 0.004]} />
        <meshStandardMaterial color="#3a3b3a" roughness={0.8} />
      </mesh>
      {[-1, 1].map((side) => {
        const x = side * legX
        return (
          <group key={side}>
            <mesh position={[x, 0.025, 0]} castShadow>
              <boxGeometry args={[0.07, 0.05, d * 0.85]} />
              <meshStandardMaterial color={black} roughness={0.6} />
            </mesh>
            <mesh position={[x, (h - top) / 2, 0]} castShadow>
              <boxGeometry args={[0.07, h - top, 0.07]} />
              <meshStandardMaterial color={black} roughness={0.6} />
            </mesh>
            <mesh position={[x, h - top - 0.025, 0]} castShadow>
              <boxGeometry args={[0.06, 0.05, d * 0.6]} />
              <meshStandardMaterial color={black} roughness={0.6} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// SIMPLIE 수납장 BC264(블랙): 크롬 모서리 프레임, 위쪽에 앞으로 열리는 검은 도어 박스, 아래에 유리 같은 검은 선반.
export function ChromeCabinet({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const r = 0.008
  const x = w / 2 - r
  const z = d / 2 - r
  const boxBottom = h * 0.45
  const dark = item.tint ?? '#2a2a2c'
  return (
    <group>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => <Rod key={`${sx}${sz}`} from={[sx * x, 0.012, sz * z]} to={[sx * x, h, sz * z]} r={r} color={CHROME} metal />),
      )}
      {[boxBottom, h - 0.01].flatMap((y) =>
        [-1, 1].flatMap((s) => [
          <Rod key={`fx${y}${s}`} from={[-x, y, s * z]} to={[x, y, s * z]} r={r * 0.8} color={CHROME} metal />,
          <Rod key={`fz${y}${s}`} from={[s * x, y, -z]} to={[s * x, y, z]} r={r * 0.8} color={CHROME} metal />,
        ]),
      )}
      <mesh position={[0, h - 0.012, 0]} castShadow>
        <boxGeometry args={[w - 0.02, 0.01, d - 0.02]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
      <mesh position={[0, (boxBottom + h) / 2, -z + 0.004]}>
        <boxGeometry args={[w - 0.02, h - boxBottom - 0.02, 0.008]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (x - 0.004), (boxBottom + h) / 2, 0]}>
          <boxGeometry args={[0.008, h - boxBottom - 0.02, d - 0.03]} />
          <meshStandardMaterial color={dark} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, (boxBottom + h) / 2 - 0.005, z + 0.002]} castShadow>
        <boxGeometry args={[w - 0.025, h - boxBottom - 0.04, 0.012]} />
        <meshStandardMaterial color={item.tint ?? '#2e2e30'} roughness={0.45} />
      </mesh>
      <mesh position={[0, h - 0.17, z + 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.004, 20]} />
        <meshStandardMaterial color={CHROME} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.02, 0.01, d - 0.02]} />
        <meshStandardMaterial color="#17171a" roughness={0.2} metalness={0.2} />
      </mesh>
    </group>
  )
}

// 코어렉(CORE RACK): 어두운 선반 3장을 크롬 기둥이 받치는 낮은 랙. 기둥은 위로 갈수록 뒤로 기울고 뒤쪽 가운데에 기둥이 하나 더 있다.
export function CoreRack({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const lean = d * 0.3
  const levels = [0.08, h * 0.5, h - 0.018]
  const x = w / 2 - 0.05
  return (
    <group>
      {levels.map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[w - 0.02, 0.022, d * 0.9]} />
          <meshStandardMaterial color="#3f4043" roughness={0.6} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <Rod key={side} from={[side * x, 0, d / 2 - 0.02]} to={[side * x, h, d / 2 - 0.02 - lean]} r={0.011} color={CHROME} metal />
      ))}
      <Rod from={[0, 0, -d / 2 + 0.05]} to={[0, h, -d / 2 + 0.05]} r={0.011} color={CHROME} metal />
    </group>
  )
}

// Aralia Large: 흰 원통 화분에서 가는 줄기 여러 개가 위로 뻗고, 줄기마다 어두운 잎 다발이 달린 큰 화분 식물.
export function AraliaPlant({ item }: Props) {
  const h = item.h / M
  const potR = Math.min(item.w, item.d) / M * 0.27
  const potH = 0.4
  const stems = useMemo(() => {
    const list: { to: [number, number, number]; tufts: [number, number, number][] }[] = []
    for (let index = 0; index < 7; index += 1) {
      const angle = index * 2.4
      const lean = 0.03 + (index % 3) * 0.045
      const top = h * (0.62 + ((index * 37) % 10) / 28)
      const to: [number, number, number] = [Math.cos(angle) * lean * top * 1.5, top, Math.sin(angle) * lean * top * 1.5]
      const tufts = Array.from({ length: 9 }, (_, n): [number, number, number] => {
        const t = 0.3 + n * 0.08
        return [to[0] * t + Math.cos(angle + n) * 0.06, potH + (to[1] - potH) * t, to[2] * t + Math.sin(angle + n) * 0.06]
      })
      list.push({ to, tufts })
    }
    return list
  }, [h])
  return (
    <group>
      <mesh position={[0, potH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[potR, potR * 0.96, potH, 28]} />
        <meshStandardMaterial color="#d9d9d7" roughness={0.9} />
      </mesh>
      <mesh position={[0, potH - 0.01, 0]}>
        <cylinderGeometry args={[potR * 0.92, potR * 0.92, 0.01, 28]} />
        <meshStandardMaterial color="#2a2623" roughness={1} />
      </mesh>
      {stems.map((stem, index) => (
        <group key={index}>
          <Rod from={[0, potH, 0]} to={stem.to} r={0.005} color="#3a3d38" />
          {stem.tufts.map((tuft, n) =>
            Array.from({ length: 5 }, (_, k) => {
              const angle = n * 1.1 + (k / 5) * Math.PI * 2
              const reach = 0.13 - n * 0.006
              return <Rod key={`${n}${k}`} from={tuft} to={[tuft[0] + Math.cos(angle) * reach, tuft[1] - 0.045, tuft[2] + Math.sin(angle) * reach]} r={0.0028} color="#26302a" />
            }),
          )}
        </group>
      ))}
    </group>
  )
}

// W400 3단 서랍(바퀴 달림): 어두운 본체 앞에 서랍 3개(윗칸이 가장 높고 열쇠 구멍 있음), 합판 색 단면, 아래 바퀴 4개.
export function DrawerUnit({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const foot = 0.05
  const bodyH = h - foot
  const dark = item.tint ? lighten(item.tint, 0.05) : '#3a3a3c'
  const fronts = [
    { y: foot + bodyH * 0.8, height: bodyH * 0.32 },
    { y: foot + bodyH * 0.47, height: bodyH * 0.3 },
    { y: foot + bodyH * 0.17, height: bodyH * 0.26 },
  ]
  return (
    <group>
      <mesh position={[0, foot + bodyH / 2, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[w, bodyH, d - 0.02]} />
        <meshStandardMaterial color={item.tint ?? '#2c2c2e'} roughness={0.65} />
      </mesh>
      {fronts.map((front, index) => (
        <group key={index}>
          <mesh position={[0, front.y, d / 2 - 0.01]} castShadow>
            <boxGeometry args={[w - 0.05, front.height, 0.016]} />
            <meshStandardMaterial color="#c9a77c" roughness={0.7} />
          </mesh>
          <mesh position={[0, front.y, d / 2 - 0.001]}>
            <boxGeometry args={[w - 0.058, front.height - 0.008, 0.012]} />
            <meshStandardMaterial color={dark} roughness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[w * 0.28, fronts[0].y + 0.02, d / 2 + 0.006]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.004, 16]} />
        <meshStandardMaterial color={CHROME} metalness={0.7} roughness={0.3} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.035), 0.025, sz * (d / 2 - 0.05)]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 14]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        )),
      )}
    </group>
  )
}

// 삼성 QLED 벽걸이 TV: 얇은 검은 판에 짙은 화면과 아래쪽 작은 로고. 벽에 걸린다(뒷면 = -z).
export function WallTv({ item }: Props) {
  const w = item.w / M
  const h = item.h / M
  const d = item.d / M
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#0f0f10" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, h / 2, d / 2 + 0.0005]}>
        <planeGeometry args={[w - 0.012, h - 0.012]} />
        <meshStandardMaterial color="#060808" roughness={0.12} metalness={0.5} />
      </mesh>
    </group>
  )
}
