import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Grid, Html } from '@react-three/drei'
import * as THREE from 'three'
import { CURTAIN_GAP, DOOR_HEIGHT, WALL_THICKNESS, doorSpan, isWideRoom, toWorld, windowSpan } from '@/lib/room'
import ItemModel, { OpenBox } from '@/components/fit/Models'
import type { Item, Opening, Room, Side } from '@/lib/types'

const M = 1000
const WINDOW_BOTTOM = 900
const WINDOW_TOP = 2100

type Piece = { from: number; to: number; bottom: number; top: number }

type WallProps = {
  room: Room
  side: '-x' | '+x' | '-z' | '+z'
  pieces: Piece[]
}

const TILE = 0.4

// 어두운 마루판: 판마다 이음매 위치와 밝기가 조금씩 다르다.
function plankTexture(room: Room) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const tones = ['#55575c', '#4f5155', '#5a5c61', '#4b4d51']
  for (let row = 0; row < 8; row++) {
    const offset = (row * 97) % 256
    for (let k = -1; k < 3; k++) {
      ctx.fillStyle = tones[(row * 3 + k + 8) % tones.length]
      ctx.fillRect(offset + k * 256, row * 64, 256, 64)
      ctx.fillStyle = '#34353a'
      ctx.fillRect(offset + k * 256, row * 64, 2, 64)
    }
    ctx.fillStyle = '#34353a'
    ctx.fillRect(0, row * 64 + 62, 512, 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.repeat.set(room.w / M / 2.4, room.d / M / 2.4)
  return texture
}


function tileTexture(color: string, line: string, lengthM: number, heightM: number) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 64, 64)
  ctx.fillStyle = line
  ctx.fillRect(62, 0, 2, 64)
  ctx.fillRect(0, 62, 64, 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.repeat.set(Math.max(1, lengthM / TILE), Math.max(1, heightM / TILE))
  return texture
}

// 카메라가 벽 바깥쪽에 있으면 벽을 거의 투명하게 해서 방 안이 보이게 한다.
function Wall({ room, side, pieces }: WallProps) {
  const halfW = room.w / 2 / M
  const halfD = room.d / 2 / M
  const t = WALL_THICKNESS / M

  const built = useMemo(
    () =>
      pieces.map((piece) => {
        // 이미지처럼 조명과 상관없이 밝고 납작한 흰 타일 벽
        const tile = new THREE.MeshBasicMaterial({
          map: tileTexture('#fbfbfa', '#d3d4d7', (piece.to - piece.from) / M, (piece.top - piece.bottom) / M),
          transparent: true,
        })
        const rim = new THREE.MeshBasicMaterial({ color: '#b9babe', transparent: true })
        return { tile, rim, materials: [tile, tile, rim, tile, tile, tile] }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(pieces)],
  )

  useEffect(
    () => () =>
      built.forEach(({ tile, rim }) => {
        tile.map?.dispose()
        tile.dispose()
        rim.dispose()
      }),
    [built],
  )

  useFrame(({ camera }) => {
    const p = camera.position
    const outside =
      side === '-x' ? p.x < -halfW : side === '+x' ? p.x > halfW : side === '-z' ? p.z < -halfD : p.z > halfD
    built.forEach(({ tile, rim }) => {
      tile.opacity = rim.opacity = outside ? 0.06 : 1
      tile.depthWrite = rim.depthWrite = !outside
    })
  })

  return (
    <group>
      {pieces.map((piece, index) => {
        const length = (piece.to - piece.from) / M
        const height = (piece.top - piece.bottom) / M
        const along = (piece.from + piece.to) / 2 / M
        const y = (piece.bottom + piece.top) / 2 / M
        const alongX = side === '-z' || side === '+z'
        const position: [number, number, number] = alongX
          ? [along - halfW, y, side === '-z' ? -halfD - t / 2 : halfD + t / 2]
          : [side === '-x' ? -halfW - t / 2 : halfW + t / 2, y, along - halfD]
        const size: [number, number, number] = alongX ? [length + t * 2, height, t] : [t, height, length]
        return (
          <mesh key={index} position={position} material={built[index].materials} receiveShadow castShadow>
            <boxGeometry args={size} />
          </mesh>
        )
      })}
    </group>
  )
}

const LEAVES: [number, number, number][] = [
  [0.2, 0.3, 0.07], [0.45, 0.6, 0.09], [0.7, 0.25, 0.06], [0.3, 0.8, 0.08], [0.6, 0.85, 0.07], [0.85, 0.55, 0.09], [0.12, 0.62, 0.06],
]

function windowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#5fa84e'
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = '#8fd16f'
  LEAVES.forEach(([x, y, r]) => {
    ctx.beginPath()
    ctx.arc(x * 128, y * 128, r * 128, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#3d8a3a'
  LEAVES.forEach(([x, y, r]) => {
    ctx.beginPath()
    ctx.arc((1 - x) * 128, (1 - y) * 128, r * 100, 0, Math.PI * 2)
    ctx.fill()
  })
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function WallLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <circleGeometry args={[0.17, 32]} />
        <meshBasicMaterial color="#ffd86b" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial color="#26272a" roughness={0.6} />
      </mesh>
    </group>
  )
}

// 오른쪽 벽의 창: 어두운 틀, 바깥 초록 풍경, 위쪽에 내려온 블라인드.
function WindowView({ x, midZ, length, height, centerY }: { x: number; midZ: number; length: number; height: number; centerY: number }) {
  const view = useMemo(windowTexture, [])
  const frame = 0.06
  const dark = <meshStandardMaterial color="#26272a" roughness={0.6} />
  const blindH = height * 0.42
  const slats = Math.floor(blindH / 0.055)
  return (
    <group position={[x, centerY, midZ]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        <meshBasicMaterial map={view} side={THREE.DoubleSide} />
      </mesh>
      {[
        { size: [0.08, frame, length + frame * 2], pos: [0, height / 2, 0] },
        { size: [0.08, frame, length + frame * 2], pos: [0, -height / 2, 0] },
        { size: [0.08, height, frame], pos: [0, 0, length / 2] },
        { size: [0.08, height, frame], pos: [0, 0, -length / 2] },
        { size: [0.08, height, frame * 0.8], pos: [0, 0, length * 0.18] },
      ].map((bar, index) => (
        <mesh key={index} position={bar.pos as [number, number, number]} castShadow>
          <boxGeometry args={bar.size as [number, number, number]} />
          {dark}
        </mesh>
      ))}
      {Array.from({ length: slats }, (_, index) => (
        <mesh key={index} position={[-0.015, height / 2 - 0.04 - index * 0.055, 0]}>
          <boxGeometry args={[0.012, 0.035, length - frame]} />
          <meshStandardMaterial color={index % 2 ? '#6a5a3c' : '#4a3d28'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Tag({ position, tone, children }: { position: [number, number, number]; tone: 'sky' | 'amber'; children: string }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <span
        className={`whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium shadow-sm ${
          tone === 'sky' ? 'text-on-primary-container' : 'text-amber-700'
        }`}
      >
        {children}
      </span>
    </Html>
  )
}


// 벽을 따라 잰 구멍들(문·창)을 빼고 남는 벽 조각을 만든다.
const wallPieces = (room: Room, length: number, cuts: Opening[]): Piece[] => {
  const sorted = [...cuts].sort((a, b) => a.from - b.from)
  const list: Piece[] = []
  let cursor = 0
  sorted.forEach((cut) => {
    list.push({ from: cursor, to: cut.from, bottom: 0, top: room.h })
    list.push({ from: cut.from, to: cut.to, bottom: 0, top: cut.bottom })
    list.push({ from: cut.from, to: cut.to, bottom: cut.top, top: room.h })
    cursor = cut.to
  })
  list.push({ from: cursor, to: length, bottom: 0, top: room.h })
  return list.filter((piece) => piece.to > piece.from && piece.top > piece.bottom)
}

// 구멍이 난 벽 안쪽을 보는 방향(앞)이 가구 모델의 +z 가 되도록 돌린다.
const FACING: Record<Side, number> = { '-x': Math.PI / 2, '+x': -Math.PI / 2, '-z': 0, '+z': Math.PI }

function OpeningModel({ room, opening, kind }: { room: Room; opening: Opening; kind: 'door' | 'window' }) {
  const view = useMemo(windowTexture, [])
  const t = WALL_THICKNESS / M
  const length = (opening.to - opening.from) / M
  const height = (opening.top - opening.bottom) / M
  const mid = (opening.from + opening.to) / 2
  const alongX = opening.side === '-z' || opening.side === '+z'
  const [wx, wz] = alongX ? toWorld(room, mid, 0) : toWorld(room, 0, mid)
  const halfW = room.w / 2 / M
  const halfD = room.d / 2 / M
  const position: [number, number, number] = alongX
    ? [wx, opening.bottom / M, opening.side === '-z' ? -halfD - t / 2 : halfD + t / 2]
    : [opening.side === '-x' ? -halfW - t / 2 : halfW + t / 2, opening.bottom / M, wz]
  const item: Item = {
    id: `opening-${opening.side}-${opening.from}`,
    name: kind === 'door' ? '문' : '창문',
    kind: 'furniture',
    model: kind === 'door' ? 'frontdoor' : 'window',
    w: opening.to - opening.from,
    d: kind === 'door' ? WALL_THICKNESS : 100,
    h: opening.top - opening.bottom,
    x: 0,
    z: 0,
    rot: 0,
    color: '#d9d5cc',
  }
  return (
    <group position={position} rotation={[0, FACING[opening.side], 0]}>
      <ItemModel item={item} />
      {kind === 'window' && (
        <mesh position={[0, height / 2, -t / 2 - 0.02]}>
          <planeGeometry args={[length, height]} />
          <meshBasicMaterial map={view} />
        </mesh>
      )}
    </group>
  )
}

// 문이 열리는 부채꼴. 경첩은 벽 끝(-쪽 벽은 from, +쪽 벽은 to)에 있다고 본다.
function DoorSwing({ room, door }: { room: Room; door: Opening }) {
  const width = (door.to - door.from) / M
  const plus = door.side === '+x' || door.side === '+z'
  const along = plus ? door.to : door.from
  const [hx, hz] = door.side === '-x' || door.side === '+x' ? toWorld(room, door.side === '-x' ? 0 : room.w, along) : toWorld(room, along, door.side === '-z' ? 0 : room.d)
  return (
    <mesh position={[hx, 0.004, hz]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[width, 32, plus ? Math.PI / 2 : -Math.PI / 2, Math.PI / 2]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.18} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CustomShell({ room, floorMaterials }: { room: Room; floorMaterials: THREE.Material[] }) {
  const { door, windows } = room.openings!
  const cuts = [door, ...windows]
  const on = (side: Side) => cuts.filter((cut) => cut.side === side)
  return (
    <group>
      <mesh position={[0, -0.1, 0]} material={floorMaterials} receiveShadow>
        <boxGeometry args={[room.w / M, 0.2, room.d / M]} />
      </mesh>
      <Grid position={[0, -0.201, 0]} args={[40, 40]} cellSize={0.5} sectionSize={2} cellColor="#323336" sectionColor="#3a3b3f" cellThickness={0.5} sectionThickness={0.8} fadeDistance={40} infiniteGrid />

      <Wall room={room} side="-z" pieces={wallPieces(room, room.w, on('-z'))} />
      <Wall room={room} side="+z" pieces={wallPieces(room, room.w, on('+z'))} />
      <Wall room={room} side="-x" pieces={wallPieces(room, room.d, on('-x'))} />
      <Wall room={room} side="+x" pieces={wallPieces(room, room.d, on('+x'))} />

      <OpeningModel room={room} opening={door} kind="door" />
      {windows.map((win, index) => (
        <OpeningModel key={index} room={room} opening={win} kind="window" />
      ))}
      <DoorSwing room={room} door={door} />
    </group>
  )
}

export default function RoomShell({ room }: { room: Room }) {
  const floorMaterials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#202124', roughness: 0.9 })
    const top = new THREE.MeshStandardMaterial({ map: plankTexture(room), roughness: 0.85, emissive: '#2a2b2e' })
    return [side, side, top, side, side, side]
  }, [room])
  if (room.openings) return <CustomShell room={room} floorMaterials={floorMaterials} />
  const wide = isWideRoom(room)
  const door = doorSpan(room)
  const win = windowSpan(room)
  const full = (length: number): Piece[] => [{ from: 0, to: length, bottom: 0, top: room.h }]

  const leftPieces: Piece[] = [
    { from: 0, to: door.zFrom, bottom: 0, top: room.h },
    { from: door.zTo, to: room.d, bottom: 0, top: room.h },
    { from: door.zFrom, to: door.zTo, bottom: DOOR_HEIGHT, top: room.h },
  ].filter((piece) => piece.to > piece.from && piece.top > piece.bottom)

  const winTop = Math.min(WINDOW_TOP, room.h - 100)
  const rightPieces: Piece[] = [
    { from: 0, to: win.zFrom, bottom: 0, top: room.h },
    { from: win.zTo, to: room.d, bottom: 0, top: room.h },
    { from: win.zFrom, to: win.zTo, bottom: 0, top: WINDOW_BOTTOM },
    { from: win.zFrom, to: win.zTo, bottom: winTop, top: room.h },
  ].filter((piece) => piece.to > piece.from && piece.top > piece.bottom)

  const [hingeX, hingeZ] = toWorld(room, 0, door.zFrom)
  const [, winMidZ] = toWorld(room, 0, (win.zFrom + win.zTo) / 2)
  const [curtainX] = toWorld(room, room.w - CURTAIN_GAP / 2, 0)
  const winLength = (win.zTo - win.zFrom) / M
  const winHeight = (winTop - WINDOW_BOTTOM) / M

  return (
    <group>
      <mesh position={[0, -0.1, 0]} material={floorMaterials} receiveShadow>
        <boxGeometry args={[room.w / M, 0.2, room.d / M]} />
      </mesh>
      <Grid
        position={[0, -0.201, 0]}
        args={[40, 40]}
        cellSize={0.5}
        sectionSize={2}
        cellColor="#323336"
        sectionColor="#3a3b3f"
        cellThickness={0.5}
        sectionThickness={0.8}
        fadeDistance={40}
        infiniteGrid
      />

      <Wall room={room} side="-z" pieces={full(room.w)} />
      <Wall room={room} side="+z" pieces={full(room.w)} />
      <Wall room={room} side="-x" pieces={leftPieces} />
      <Wall room={room} side="+x" pieces={rightPieces} />

      <WindowView
        x={room.w / 2 / M + WALL_THICKNESS / 2 / M}
        midZ={winMidZ}
        length={winLength}
        height={winHeight}
        centerY={(WINDOW_BOTTOM + winTop) / 2 / M}
      />
      {wide && (
        <>
          <WallLamp position={[toWorld(room, 1000, 0)[0], 1.55, -room.d / 2 / M + 0.02]} />
          {[1050, 1650].map((bottom) => (
            <group
              key={bottom}
              position={[room.w / 2 / M - 0.02, bottom / M, toWorld(room, 0, 800)[1]]}
              rotation={[0, -Math.PI / 2, 0]}
            >
              <OpenBox w={0.75} h={0.55} d={0.16} color="#4a494c" />
              <mesh position={[-0.2, 0.08, 0]}>
                <boxGeometry args={[0.1, 0.12, 0.1]} />
                <meshStandardMaterial color={bottom > 1200 ? '#c8553d' : '#e2b94a'} roughness={0.7} />
              </mesh>
            </group>
          ))}
        </>
      )}
      <mesh position={[curtainX, 0.003, winMidZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CURTAIN_GAP / M, winLength]} />
        <meshBasicMaterial color="#35c5f0" transparent opacity={0.18} />
      </mesh>
      <Tag position={[curtainX, 0.02, winMidZ]} tone="sky">{`창 · 커튼 ${CURTAIN_GAP / 10}cm`}</Tag>

      <mesh position={[hingeX, 0.004, hingeZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[room.doorWidth / M, 32, -Math.PI / 2, Math.PI / 2]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[hingeX + room.doorWidth / 2 / M, DOOR_HEIGHT / 2 / M, hingeZ - 0.02]} castShadow>
        <boxGeometry args={[room.doorWidth / M, DOOR_HEIGHT / M, 0.04]} />
        <meshStandardMaterial color="#d9d3c6" roughness={0.6} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <Tag position={[hingeX + room.doorWidth / 2 / M, 0.02, hingeZ + room.doorWidth / 2 / M]} tone="amber">
        {`문 ${room.doorWidth / 10}cm`}
      </Tag>
    </group>
  )
}
