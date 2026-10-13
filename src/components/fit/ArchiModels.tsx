import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
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
function RoundedPane({ w, h, r, depth, position, children }: { w: number; h: number; r: number; depth: number; position: [number, number, number]; children: React.ReactNode }) {
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

// H1740 5단 철제선반장(2단 도어): 아래는 양쪽으로 열리는 수납장, 위는 가는 기둥에 얹은 얇은 선반 3장과 뒷판.
export function SteelShelf({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const cabinetH = Math.min(0.74, h * 0.43)
  const body = '#5b5c60'
  const door = '#56575b'
  const dark = '#46474b'
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
        <meshStandardMaterial color="#17171a" roughness={0.6} />
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
