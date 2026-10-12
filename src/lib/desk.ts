import type { Item, Rect, Rot } from '@/lib/types'

export const DESK_TOP = 25
export const LEG_INSET = 100
export const LEG_W = 60
export const FOOT_W = 70

const TURN: Record<Rot, [number, number]> = { 0: [1, 0], 1: [0, 1], 2: [-1, 0], 3: [0, -1] }

// 책상 중심을 원점으로, 책상 앞쪽을 +z로 두는 좌표계로 바꾼다.
export const toDeskLocal = (desk: Item, x: number, z: number): [number, number] => {
  const [cos, sin] = TURN[desk.rot]
  const dx = x - desk.x
  const dz = z - desk.z
  return [dx * cos - dz * sin, dx * sin + dz * cos]
}

export const fromDeskLocal = (desk: Item, lx: number, lz: number): [number, number] => {
  const [cos, sin] = TURN[desk.rot]
  return [desk.x + lx * cos + lz * sin, desk.z - lx * sin + lz * cos]
}

export const defaultLegGap = (w: number) => w - LEG_INSET * 2 - FOOT_W

export const maxLegGap = (w: number) => w - FOOT_W * 2

// 다리 안쪽 폭은 바닥 받침(FOOT_W) 안쪽 면 사이 거리다.
export const legInner = (desk: Item) => (desk.legGap ?? defaultLegGap(desk.w)) / 2

export const legCenter = (desk: Item) => legInner(desk) + FOOT_W / 2

export const undersideOf = (desk: Item) => desk.underClearance ?? desk.h - DESK_TOP

export type DeskMeasure = {
  relRot: Rot
  rect: Rect
  inner: number
  underside: number
  overlapsTop: boolean
  hitsLeg: boolean
  leftLeg: number
  rightLeg: number
  frontEdge: number
  backEdge: number
  topGap: number
  sideToDesk: number | null
}

export const measureAgainstDesk = (desk: Item, item: Item): DeskMeasure => {
  const [lx, lz] = toDeskLocal(desk, item.x, item.z)
  const relRot = (((item.rot - desk.rot) % 4) + 4) % 4 as Rot
  const hw = (relRot % 2 ? item.d : item.w) / 2
  const hd = (relRot % 2 ? item.w : item.d) / 2
  const rect = { minX: lx - hw, maxX: lx + hw, minZ: lz - hd, maxZ: lz + hd }
  const halfW = desk.w / 2
  const halfD = desk.d / 2
  const inner = legInner(desk)
  const overlapsTop = rect.minX < halfW && rect.maxX > -halfW && rect.minZ < halfD && rect.maxZ > -halfD
  const sideToDesk = overlapsTop
    ? null
    : rect.minX >= halfW
      ? rect.minX - halfW
      : rect.maxX <= -halfW
        ? -halfW - rect.maxX
        : null
  return {
    relRot,
    rect,
    inner,
    underside: undersideOf(desk),
    overlapsTop,
    hitsLeg: overlapsTop && (rect.minX < -inner || rect.maxX > inner),
    leftLeg: rect.minX + inner,
    rightLeg: inner - rect.maxX,
    frontEdge: halfD - rect.maxZ,
    backEdge: rect.minZ + halfD,
    topGap: undersideOf(desk) - item.h,
    sideToDesk,
  }
}

export type LegSide = 'left' | 'right'

export type UnderOffsets = { side: LegSide; leg: number; back: number }

export const placeUnderDesk = (desk: Item, item: Item, side: LegSide, gap = 30, back = 30): { x: number; z: number; rot: Rot } => {
  const inner = legInner(desk)
  const lx = side === 'right' ? inner - gap - item.w / 2 : -inner + gap + item.w / 2
  const lz = -desk.d / 2 + item.d / 2 + back
  const [x, z] = fromDeskLocal(desk, lx, lz)
  return { x, z, rot: desk.rot }
}

// 책상 아래에 있으면 가까운 다리 쪽과 다리·뒤 간격을 돌려준다.
export const underOffsets = (desk: Item, item: Item): UnderOffsets | null => {
  const m = measureAgainstDesk(desk, item)
  if (!m.overlapsTop) return null
  const side: LegSide = m.leftLeg <= m.rightLeg ? 'left' : 'right'
  return { side, leg: Math.round(side === 'left' ? m.leftLeg : m.rightLeg), back: Math.round(m.backEdge) }
}

export const placeBesideDesk = (desk: Item, item: Item, gap = 50): { x: number; z: number; rot: Rot } => {
  const lx = desk.w / 2 + gap + item.w / 2
  const lz = -desk.d / 2 + item.d / 2
  const [x, z] = fromDeskLocal(desk, lx, lz)
  return { x, z, rot: desk.rot }
}
