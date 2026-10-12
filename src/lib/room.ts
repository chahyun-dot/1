import type { Rect, Room } from '@/lib/types'

export const WALL_THICKNESS = 160
export const DOOR_HEIGHT = 2100
export const CURTAIN_GAP = 200

// 문은 왼쪽 벽(x=0) 앞쪽 끝, 창은 오른쪽 벽(x=room.w)에 둔다.
export const doorSpan = (room: Room) => {
  const zFrom = Math.max(0, room.d - 150 - room.doorWidth)
  return { zFrom, zTo: zFrom + room.doorWidth }
}

export const doorSwingRect = (room: Room): Rect => {
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

export const toWorld = (room: Room, x: number, z: number): [number, number] => [
  (x - room.w / 2) / 1000,
  (z - room.d / 2) / 1000,
]

export const fromWorld = (room: Room, wx: number, wz: number): [number, number] => [
  wx * 1000 + room.w / 2,
  wz * 1000 + room.d / 2,
]
