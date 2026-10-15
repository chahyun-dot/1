import { useMemo, type ComponentType } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { CHROME, Rod } from '@/components/fit/ArchiModels'
import { lighten } from '@/lib/color'
import type { Item, PropModel } from '@/lib/types'

// 작은 가구·소품·벽 가구 모델들. 기준은 Models.tsx 와 같다: 가구 가운데 바닥이 (0,0,0), 앞이 +z, 단위 m.
// 벽에 걸리는 것(액자, 선반, 조명, 창문)은 뒷면이 -z(벽 쪽)다. 이미지로만 만들어서 뒷모습·세부는 추정이다.

const M = 1000

type Props = { item: Item }
type Vec3 = [number, number, number]

const std = (color: string, roughness = 0.6, metalness = 0) => <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />

const glass = (color: string, opacity = 0.35) => <meshStandardMaterial color={color} roughness={0.1} metalness={0.1} transparent opacity={opacity} />

function Slab({ size, position, color, rotation, radius = 0, roughness = 0.6, metalness = 0 }: { size: Vec3; position: Vec3; color: string; rotation?: Vec3; radius?: number; roughness?: number; metalness?: number }) {
  if (radius > 0) {
    return (
      <RoundedBox args={size} radius={Math.min(radius, size[0] / 2.1, size[1] / 2.1, size[2] / 2.1)} smoothness={3} position={position} rotation={rotation} castShadow receiveShadow>
        {std(color, roughness, metalness)}
      </RoundedBox>
    )
  }
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      {std(color, roughness, metalness)}
    </mesh>
  )
}

// 회전체(병, 꽃병, 잔). profile 은 [반지름, 높이] 점들을 아래에서 위로.
function Lathe({ profile, color, roughness = 0.4, metalness = 0, opacity = 1, emissive, position }: { profile: [number, number][]; color: string; roughness?: number; metalness?: number; opacity?: number; emissive?: string; position?: Vec3 }) {
  const key = JSON.stringify(profile)
  const geometry = useMemo(() => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 36), [key])
  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} transparent={opacity < 1} opacity={opacity} emissive={emissive} emissiveIntensity={emissive ? 0.35 : 0} side={THREE.DoubleSide} />
    </mesh>
  )
}

function useDrawn(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    draw(canvas.getContext('2d')!, width, height)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return texture
  }, [])
}

// 옆면 윤곽(z, y)을 x 방향으로 밀어낸 판. 잡지꽂이 옆판 등에 쓴다.
function SidePlate({ profile, thickness, x, color }: { profile: [number, number][]; thickness: number; x: number; color: string }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(profile.map(([z, y]) => new THREE.Vector2(z, y)))
    const extruded = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false })
    extruded.rotateY(-Math.PI / 2)
    return extruded
  }, [profile, thickness])
  return (
    <mesh geometry={geometry} position={[x + thickness / 2, 0, 0]} castShadow receiveShadow>
      {std(color, 0.5)}
    </mesh>
  )
}

// 선반 앞뒤 철사 틀을 가진 월넛 벽선반: 스트링 포켓.
function StringPocket({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const wire = item.tint2 ?? '#1b1b1d'
  const levels = [0.1, 0.5, 0.9].map((fraction) => fraction * h)
  return (
    <group>
      {levels.map((y) => (
        <Slab key={y} size={[w - 0.04, 0.018, d]} position={[0, y, 0]} color={item.tint ?? '#7a4a2a'} roughness={0.55} />
      ))}
      {[-1, 1].map((side) => {
        const x = side * (w / 2 - 0.012)
        return (
          <group key={side}>
            <Rod from={[x, 0, -d / 2 + 0.008]} to={[x, h, -d / 2 + 0.008]} r={0.0035} color={wire} />
            {levels.map((y) => (
              <Rod key={y} from={[x, y - 0.012, -d / 2 + 0.008]} to={[x, y - 0.012, d / 2 - 0.01]} r={0.0035} color={wire} />
            ))}
            <Rod from={[x, h, -d / 2 + 0.008]} to={[x, h, d / 2 - 0.01]} r={0.0035} color={wire} />
          </group>
        )
      })}
    </group>
  )
}

// Villette Blue Bedding Set: 푸른 이불과 베개 두 개.
function BeddingSet({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const duvetH = Math.min(0.24, item.h / M * 0.3)
  return (
    <group>
      <Slab size={[w, duvetH, d * 0.78]} position={[0, duvetH / 2, d * 0.11]} color="#3c4f78" radius={0.07} roughness={0.95} />
      {[-1, 1].map((side) => (
        <Slab key={side} size={[w * 0.34, 0.12, 0.38]} position={[side * w * 0.24, duvetH + 0.04, -d / 2 + 0.24]} color="#42557e" radius={0.05} roughness={0.95} rotation={[-0.1, 0, 0]} />
      ))}
    </group>
  )
}

// 벽에 거는 그림. 액자(검은 틀 + 흰 매트 + 흑백 사진)와 포스터를 같은 방식으로 만든다.
function PictureFrame({ item }: Props) {
  const w = item.w / M
  const h = item.h / M
  const d = item.d / M
  const photo = useDrawn(256, 160, (ctx, cw, ch) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ch)
    gradient.addColorStop(0, '#9b9b9b')
    gradient.addColorStop(1, '#5d5d5d')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#d0d0d0'
    ctx.fillRect(30, 60, 120, 40)
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(160, 40, 60, 70)
  })
  return (
    <group>
      <Slab size={[w, h, d]} position={[0, h / 2, 0]} color="#2c2c2e" radius={0.004} />
      <mesh position={[0, h / 2, d / 2 + 0.0004]}>
        <planeGeometry args={[w - 0.05, h - 0.05]} />
        {std('#f3f3f1', 0.9)}
      </mesh>
      <mesh position={[0, h / 2, d / 2 + 0.0009]}>
        <planeGeometry args={[(w - 0.05) * 0.58, (h - 0.05) * 0.4]} />
        <meshStandardMaterial map={photo} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Poster({ item }: Props) {
  const w = item.w / M
  const h = item.h / M
  const d = item.d / M
  const art = useMemo(() => {
    // public/wassily-chair-poster.png(708×911)를 비율을 지켜 꽉 채운다. 남는 좌우는 잘라낸다.
    const texture = new THREE.TextureLoader().load('/wassily-chair-poster.png')
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    const crop = (w - 0.014) / (h - 0.014) / (708 / 911)
    texture.repeat.set(Math.min(1, crop), Math.min(1, 1 / crop))
    texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2)
    return texture
  }, [w, h])
  return (
    <group>
      <Slab size={[w, h, d]} position={[0, h / 2, 0]} color="#1f1f21" />
      <mesh position={[0, h / 2, d / 2 + 0.0005]}>
        <planeGeometry args={[w - 0.014, h - 0.014]} />
        <meshStandardMaterial map={art} roughness={0.7} />
      </mesh>
    </group>
  )
}

// UFO KID LAMP: 벽에 붙는 검은 원반 받침, 가운데가 오목하게 들어간 낮은 돔, 앞으로 나온 놋쇠 소켓(홈 세 줄)과 은색 구 전구.
function KidLamp({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const r = Math.min(w, h) / 2
  const dome = useMemo(() => {
    const profile = [[r, 0], [r * 0.995, 0.012], [r * 0.93, 0.026], [r * 0.75, 0.04], [r * 0.5, 0.047], [r * 0.3, 0.042], [r * 0.16, 0.034], [0.03, 0.03]].map(([rr, y]) => new THREE.Vector2(rr, y))
    return new THREE.LatheGeometry(profile, 48)
  }, [r])
  const front = -d / 2 + 0.032 // 돔 가운데 오목한 자리
  return (
    <group position={[0, h / 2, 0]}>
      <group position={[0, 0, -d / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={dome} castShadow receiveShadow>
          <meshStandardMaterial color="#202023" roughness={0.28} metalness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh position={[0, 0, front + 0.012]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.026, 0.026, 24]} />
        {std('#1b1b1e', 0.4, 0.5)}
      </mesh>
      {[0.03, 0.044, 0.058].map((z, index) => (
        <mesh key={z} position={[0, 0, front + z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.02 - index * 0.001, 0.02 - index * 0.001, 0.009, 24]} />
          {std('#c2b27a', 0.35, 0.8)}
        </mesh>
      ))}
      <mesh position={[0, 0, front + 0.103]} castShadow>
        <sphereGeometry args={[0.042, 28, 20]} />
        {std('#c9cfd3', 0.18, 0.75)}
      </mesh>
      <mesh position={[0, 0, front + 0.114]}>
        <sphereGeometry args={[0.011, 12, 10]} />
        <meshStandardMaterial color="#fff2c4" emissive="#fff2c4" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// [Sample] Pro 13-inch: 얇은 은회색 본체에 뒤쪽 경첩에서 살짝 젖혀 열린 화면.
function Laptop({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const tilt = 0.2
  const base = 0.016
  const length = (h - base) / Math.cos(tilt)
  const screen = useDrawn(256, 160, (ctx, cw, ch) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ch)
    gradient.addColorStop(0, '#4f6fa5')
    gradient.addColorStop(0.6, '#d49a6a')
    gradient.addColorStop(1, '#3b3f4a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, cw, ch)
  })
  return (
    <group>
      <Slab size={[w, base, d]} position={[0, base / 2, 0]} color="#6d6e72" radius={0.004} metalness={0.5} roughness={0.35} />
      <mesh position={[0, base + 0.0006, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.86, d * 0.5]} />
        {std('#1c1c1e', 0.7)}
      </mesh>
      <group position={[0, base, -d / 2 + 0.004]} rotation={[-tilt, 0, 0]}>
        <Slab size={[w, length, 0.008]} position={[0, length / 2, 0]} color="#222224" radius={0.003} />
        <mesh position={[0, length / 2, 0.0045]}>
          <planeGeometry args={[w - 0.02, length - 0.02]} />
          <meshStandardMaterial map={screen} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

// Geneva Model L: 흰 원형 받침과 가는 기둥 끝에 검은 스피커 상자.
function GenevaSpeaker({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const boxH = 0.27
  return (
    <group>
      <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.016, 32]} />
        {std('#e9e9e8', 0.4)}
      </mesh>
      <Rod from={[0, 0.016, 0]} to={[0, h - boxH, 0]} r={0.008} color="#ececeb" />
      <Slab size={[w, boxH, d]} position={[0, h - boxH / 2, 0]} color="#1d1d1f" radius={0.012} />
      <mesh position={[0, h - boxH / 2, d / 2 + 0.001]}>
        <circleGeometry args={[0.075, 28]} />
        {std('#2f2f32', 0.8)}
      </mesh>
    </group>
  )
}

// Chronotime 탁상시계: 검은 원통 몸통을 뒤로 눕히고 숫자판을 붙인 시계.
function TableClock({ item }: Props) {
  const d = item.d / M
  const h = item.h / M
  const radius = h / 2 - 0.004
  const face = useDrawn(256, 256, (ctx, cw, ch) => {
    ctx.fillStyle = '#e8e8e8'
    ctx.beginPath()
    ctx.arc(cw / 2, ch / 2, cw / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1d1d1d'
    ctx.font = 'bold 56px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('12', cw / 2, 40)
    ctx.fillText('6', cw / 2, ch - 40)
    ctx.fillText('3', cw - 36, ch / 2)
    ctx.fillText('9', 36, ch / 2)
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(cw / 2, ch / 2)
    ctx.lineTo(cw / 2 + 50, ch / 2 - 55)
    ctx.moveTo(cw / 2, ch / 2)
    ctx.lineTo(cw / 2 - 70, ch / 2 - 30)
    ctx.stroke()
  })
  return (
    <group position={[0, radius + 0.004, 0]} rotation={[-0.25, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, d * 0.8, 36]} />
        {std('#1d1d1f', 0.4, 0.2)}
      </mesh>
      <mesh position={[0, 0, d * 0.4 + 0.001]}>
        <circleGeometry args={[radius * 0.9, 36]} />
        <meshStandardMaterial map={face} roughness={0.5} />
      </mesh>
    </group>
  )
}

// chardonnay wine: 짙은 녹색 병, 흰 라벨, 검은 캡.
function WineBottle({ item }: Props) {
  const r = item.w / M / 2
  const h = item.h / M
  const profile: [number, number][] = [[0, 0], [r, 0.002], [r, h * 0.55], [r * 0.7, h * 0.7], [r * 0.34, h * 0.78], [r * 0.34, h * 0.96], [r * 0.38, h * 0.97], [r * 0.38, h], [0, h]]
  return (
    <group>
      <Lathe profile={profile} color="#1f2a20" roughness={0.2} metalness={0.2} />
      <mesh position={[0, h * 0.3, 0]}>
        <cylinderGeometry args={[r + 0.0008, r + 0.0008, h * 0.28, 28]} />
        {std('#d9d6cb', 0.7)}
      </mesh>
      <mesh position={[0, h * 0.9, 0]}>
        <cylinderGeometry args={[r * 0.4, r * 0.4, h * 0.2, 20]} />
        {std('#2a1d17', 0.6)}
      </mesh>
    </group>
  )
}

function WineGlass({ position, h, r }: { position: Vec3; h: number; r: number }) {
  const bowlH = h * 0.5
  const stemH = h - bowlH
  const profile: [number, number][] = [[0.004, 0], [r * 0.5, bowlH * 0.08], [r, bowlH * 0.4], [r * 0.95, bowlH * 0.75], [r * 0.8, bowlH]]
  return (
    <group position={position}>
      <mesh position={[0, 0.002, 0]}>
        <cylinderGeometry args={[r * 0.8, r * 0.8, 0.004, 28]} />
        {glass('#cfd6dd', 0.5)}
      </mesh>
      <Rod from={[0, 0, 0]} to={[0, stemH, 0]} r={0.0035} color="#d6dce2" />
      <Lathe profile={profile} color="#d6dce2" opacity={0.35} position={[0, stemH, 0]} />
      <mesh position={[0, stemH + bowlH * 0.25, 0]}>
        <sphereGeometry args={[r * 0.85, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        {std('#5a1f2a', 0.2)}
      </mesh>
    </group>
  )
}

// 2 wine glasses: 레드 와인이 조금 담긴 와인잔 두 개.
function WineGlasses({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <WineGlass position={[-w / 2 + 0.05, 0, d / 2 - 0.05]} h={h} r={0.05} />
      <WineGlass position={[w / 2 - 0.05, 0, -d / 2 + 0.05]} h={h} r={0.05} />
    </group>
  )
}

// 가방형 LP턴테이블: 검은 가방 본체에 은색 턴테이블, 뒤로 세운 뚜껑(안쪽 흰색).
function Turntable({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const baseH = 0.1
  const lid = (h - baseH) / Math.cos(0.17)
  return (
    <group>
      <Slab size={[w, baseH, d]} position={[0, baseH / 2, 0]} color="#1e1e20" radius={0.01} />
      <mesh position={[0, baseH + 0.001, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.94, d * 0.9]} />
        {std('#2a2a2d', 0.6)}
      </mesh>
      <mesh position={[-w * 0.05, baseH + 0.004, 0.04]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.006, 40]} />
        {std('#b9bbbf', 0.3, 0.6)}
      </mesh>
      <Rod from={[w * 0.28, baseH + 0.01, -d * 0.2]} to={[w * 0.05, baseH + 0.01, d * 0.15]} r={0.004} color="#8d8d90" metal />
      <group position={[0, baseH, -d / 2 + 0.01]} rotation={[-0.17, 0, 0]}>
        <Slab size={[w, lid, 0.03]} position={[0, lid / 2, 0]} color="#1e1e20" radius={0.008} />
        <mesh position={[0, lid / 2, 0.0165]}>
          <planeGeometry args={[w - 0.03, lid - 0.03]} />
          {std('#f1f1ef', 0.8)}
        </mesh>
      </group>
    </group>
  )
}

// LP_3: 알록달록한 LP 재킷을 세워 꽂아 둔 묶음.
function RecordStack({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const colors = ['#f1f1ef', '#26282e', '#4a5f84', '#d8d4c8', '#8f9ba8', '#1d1d1f']
  const count = 18
  const t = w / count
  return (
    <group>
      {Array.from({ length: count }, (_, index) => (
        <Slab key={index} size={[t * 0.92, h, d]} position={[-w / 2 + t * (index + 0.5), h / 2, 0]} color={colors[(index * 5) % colors.length]} roughness={0.8} />
      ))}
    </group>
  )
}

// Checkerboard tissue case: 체크무늬 상자 위로 휴지가 삐져나온 모습.
function TissueCase({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const boxH = h * 0.62
  const check = useDrawn(128, 64, (ctx, cw, ch) => {
    const n = 8
    for (let row = 0; row < n / 2; row += 1) {
      for (let col = 0; col < n; col += 1) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#1d1d1f' : '#f1f1ef'
        ctx.fillRect((col * cw) / n, (row * ch) / (n / 2), cw / n, ch / (n / 2))
      }
    }
  })
  return (
    <group>
      <RoundedBox args={[w, boxH, d]} radius={0.02} smoothness={3} position={[0, boxH / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={check} roughness={0.8} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <Slab key={side} size={[w * 0.32, h - boxH + 0.02, 0.004]} position={[side * w * 0.1, boxH + (h - boxH) / 2 - 0.005, side * 0.01]} color="#fbfbfa" rotation={[side * 0.15, side * 0.2, -side * 0.12]} roughness={0.95} />
      ))}
    </group>
  )
}

// DSTL Diffuser + Sticks: 검은 유리병에 검은 스틱 세 개.
function Diffuser({ item }: Props) {
  const h = item.h / M
  const r = Math.min(item.w, item.d) / M / 2
  const bodyH = 0.065
  return (
    <group>
      <mesh position={[0, bodyH / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, bodyH, 28]} />
        {std('#1b1b1d', 0.25, 0.3)}
      </mesh>
      <mesh position={[0, bodyH + 0.004, 0]}>
        <cylinderGeometry args={[r * 0.55, r * 0.55, 0.008, 20]} />
        {std('#3b3b3d', 0.5, 0.5)}
      </mesh>
      {[-0.012, 0, 0.014].map((lean, index) => (
        <Rod key={index} from={[0, bodyH, 0]} to={[lean * 2.5, h, (index - 1) * 0.015]} r={0.0025} color="#151515" />
      ))}
    </group>
  )
}

const BOOK_COLORS = ['#f2f2f0', '#d8d8d6', '#2a2d3a', '#8a8f9a', '#e9e5d8', '#3c4a6b', '#bdb7aa', '#1f1f21']

// 책 여러 권(Books 10 Set, Book 2 set, Book 12set): 서로 다른 두께·높이로 세워 꽂은 책 줄.
function BookRow({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const books = useMemo(() => {
    const list: { x: number; t: number; height: number; color: string }[] = []
    let x = -w / 2
    let n = 0
    while (x < w / 2 - 0.016) {
      const t = Math.min(0.02 + ((n * 7) % 5) * 0.006, w / 2 - x)
      list.push({ x: x + t / 2, t, height: h * (0.82 + ((n * 3) % 5) * 0.045), color: BOOK_COLORS[(n * 3) % BOOK_COLORS.length] })
      x += t + 0.001
      n += 1
    }
    return list
  }, [w, h])
  return (
    <group>
      {books.map((book, index) => (
        <Slab key={index} size={[book.t, book.height, d * 0.9]} position={[book.x, book.height / 2, 0]} color={book.color} roughness={0.8} />
      ))}
    </group>
  )
}

// Oval round tray: 은빛 타원 쟁반에 향수병 둘, 아래에 구슬 발.
function OvalTray({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <mesh position={[0, 0.034, 0]} scale={[w / 2, 1, d / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 0.012, 40]} />
        {std('#cdd1d4', 0.15, 0.6)}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * w * 0.36, 0.02, 0]} castShadow>
          <sphereGeometry args={[0.02, 16, 12]} />
          {std('#c3c5c9', 0.15, 0.8)}
        </mesh>
      ))}
      <mesh position={[-w * 0.17, 0.04 + 0.04, 0]} castShadow>
        <boxGeometry args={[0.055, 0.08, 0.04]} />
        {glass('#e4ebe9', 0.6)}
      </mesh>
      <mesh position={[-w * 0.17, 0.04 + 0.095, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.03, 16]} />
        {std('#b9bbbf', 0.3, 0.7)}
      </mesh>
      <mesh position={[w * 0.17, 0.04 + 0.05, 0]} castShadow>
        <boxGeometry args={[0.05, h - 0.12, 0.035]} />
        {glass('#cfd6da', 0.6)}
      </mesh>
      <mesh position={[w * 0.17, h - 0.04, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.04, 16]} />
        {std('#1d1d1f', 0.4)}
      </mesh>
    </group>
  )
}

// Eames House Bird: 짙은 회색의 새. 머리가 왼쪽(-x), 기울어진 몸통, 작은 부리, 오른쪽 아래로 뻗는 납작한 꼬리, 가는 막대 다리 두 개.
function EamesBird({ item }: Props) {
  const h = item.h / M
  const dark = '#3a3a3d'
  const bodyY = h * 0.45
  return (
    <group>
      <mesh position={[0, bodyY, 0]} rotation={[0, 0, 0.5]} scale={[0.052, 0.095, 0.032]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        {std(dark, 0.85)}
      </mesh>
      <mesh position={[-0.052, bodyY + 0.09, 0]} castShadow>
        <sphereGeometry args={[0.027, 20, 16]} />
        {std(dark, 0.85)}
      </mesh>
      <mesh position={[-0.084, bodyY + 0.086, 0]} rotation={[0, 0, Math.PI / 2 + 0.2]}>
        <coneGeometry args={[0.008, 0.032, 12]} />
        {std(dark, 0.85)}
      </mesh>
      <mesh position={[0.09, bodyY - 0.09, 0]} rotation={[0, 0, -1.9]} scale={[1, 1, 0.45]} castShadow>
        <coneGeometry args={[0.03, 0.12, 14]} />
        {std(dark, 0.85)}
      </mesh>
      {[0, 1].map((index) => (
        <Rod key={index} from={[-0.006 + index * 0.02, bodyY - 0.05, (index - 0.5) * 0.026]} to={[-0.02 + index * 0.05, 0, (index - 0.5) * 0.026]} r={0.003} color="#222" />
      ))}
    </group>
  )
}

// (벽고정)W800 철제행거: 검은 판과 가는 기둥, 위쪽 옷걸이 봉, 아래 합판 선반 두 단.
function WallHanger({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <Slab size={[w - 0.04, h - 0.1, 0.01]} position={[0, h / 2 + 0.02, -d / 2 + 0.01]} color={item.tint ?? '#2a2a2c'} />
      {[-1, 1].map((side) => (
        <Rod key={side} from={[side * (w / 2 - 0.012), 0, -d / 2 + 0.02]} to={[side * (w / 2 - 0.012), h, -d / 2 + 0.02]} r={0.01} color={item.tint ?? '#232325'} />
      ))}
      <Rod from={[-w / 2 + 0.012, h - 0.04, 0]} to={[w / 2 - 0.012, h - 0.04, 0]} r={0.008} color={item.tint ?? CHROME} metal />
      <Rod from={[-w / 2 + 0.012, h - 0.04, -d / 2 + 0.02]} to={[-w / 2 + 0.012, h - 0.04, 0]} r={0.008} color={item.tint ?? CHROME} metal />
      <Rod from={[w / 2 - 0.012, h - 0.04, -d / 2 + 0.02]} to={[w / 2 - 0.012, h - 0.04, 0]} r={0.008} color={item.tint ?? CHROME} metal />
      {[0.03, 0.34].map((y) => (
        <Slab key={y} size={[w - 0.02, 0.022, d]} position={[0, y, 0]} color={item.tint ?? '#cdb590'} roughness={0.7} />
      ))}
    </group>
  )
}

// Dress Shirt: 옷걸이에 걸린 회색 셔츠. 어깨가 깊이(z) 방향으로 놓인 납작한 실루엣에 흰 칼라를 붙였다.
function Shirt({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const hanger = 0.1
  const H = h - hanger
  const profile = useMemo<[number, number][]>(
    () => [
      [-0.1 * d, H * 0.95],
      [-0.5 * d, H * 0.88],
      [-0.52 * d, H * 0.5],
      [-0.4 * d, H * 0.48],
      [-0.28 * d, H * 0.68],
      [-0.28 * d, 0],
      [0.28 * d, 0],
      [0.28 * d, H * 0.68],
      [0.4 * d, H * 0.48],
      [0.52 * d, H * 0.5],
      [0.5 * d, H * 0.88],
      [0.1 * d, H * 0.95],
      [0, H * 0.89],
    ],
    [d, H],
  )
  const thickness = Math.min(0.04, w * 0.4)
  return (
    <group>
      <SidePlate profile={profile} thickness={thickness} x={-thickness / 2} color="#8d9096" />
      <Slab size={[thickness * 1.1, 0.035, d * 0.2]} position={[0, H * 0.93, 0]} color="#f1f1ef" radius={0.006} roughness={0.9} />
      <Rod from={[0, H * 0.93, -d * 0.12]} to={[0, H + 0.05, 0]} r={0.003} color={CHROME} metal />
      <Rod from={[0, H * 0.93, d * 0.12]} to={[0, H + 0.05, 0]} r={0.003} color={CHROME} metal />
      <Rod from={[0, H + 0.05, 0]} to={[0, h, 0]} r={0.003} color={CHROME} metal />
    </group>
  )
}

// Clothes 2: 접어서 쌓은 옷 더미(밝은 회색 셔츠가 맨 위).
function FoldedClothes({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const colors = ['#2d2e32', '#c7c7c9', '#3a3a3e', '#a8a9ad', '#8f949b']
  const layer = h / colors.length
  return (
    <group>
      {colors.map((color, index) => (
        <Slab key={index} size={[w * (1 - index * 0.02), layer * 0.96, d * (1 - index * 0.02)]} position={[0, layer * (index + 0.5), 0]} color={color} radius={0.012} roughness={0.95} />
      ))}
      <Slab size={[w * 0.34, 0.012, d * 0.22]} position={[0, h + 0.004, -d * 0.3]} color="#7e838b" radius={0.005} roughness={0.95} />
    </group>
  )
}

// shoes 01: 회색 슬립온 한 켤레. 흰 밑창 위에 둥근 돔 모양 갑피와 뒤쪽 발 넣는 입구.
function Shoes({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const each = w / 2 - 0.006
  const soleH = 0.02
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (each / 2 + 0.003), 0, 0]}>
          <Slab size={[each, soleH, d]} position={[0, soleH / 2, 0]} color="#e6e6e4" radius={0.009} />
          <mesh position={[0, soleH, 0]} scale={[each / 2, h - soleH, d / 2 * 0.96]} castShadow>
            <sphereGeometry args={[1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            {std('#5e6065', 0.85)}
          </mesh>
          <mesh position={[0, h - 0.004, -d * 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.6, 1]}>
            <circleGeometry args={[each * 0.28, 20]} />
            {std('#17171a', 0.9)}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 철제행거 + 걸린 드레스 셔츠 3벌·접은 옷 2더미·신발 2켤레를 한 덩어리로 그린다. 위치(행거 가운데 기준, 가로 x·앞 z, mm)와 높이는 플래너 배치에서 옮겼다.
const HANGER_CONTENTS: { kind: 'shirt' | 'folded' | 'shoes'; w: number; d: number; h: number; x: number; z: number; y: number; turn: number }[] = [
  { kind: 'shirt', w: 134, d: 451, h: 964, x: -257, z: 82, y: 734, turn: 0 },
  { kind: 'shirt', w: 134, d: 451, h: 964, x: -174, z: 76, y: 734, turn: 0 },
  { kind: 'shirt', w: 134, d: 451, h: 964, x: -76, z: 68, y: 734, turn: 0 },
  { kind: 'folded', w: 233, d: 319, h: 200, x: 230, z: 0, y: 360, turn: 0 },
  { kind: 'folded', w: 233, d: 319, h: 200, x: -27, z: 1, y: 360, turn: 0 },
  { kind: 'shoes', w: 169, d: 228, h: 71, x: -257, z: 0, y: 50, turn: Math.PI },
  { kind: 'shoes', w: 169, d: 228, h: 71, x: -76, z: 0, y: 50, turn: Math.PI },
]

export function HangerSet({ item }: Props) {
  const parts: Record<'shirt' | 'folded' | 'shoes', ComponentType<Props>> = { shirt: Shirt, folded: FoldedClothes, shoes: Shoes }
  return (
    <group>
      <WallHanger item={item} />
      {HANGER_CONTENTS.map((part, index) => {
        const Part = parts[part.kind]
        return (
          <group key={index} position={[part.x / M, part.y / M, part.z / M]} rotation={[0, part.turn, 0]}>
            <Part item={{ ...item, w: part.w, d: part.d, h: part.h, tint: undefined }} />
          </group>
        )
      })}
    </group>
  )
}

// PARENTESI: 천장에서 바닥까지 팽팽히 당긴 가는 케이블, 가운데 철봉에 달린 팔과 붉은 스포트라이트.
function Parentesi({ item }: Props) {
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.04, 20]} />
        {std('#222224', 0.5, 0.4)}
      </mesh>
      <Rod from={[0, 0.04, 0]} to={[0, h, 0]} r={0.0025} color="#8d8d90" metal />
      <Rod from={[0, h * 0.52, 0]} to={[0, h * 0.7, 0]} r={0.011} color="#e2e2e0" metal />
      <Rod from={[0, h * 0.62, 0]} to={[0, h * 0.62, d * 0.4]} r={0.005} color="#d9d9d7" metal />
      <mesh position={[0, h * 0.62 - 0.02, d * 0.4]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.05, 0.14, 20]} />
        {std('#c0392b', 0.4, 0.2)}
      </mesh>
    </group>
  )
}

// LOOM+ Tweed Rug(원형 1000mm, 보더형): 짙은 회색 원형 러그와 안쪽 둘레선.
function TweedRug({ item }: Props) {
  const r = item.w / 2 / M
  return (
    <group>
      <mesh position={[0, 0.0025, 0]} receiveShadow>
        <cylinderGeometry args={[r, r, 0.005, 64]} />
        {std('#d9d3c4', 1)}
      </mesh>
      <mesh position={[0, 0.0055, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[r * 0.84, r * 0.88, 64]} />
        {std('#8c8678', 1)}
      </mesh>
    </group>
  )
}

// CABINET WITH SLIDING DOORS: 검은 물푸레 수납장, 미닫이 문 두 짝과 손잡이 구멍.
function SlidingCabinet({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <Slab size={[w, h, d - 0.02]} position={[0, h / 2, -0.01]} color={item.tint ?? '#2a2a2c'} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Slab size={[w / 2 + 0.01, h - 0.02, 0.012]} position={[side * (w / 4 - 0.002), h / 2, d / 2 - (side < 0 ? 0.008 : 0.02)]} color={item.tint ? lighten(item.tint, 0.06) : '#3a3a3c'} roughness={0.7} />
          <mesh position={[side * (w / 2 - 0.035), h / 2, d / 2 + (side < 0 ? -0.001 : -0.013)]}>
            <circleGeometry args={[0.014, 20]} />
            {std('#151517', 0.8)}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Audiorama 4000: 크롬 기둥과 둥근 받침 위의 검은 구형 스피커.
function Audiorama({ item }: Props) {
  const r = item.w / M / 2
  const h = item.h / M
  return (
    <group>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[r * 0.9, r, 0.02, 32]} />
        {std(CHROME, 0.2, 0.8)}
      </mesh>
      <Rod from={[0, 0.02, 0]} to={[0, h - r, 0]} r={0.011} color={CHROME} metal />
      <mesh position={[0, h - r, 0]} castShadow>
        <sphereGeometry args={[r, 32, 24]} />
        {std('#17171a', 0.3, 0.3)}
      </mesh>
    </group>
  )
}

// Beat Table Light: 검은 받침과 가는 몸대, 앞으로 기울어진 원뿔 갓(안쪽 금색).
function BeatLight({ item }: Props) {
  const d = item.d / M
  const h = item.h / M
  const shadeH = 0.22
  const topR = 0.03
  const botR = Math.min(item.w, item.d) / M * 0.45
  return (
    <group>
      <mesh position={[0, 0.01, -d * 0.2]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 32]} />
        {std('#1b1b1d', 0.4, 0.4)}
      </mesh>
      <Rod from={[0, 0.02, -d * 0.2]} to={[0, h - shadeH * 0.8, -d * 0.2]} r={0.007} color="#17171a" />
      <group position={[0, h - shadeH * 0.5, -d * 0.2 + 0.07]} rotation={[0.4, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[topR, botR, shadeH, 32, 1, true]} />
          <meshStandardMaterial color="#1b1b1d" roughness={0.4} metalness={0.3} side={THREE.FrontSide} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[topR * 0.96, botR * 0.96, shadeH * 0.99, 32, 1, true]} />
          <meshStandardMaterial color="#d9a441" roughness={0.3} metalness={0.7} side={THREE.BackSide} emissive="#ffcf66" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, -shadeH * 0.2, 0]}>
          <sphereGeometry args={[0.025, 14, 12]} />
          <meshStandardMaterial color="#fff1b8" emissive="#fff1b8" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  )
}

// keyboard: 검은 키보드. 키 격자는 무늬로 그렸다.
function Keyboard({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const keys = useDrawn(512, 160, (ctx, cw, ch) => {
    ctx.fillStyle = '#17171a'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#34353a'
    const rows = 6
    const cols = 20
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        ctx.fillRect(8 + (col * (cw - 16)) / cols, 6 + (row * (ch - 12)) / rows, (cw - 16) / cols - 3, (ch - 12) / rows - 3)
      }
    }
  })
  return (
    <group>
      <Slab size={[w, h * 0.7, d]} position={[0, h * 0.35, 0]} color="#1f1f21" radius={0.004} />
      <mesh position={[0, h * 0.7 + 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.012, d - 0.012]} />
        <meshStandardMaterial map={keys} roughness={0.6} />
      </mesh>
    </group>
  )
}

// mouse: 납작한 검은 마우스.
function Mouse({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <mesh position={[0, h * 0.5, 0]} scale={[w / 2, h / 2, d / 2]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        {std('#1d1d20', 0.35, 0.2)}
      </mesh>
      <Rod from={[0, h * 0.95, -d * 0.1]} to={[0, h * 0.95, -d * 0.45]} r={0.0012} color="#0d0d0f" />
    </group>
  )
}

// NIMM File Holder: 검은 얇은 판으로 만든 키 큰 파일꽂이(앞판이 낮고 위가 열림).
function FileHolder({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const t = 0.003
  const dark = '#2b2b2d'
  return (
    <group>
      <Slab size={[w, t, d]} position={[0, t / 2, 0]} color={dark} />
      <Slab size={[w, h, t]} position={[0, h / 2, -d / 2 + t / 2]} color={dark} />
      {[-1, 1].map((side) => (
        <Slab key={side} size={[t, h, d]} position={[side * (w / 2 - t / 2), h / 2, 0]} color={dark} />
      ))}
      <Slab size={[w, h * 0.35, t]} position={[0, h * 0.175, d / 2 - t / 2]} color={dark} />
    </group>
  )
}

// Open book: 펼친 책. 양쪽 면이 가운데 쪽으로 살짝 솟는다.
function OpenBook({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <Slab size={[w, 0.01, d]} position={[0, 0.005, 0]} color="#2c2c2e" />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * w * 0.25, 0.012, 0]} rotation={[0, 0, side * 0.12]}>
          <Slab size={[w * 0.49, h * 0.45, d * 0.93]} position={[0, h * 0.2, 0]} color="#f4f4f1" roughness={0.95} />
          <mesh position={[0, h * 0.2 + h * 0.225 + 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w * 0.4, d * 0.8]} />
            {std('#e5e5e1', 1)}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// espresso cup set: 은색 직사각 받침 위에 은색 컵.
function EspressoSet({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <Slab size={[w, 0.008, d]} position={[0, 0.004, 0]} color="#b4b7bb" radius={0.01} metalness={0.7} roughness={0.3} />
      <Lathe profile={[[0, 0], [0.032, 0], [0.04, 0.02], [0.044, h - 0.008], [0.044, h - 0.008 - 0.002]]} color="#b4b7bb" metalness={0.7} roughness={0.25} position={[-w * 0.15, 0.008, 0]} />
      <mesh position={[-w * 0.15, h - 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.042, 24]} />
        {std('#3a2a22', 0.4)}
      </mesh>
      <Slab size={[w * 0.3, 0.004, 0.012]} position={[w * 0.28, 0.01, d * 0.1]} color="#9a9da1" metalness={0.7} roughness={0.3} />
    </group>
  )
}

// Union #12: 흑백 인물 사진이 있는 잡지/책. 표지가 앞을 본다.
function UnionBook({ item }: Props) {
  const w = item.w / M
  const h = item.h / M
  const cover = useDrawn(256, 308, (ctx, cw, ch) => {
    ctx.fillStyle = '#e6e5df'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#111'
    ctx.font = 'bold 42px serif'
    ctx.textAlign = 'center'
    ctx.fillText('Union', cw / 2, 52)
    ctx.fillStyle = '#6f6f6f'
    ctx.fillRect(34, 76, cw - 68, ch - 100)
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(cw / 2 - 20, 110, 40, 150)
  })
  return (
    <group rotation={[-0.12, 0, 0]}>
      <Slab size={[w, h, 0.03]} position={[0, h / 2, 0]} color="#e6e5df" roughness={0.9} />
      <mesh position={[0, h / 2, 0.0155]}>
        <planeGeometry args={[w - 0.004, h - 0.004]} />
        <meshStandardMaterial map={cover} roughness={0.8} />
      </mesh>
    </group>
  )
}

// book deco: 분홍 책 몇 권을 기대어 놓고 옆에 흰 잡지꽂이 두 개.
function BookDeco({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const holderW = 0.075
  const profile: [number, number][] = [[-d / 2, 0], [d / 2, 0], [d / 2, h * 0.62], [-d / 2, h]]
  return (
    <group>
      {[0.1, 0.18, 0.26].map((offset, index) => (
        <Slab key={index} size={[0.025, h * 0.9, d * 0.6]} position={[-w / 2 + 0.035 + index * 0.028, h * 0.45, 0]} color={['#e9bfae', '#e3b3a2', '#dba797'][index]} rotation={[0, 0, 0.12 - offset * 0.2]} roughness={0.85} />
      ))}
      {[w * 0.12, w * 0.36].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <SidePlate profile={profile} thickness={0.004} x={-holderW / 2} color="#f3f3f1" />
          <SidePlate profile={profile} thickness={0.004} x={holderW / 2 - 0.004} color="#f3f3f1" />
          <Slab size={[holderW, h * 0.95, 0.004]} position={[0, h * 0.475, -d / 2 + 0.002]} color="#f3f3f1" />
          <Slab size={[holderW, 0.004, d]} position={[0, 0.002, 0]} color="#f3f3f1" />
        </group>
      ))}
    </group>
  )
}

// steel storage box: 둥근 모서리의 검은 상자, 앞쪽 가운데에 크롬 손잡이 막대.
function SteelBox({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <Slab size={[w, h, d]} position={[0, h / 2, 0]} color={item.tint ?? '#1b1b1d'} radius={0.03} roughness={0.35} metalness={0.3} />
      <Rod from={[-w * 0.3, h * 0.28, d / 2 + 0.004]} to={[w * 0.3, h * 0.28, d / 2 + 0.004]} r={0.004} color={CHROME} metal />
    </group>
  )
}

// office supplies: 메모 상자, 펜꽂이(펜 여러 자루), 명함꽂이.
function DeskSupplies({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const taupe = '#8a7f72'
  return (
    <group>
      <Slab size={[0.09, 0.085, 0.09]} position={[-w / 2 + 0.05, 0.0425, 0]} color="#8f8578" roughness={0.9} />
      <mesh position={[-w / 2 + 0.05, 0.0865, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.075, 0.075]} />
        {std('#f1f1ef', 0.9)}
      </mesh>
      <mesh position={[-w / 2 + 0.16, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.1, 18]} />
        {std(taupe, 0.9)}
      </mesh>
      {[-0.012, 0, 0.012, 0.006].map((lean, index) => (
        <Rod key={index} from={[-w / 2 + 0.16, 0.06, 0]} to={[-w / 2 + 0.16 + lean, h, (index - 1.5) * 0.008]} r={0.0022} color="#1a1a1c" />
      ))}
      <Slab size={[w * 0.3, 0.07, d * 0.55]} position={[w * 0.12, 0.035, 0]} color={taupe} roughness={0.9} />
      <Slab size={[w * 0.3, 0.095, 0.014]} position={[w * 0.12, 0.0475, d * 0.3]} color="#968b7d" roughness={0.9} />
      <Slab size={[w * 0.28, 0.025, 0.07]} position={[w * 0.35, 0.0125, 0]} color={taupe} roughness={0.9} />
      <Slab size={[w * 0.28, 0.09, 0.012]} position={[w * 0.35, 0.05, -0.02]} color="#968b7d" roughness={0.9} />
    </group>
  )
}

// Black vase: 두 번 불룩한 검은 도자 꽃병.
function BlackVase({ item }: Props) {
  const r = item.w / M / 2
  const h = item.h / M
  const profile: [number, number][] = [[0, 0], [r * 0.7, 0], [r * 0.95, h * 0.12], [r, h * 0.28], [r * 0.7, h * 0.42], [r * 0.55, h * 0.5], [r * 0.85, h * 0.62], [r * 0.9, h * 0.74], [r * 0.55, h * 0.9], [r * 0.5, h], [r * 0.4, h]]
  return <Lathe profile={profile} color="#222224" roughness={0.55} />
}

// 26 CM_blue: 위가 넓은 푸른 도자 화병을 초록 등나무 줄로 감싼 화병.
function BlueVase({ item }: Props) {
  const r = item.w / M / 2 - 0.02
  const h = item.h / M
  const green = '#1f4a2c'
  const profile: [number, number][] = [[0, 0.01], [r * 0.75, 0.01], [r * 0.88, h * 0.4], [r, h * 0.85], [r * 1.02, h - 0.01], [r * 0.9, h - 0.012]]
  return (
    <group>
      <Lathe profile={profile} color="#27415e" roughness={0.2} metalness={0.3} />
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2
        const bottom = r * 0.78
        const mid = r * 1.08
        const top = r * 1.06
        return (
          <group key={index}>
            <Rod from={[Math.cos(angle) * bottom, 0.02, Math.sin(angle) * bottom]} to={[Math.cos(angle) * mid, h * 0.45, Math.sin(angle) * mid]} r={0.0055} color={green} />
            <Rod from={[Math.cos(angle) * mid, h * 0.45, Math.sin(angle) * mid]} to={[Math.cos(angle) * top, h - 0.015, Math.sin(angle) * top]} r={0.0055} color={green} />
          </group>
        )
      })}
      {[[0.03, 0.8], [h * 0.5, 1.09], [h - 0.02, 1.06]].map(([y, scale]) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * scale, 0.007, 8, 40]} />
          {std(green, 0.6)}
        </mesh>
      ))}
    </group>
  )
}

// LED 뉴플랜 면조명: 천장에 붙는 얇은 흰 사각 조명(아래 면이 빛남).
function LedPanel({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  return (
    <group>
      <Slab size={[w, h, d]} position={[0, h / 2, 0]} color="#f1f1ef" roughness={0.5} />
      <mesh position={[0, -0.0004, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.03, d - 0.03]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// CALDERA incense holder: 세 발 달린 검은 그릇과 비스듬히 꽂은 향.
function IncenseHolder({ item }: Props) {
  const r = item.w / M / 2
  const h = item.h / M
  const legH = 0.03
  return (
    <group>
      <mesh position={[0, legH + 0.02, 0]} scale={[1, 0.45, 1]} castShadow>
        <sphereGeometry args={[r, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#1f1f21" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2].map((index) => {
        const angle = (index / 3) * Math.PI * 2 + 0.5
        return <Rod key={index} from={[Math.cos(angle) * r * 0.55, legH + 0.012, Math.sin(angle) * r * 0.55]} to={[Math.cos(angle) * r * 0.62, 0, Math.sin(angle) * r * 0.62]} r={0.009} color="#1f1f21" />
      })}
      <Rod from={[0.005, legH + 0.005, 0]} to={[-0.03, h, 0.01]} r={0.0018} color="#7a4b2f" />
    </group>
  )
}

// 4 Scents X Mini Room Spray: 흰 납작한 상자, 윗면에 DSTL 글자.
function DstlBox({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const label = useDrawn(256, 200, (ctx, cw, ch) => {
    ctx.fillStyle = '#f8f8f6'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#9a9a9a'
    ctx.font = 'bold 54px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('DSTL', cw / 2, ch / 2 + 18)
  })
  return (
    <group>
      <Slab size={[w, h, d]} position={[0, h / 2, 0]} color="#f8f8f6" radius={0.002} roughness={0.7} />
      <mesh position={[0, h + 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.004, d - 0.004]} />
        <meshStandardMaterial map={label} roughness={0.7} />
      </mesh>
    </group>
  )
}

// Diptyque: 타원형 연녹색 향수병, 검은 캡, 흰 타원 라벨.
function Diptyque({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const bodyH = h * 0.78
  return (
    <group>
      <mesh position={[0, bodyH / 2, 0]} scale={[w / 2, bodyH / 2, d / 2]} castShadow>
        <sphereGeometry args={[1, 28, 20]} />
        {glass('#cdd7b4', 0.8)}
      </mesh>
      <mesh position={[0, h * 0.82, 0]}>
        <cylinderGeometry args={[0.012, 0.014, 0.012, 16]} />
        {std('#b9bbbf', 0.3, 0.7)}
      </mesh>
      <mesh position={[0, h * 0.92, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.03, 18]} />
        {std('#17171a', 0.4)}
      </mesh>
      <mesh position={[0, bodyH * 0.5, d / 2 * 0.98]} scale={[1, 1.2, 1]}>
        <circleGeometry args={[w * 0.3, 20]} />
        {std('#f1f1ec', 0.8)}
      </mesh>
    </group>
  )
}

// ODDRUN: 낙타색 담요를 접어 쌓아 올린 덩어리.
function Oddrun({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const layers = [
    { scale: 1, tone: '#c9a064' },
    { scale: 0.94, tone: '#c29a5e' },
    { scale: 0.88, tone: '#cba46b' },
    { scale: 0.8, tone: '#c5985a' },
  ]
  const layerH = h / layers.length
  return (
    <group>
      {layers.map((layer, index) => (
        <Slab key={index} size={[w * layer.scale, layerH * 1.05, d * layer.scale]} position={[0, layerH * (index + 0.5), 0]} color={layer.tone} radius={0.04} roughness={0.98} />
      ))}
    </group>
  )
}

// 프리미엄 리넨 쿠션: 낙타색 직사각 쿠션. 모서리가 각지고 가운데가 통통하다.
function Cushion({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const base = item.tint ?? '#f1f1ee'
  // 베개처럼 가장자리는 얇게 모이고 가운데가 볼록한 두 면. 모서리는 뾰족하게 당겨지고 가장자리에는 잔주름이 진다.
  const faces = useMemo(() => {
    const nx = 40
    const ny = 26
    const build = (side: 1 | -1) => {
      const positions: number[] = []
      const index: number[] = []
      for (let j = 0; j <= ny; j += 1) {
        for (let i = 0; i <= nx; i += 1) {
          const u = (i / nx) * 2 - 1
          const v = (j / ny) * 2 - 1
          const edge = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 3.2)), 0.55) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(v), 3.2)), 0.55)
          const crinkle = (1 - edge) * 0.012 * Math.sin(u * 19 + v * 7) * Math.cos(v * 15)
          const pull = 1 - 0.035 * Math.pow(Math.abs(u * v), 1.5) // 모서리가 살짝 안쪽으로
          positions.push((u * w * pull) / 2, h / 2 + (v * h * pull) / 2, side * ((d / 2) * edge + crinkle))
        }
      }
      for (let j = 0; j < ny; j += 1) {
        for (let i = 0; i < nx; i += 1) {
          const a = j * (nx + 1) + i
          const b = a + 1
          const c = a + nx + 1
          const e = c + 1
          if (side === 1) index.push(a, b, c, b, e, c)
          else index.push(a, c, b, b, c, e)
        }
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setIndex(index)
      geometry.computeVertexNormals()
      return geometry
    }
    return [build(1), build(-1)]
  }, [w, d, h])
  return (
    <group>
      {faces.map((geometry, index) => (
        <mesh key={index} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color={index === 0 ? base : lighten(base, 0.02)} roughness={0.98} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

// PC 홀더: 책상 아래에 두는 흰색 PC 거치대(양옆판과 위·아래 판).
function PcHolder({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const white = '#f1f1ef'
  return (
    <group>
      {[-1, 1].map((side) => (
        <Slab key={side} size={[0.012, h, d]} position={[side * (w / 2 - 0.006), h / 2, 0]} color={white} roughness={0.5} />
      ))}
      <Slab size={[w, 0.015, d]} position={[0, h - 0.0075, 0]} color={white} roughness={0.5} />
      <Slab size={[w, 0.015, d * 0.7]} position={[0, 0.0075, -d * 0.15]} color={white} roughness={0.5} />
    </group>
  )
}

// desktop computer: 검은 데스크톱 본체, 옆면에 통풍 줄무늬와 아래쪽 전원 버튼.
function DesktopPc({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const vents = useDrawn(256, 256, (ctx, cw, ch) => {
    ctx.fillStyle = '#1c1c1f'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#2d2d31'
    for (let x = 14; x < cw - 10; x += 10) ctx.fillRect(x, 20, 4, ch - 40)
  })
  return (
    <group>
      <Slab size={[w, h, d]} position={[0, h / 2, 0]} color="#222225" radius={0.006} roughness={0.5} />
      <mesh position={[w / 2 + 0.0006, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d * 0.9, h * 0.9]} />
        <meshStandardMaterial map={vents} roughness={0.6} />
      </mesh>
      <mesh position={[w * 0.28, h * 0.12, d / 2 + 0.001]}>
        <circleGeometry args={[0.008, 16]} />
        {std('#6f6f74', 0.4, 0.6)}
      </mesh>
    </group>
  )
}

// Erba Dhurrie Rug: 밝은 크림색 바탕에 짙은 회색 막대 무늬가 줄지은 직사각 러그(밝은 마루에 어울리게 바탕을 밝혔다).
function Dhurrie({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const pattern = useDrawn(256, 360, (ctx, cw, ch) => {
    ctx.fillStyle = '#e4ddcc'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#4a4a50'
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        const x = 20 + col * 36
        const y = 24 + row * 38
        if ((row + col) % 2 === 0) {
          ctx.fillRect(x, y, 4, 22)
          ctx.fillRect(x + 8, y, 4, 22)
          ctx.fillRect(x + 16, y, 4, 22)
        }
      }
    }
  })
  return (
    <group>
      <mesh position={[0, 0.004, 0]} receiveShadow>
        <boxGeometry args={[w, 0.008, d]} />
        {std('#e4ddcc', 1)}
      </mesh>
      <mesh position={[0, 0.0085, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 0.02, d - 0.02]} />
        <meshStandardMaterial map={pattern} roughness={1} />
      </mesh>
    </group>
  )
}

// Front door: 밝은 문틀 안에 검은 문짝, 오른쪽 손잡이.
function FrontDoor({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const frame = 0.06
  return (
    <group>
      <Slab size={[frame, h, d]} position={[-w / 2 + frame / 2, h / 2, 0]} color="#d9d5cc" />
      <Slab size={[frame, h, d]} position={[w / 2 - frame / 2, h / 2, 0]} color="#d9d5cc" />
      <Slab size={[w, frame, d]} position={[0, h - frame / 2, 0]} color="#d9d5cc" />
      <Slab size={[w - frame * 2, h - frame, 0.045]} position={[0, (h - frame) / 2, 0]} color="#222225" roughness={0.55} />
      <Rod from={[w / 2 - frame - 0.07, h * 0.46, 0.03]} to={[w / 2 - frame - 0.17, h * 0.46, 0.06]} r={0.01} color={CHROME} metal />
    </group>
  )
}

// JELD WEN Windows: 검은 창틀에 가운데 세로·가로 창살이 있는 미닫이 창. 유리는 연한 파란색.
function WindowFrame({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const frame = 0.04
  const black = '#1f1f22'
  return (
    <group>
      <Slab size={[frame, h, d]} position={[-w / 2 + frame / 2, h / 2, 0]} color={black} roughness={0.5} />
      <Slab size={[frame, h, d]} position={[w / 2 - frame / 2, h / 2, 0]} color={black} roughness={0.5} />
      <Slab size={[w, frame, d]} position={[0, h - frame / 2, 0]} color={black} roughness={0.5} />
      <Slab size={[w, frame, d]} position={[0, frame / 2, 0]} color={black} roughness={0.5} />
      <Slab size={[0.04, h - frame * 2, d * 0.7]} position={[0, h / 2, 0]} color={black} roughness={0.5} />
      <Slab size={[w - frame * 2, 0.03, d * 0.5]} position={[0, h / 2, 0]} color={black} roughness={0.5} />
    </group>
  )
}

// 싱글 모니터암: 책상 모서리에 물리는 흰 클램프, 짧은 기둥, 위로 비스듬히 뻗은 팔, 끝의 VESA 판(모니터 고정판). 뒤(-z)가 클램프다.
function MonitorArm({ item }: Props) {
  const w = item.w / M
  const d = item.d / M
  const h = item.h / M
  const white = '#f1f1ef'
  const baseZ = -d / 2 + 0.05
  const headZ = d / 2 - 0.03
  const postTop = h * 0.5
  return (
    <group>
      <Slab size={[w * 0.6, 0.05, 0.1]} position={[0, 0.025, baseZ]} color={white} radius={0.006} roughness={0.5} />
      <Rod from={[0, 0.05, baseZ]} to={[0, postTop, baseZ]} r={0.019} color={white} />
      <mesh position={[0, postTop, baseZ]} castShadow>
        <sphereGeometry args={[0.024, 18, 14]} />
        {std(white, 0.5)}
      </mesh>
      <Rod from={[0, postTop, baseZ]} to={[0, h * 0.82, d * 0.1]} r={0.016} color={white} />
      <Rod from={[0, h * 0.82, d * 0.1]} to={[0, h - 0.07, headZ]} r={0.014} color={white} />
      <Slab size={[0.1, 0.1, 0.012]} position={[0, h - 0.06, headZ + 0.01]} color={white} radius={0.008} roughness={0.5} rotation={[-0.15, 0, 0]} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sy) => (
          <mesh key={`${sx}${sy}`} position={[sx * 0.037, h - 0.06 + sy * 0.037, headZ + 0.0175]} rotation={[-0.15, 0, 0]}>
            <circleGeometry args={[0.006, 12]} />
            {std('#8d8d90', 0.5)}
          </mesh>
        )),
      )}
    </group>
  )
}

export const PROP_MODELS: Record<PropModel, ComponentType<Props>> = {
  stringpocket: StringPocket,
  bedding: BeddingSet,
  picframe: PictureFrame,
  poster: Poster,
  kidlamp: KidLamp,
  laptop: Laptop,
  geneva: GenevaSpeaker,
  clock: TableClock,
  winebottle: WineBottle,
  wineglasses: WineGlasses,
  turntable: Turntable,
  recordstack: RecordStack,
  tissuecase: TissueCase,
  diffuser: Diffuser,
  bookrow: BookRow,
  ovaltray: OvalTray,
  bird: EamesBird,
  wallhanger: WallHanger,
  shirt: Shirt,
  folded: FoldedClothes,
  shoes: Shoes,
  parentesi: Parentesi,
  tweedrug: TweedRug,
  slidingcab: SlidingCabinet,
  audiorama: Audiorama,
  beatlight: BeatLight,
  keyboard: Keyboard,
  mouse: Mouse,
  fileholder: FileHolder,
  openbook: OpenBook,
  espresso: EspressoSet,
  unionbook: UnionBook,
  bookdeco: BookDeco,
  steelbox: SteelBox,
  supplies: DeskSupplies,
  blackvase: BlackVase,
  bluevase: BlueVase,
  ledpanel: LedPanel,
  incense: IncenseHolder,
  dstl: DstlBox,
  diptyque: Diptyque,
  oddrun: Oddrun,
  cushion: Cushion,
  pcholder: PcHolder,
  desktoppc: DesktopPc,
  dhurrie: Dhurrie,
  frontdoor: FrontDoor,
  window: WindowFrame,
  monitorarm: MonitorArm,
}

