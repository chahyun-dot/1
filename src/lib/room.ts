import type { Rect, Room, Side } from '@/lib/types'

export const WALL_THICKNESS = 160
export const DOOR_HEIGHT = 2100
export const CURTAIN_GAP = 200

// 문은 왼쪽 벽(x=0) 앞쪽 끝, 창은 오른쪽 벽(x=room.w)에 둔다.
export const doorSpan = (room: Room) => {
  const zFrom = Math.max(0, room.d - 150 - room.doorWidth)
  return { zFrom, zTo: zFrom + room.doorWidth }
}

export const doorSwingRect = (room: Room): Rect => {
  const door = room.openings?.door
  if (door) {
    const width = door.to - door.from
    if (door.side === '-x') return { minX: 0, maxX: width, minZ: door.from, maxZ: door.to }
    if (door.side === '+x') return { minX: room.w - width, maxX: room.w, minZ: door.from, maxZ: door.to }
    if (door.side === '-z') return { minX: door.from, maxX: door.to, minZ: 0, maxZ: width }
    return { minX: door.from, maxX: door.to, minZ: room.d - width, maxZ: room.d }
  }
  const { zFrom, zTo } = doorSpan(room)
  return { minX: 0, maxX: room.doorWidth, minZ: zFrom, maxZ: zTo }
}

// 이미지처럼 책장·침대·소파·책상이 모두 들어가는 넓은 방인지.
export const isWideRoom = (room: Room) => room.w >= 3800 && room.d >= 3600

export const windowSpan = (room: Room) => {
  if (room.d >= 5000) {
    const from = room.d * 0.58
    return { zFrom: from, zTo: Math.min(from + 1800, room.d - 300) }
  }
  const zFrom = Math.min(700, room.d * 0.15)
  const zTo = Math.max(zFrom + 1000, room.d - 1600)
  return { zFrom, zTo: Math.min(zTo, room.d - 300) }
}

export const curtainRect = (room: Room): Rect => {
  const { zFrom, zTo } = windowSpan(room)
  return { minX: room.w - CURTAIN_GAP, maxX: room.w, minZ: zFrom, maxZ: zTo }
}

const curtainOf = (room: Room, side: Side, from: number, to: number): Rect => {
  if (side === '-x') return { minX: 0, maxX: CURTAIN_GAP, minZ: from, maxZ: to }
  if (side === '+x') return { minX: room.w - CURTAIN_GAP, maxX: room.w, minZ: from, maxZ: to }
  if (side === '-z') return { minX: from, maxX: to, minZ: 0, maxZ: CURTAIN_GAP }
  return { minX: from, maxX: to, minZ: room.d - CURTAIN_GAP, maxZ: room.d }
}

// 창마다 커튼 라인이 있다. 기본 방은 오른쪽 벽 창 하나.
export const curtainRects = (room: Room): Rect[] =>
  room.openings ? room.openings.windows.map((win) => curtainOf(room, win.side, win.from, win.to)) : [curtainRect(room)]

export const toWorld = (room: Room, x: number, z: number): [number, number] => [
  (x - room.w / 2) / 1000,
  (z - room.d / 2) / 1000,
]

export const fromWorld = (room: Room, wx: number, wz: number): [number, number] => [
  wx * 1000 + room.w / 2,
  wz * 1000 + room.d / 2,
]
