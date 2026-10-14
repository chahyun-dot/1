import { PRODUCT, WHEEL_DEFAULT } from '@/data/catalog'
import { PLANNER_ROOM, plannerItems } from '@/data/plannerLayout'
import { placeUnderDesk } from '@/lib/desk'
import { footprint } from '@/lib/fit'
import { DOOR_HEIGHT } from '@/lib/room'
import type { Item, Opening, Room } from '@/lib/types'

// "내 공간에 맞는지 확인하기" 팝업의 처음 화면. 데모(#/demo)와 같은 플래너 방·가구에 책상 아래 마켓비 피하 서랍장만 더했다.
export type RoomDims = { w: number; d: number; h: number; doorWidth: number }

// 방을 4.2×4.2m 에서 4.5×4.5m 로 넓힌다. 늘어난 300mm 는 가구가 걸치지 않는 선(가로 2875mm, 세로 2150mm)에 끼워 넣어서,
// 그 선보다 오른쪽·아래쪽에 있는 가구와 벽의 문·창은 300mm 밀리고 나머지는 그대로 둔다(붙어 있던 가구가 떨어지지 않는다).
const GROW = 300
const CUT_X = 2875
const CUT_Z = 2150
const shiftX = (v: number) => (v > CUT_X ? v + GROW : v)
const shiftZ = (v: number) => (v > CUT_Z ? v + GROW : v)

export const STUDIO_DIMS: RoomDims = { w: PLANNER_ROOM.w + GROW, d: PLANNER_ROOM.d + GROW, h: PLANNER_ROOM.h, doorWidth: PLANNER_ROOM.doorWidth }

export const STUDIO_PRESET = { id: 'planner', label: '플래너 배치 · 책상 아래 (4.5×4.5m)' }

const grownOpening = (opening: Opening): Opening => {
  const along = opening.side === '-x' || opening.side === '+x' ? shiftZ : shiftX
  return { ...opening, from: along(opening.from), to: along(opening.to) }
}

export const MAX_WINDOWS = 4

// 방 치수를 바꾸면 플래너 좌표의 문·창이 맞지 않아서, 오른쪽 벽 둘·앞쪽 벽 둘의 자리에 새로 낸다.
const windowSlots = ({ w, d }: RoomDims): Opening[] =>
  ([
    { side: '+x', from: d * 0.17, to: d * 0.42, bottom: 990, top: 2206 },
    { side: '+x', from: d * 0.58, to: d * 0.83, bottom: 990, top: 2206 },
    { side: '+z', from: w * 0.1, to: w * 0.35, bottom: 990, top: 2206 },
    { side: '+z', from: w * 0.67, to: w * 0.92, bottom: 990, top: 2206 },
  ] as Opening[]).map((slot) => ({ ...slot, from: Math.round(slot.from), to: Math.round(slot.to) }))

const sameDims = (a: RoomDims, b: RoomDims) => a.w === b.w && a.d === b.d && a.h === b.h && a.doorWidth === b.doorWidth

export const studioRoom = (dims: RoomDims, windowCount: number): Room => {
  if (sameDims(dims, STUDIO_DIMS)) {
    const { door, windows } = PLANNER_ROOM.openings!
    return { ...PLANNER_ROOM, ...dims, openings: { door: grownOpening(door), windows: windows.slice(0, windowCount).map(grownOpening) } }
  }
  const doorFrom = Math.max(0, dims.d - 150 - dims.doorWidth)
  return {
    ...dims,
    openings: {
      door: { side: '-x', from: doorFrom, to: doorFrom + dims.doorWidth, bottom: 0, top: DOOR_HEIGHT },
      windows: windowSlots(dims).slice(0, windowCount),
    },
  }
}

export const BED_ID = 'Xs_Qb6C3D61BBB72B9B4159'
export const DRAWER_ID = 'YSCLdDz3A9D4CDED05E451C'
export const SOFA_ID = 'YBp1W4_021584BC9C234BDF'
export const TABLE_ID = 'YSEBSV826EADFB11D0F4FDD'
export const DINING_CHAIR_ID = 'XNpyDGd4339E9DBCEE941AC'
export const DESK_ID = 'YSZphlN2272C00BB9264030'
export const DESK_CHAIR_ID = '83470177e6504b21bad9d2d15b6d5fba'
export const BIG_RUG_ID = 'YvLiCvk04866276686B40C7'
export const ROUND_RUG_ID = 'X5S4t1X5DE143AD22764FF9'

// 3D 에서만 뺀다(데모와 상품 종류 목록에는 그대로 있다).
const HIDDEN_IN_STUDIO = new Set(['YSJfCSW3C8249DE736F456A', 'YneAflHA33DBE2534ED4DC7'])

// 데모 책상(높이 630mm)은 서랍장(685mm)이 들어가도록 높이만 740mm 로 키운다. 다리 간격은 가장자리에서 120mm 안쪽, 상판 두께 30mm 기준.
const DESK_HEIGHT = 740
const DESK_TOP_THICK = 30
const DESK_LEG_INSET = 120
const DESK_LEG_FOOT = 70

export const keyOf = (item: Item) => item.id.split('#')[0]

export const studioItems = (productColor: string): Item[] => {
  const all = plannerItems()
    .filter((item) => !HIDDEN_IN_STUDIO.has(keyOf(item)))
    .map((item) => ({ ...item, x: shiftX(item.x), z: shiftZ(item.z) }))
  const oldDesk = all.find((item) => keyOf(item) === DESK_ID)!
  const raise = DESK_HEIGHT - oldDesk.h
  const area = footprint(oldDesk)
  const desk: Item = {
    ...oldDesk,
    h: DESK_HEIGHT,
    underClearance: DESK_HEIGHT - DESK_TOP_THICK,
    legGap: oldDesk.w - DESK_LEG_INSET * 2 - DESK_LEG_FOOT,
  }
  // 책상 위에 놓인 물건(노트북, 키보드, 모니터암, TV 등)은 책상이 높아진 만큼 올린다.
  const onDesk = (item: Item) => (item.elevation ?? 0) >= 500 && item.x > area.minX && item.x < area.maxX && item.z > area.minZ && item.z < area.maxZ
  const furniture = all.map((item) => (item === oldDesk ? desk : onDesk(item) ? { ...item, elevation: (item.elevation ?? 0) + raise } : item))

  const product: Item = {
    id: 'product',
    name: PRODUCT.shortName,
    kind: 'product',
    model: 'cabinet',
    w: PRODUCT.size.w,
    d: PRODUCT.size.d,
    h: PRODUCT.bodyH + WHEEL_DEFAULT,
    caster: WHEEL_DEFAULT,
    x: 0,
    z: 0,
    rot: 0,
    color: productColor,
  }
  return [...furniture, { ...product, ...placeUnderDesk(desk, product, 'right') }]
}

// 상세 보기로 묶이는 가구 세 묶음. 값은 상품 id(같은 상품이 여러 개면 모두).
export type ClusterId = 'bed' | 'desk' | 'table'

export const CLUSTERS: { id: ClusterId; title: string; keys: string[]; pairs: [string, string][] }[] = [
  { id: 'bed', title: '침대 & 3단 서랍 수납장', keys: [BED_ID, DRAWER_ID, ROUND_RUG_ID], pairs: [[BED_ID, DRAWER_ID]] },
  { id: 'desk', title: '책상 & 의자 & 서랍장', keys: [DESK_ID, DESK_CHAIR_ID, 'product'], pairs: [] },
  { id: 'table', title: '원형 테이블 & 의자 & 소파', keys: [TABLE_ID, DINING_CHAIR_ID, SOFA_ID, BIG_RUG_ID], pairs: [[TABLE_ID, DINING_CHAIR_ID], [TABLE_ID, SOFA_ID]] },
]

export const clusterOf = (item: Item) => CLUSTERS.find((cluster) => cluster.keys.includes(keyOf(item))) ?? null
