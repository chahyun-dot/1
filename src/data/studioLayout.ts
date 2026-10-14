import { BED_SET_SUFFIX, FURNITURE, MODEL_BY_FURNITURE, categoryOf, type FurnitureCategory } from '@/data/furniture'
import { PRODUCT, WHEEL_DEFAULT } from '@/data/catalog'
import { DOOR_HEIGHT } from '@/lib/room'
import { placeUnderDesk } from '@/lib/desk'
import type { Item, Opening, Room, Rot } from '@/lib/types'

// "내 공간에 맞는지 확인하기" 팝업의 6×6m 방. 데모 가구와 책상 아래 서랍장(피하 서랍장)으로 시작한다.
export type RoomDims = { w: number; d: number; h: number; doorWidth: number }

export const STUDIO_DIMS: RoomDims = { w: 6000, d: 6000, h: 2600, doorWidth: 900 }

export const MAX_WINDOWS = 4

const WINDOW_BOTTOM = 900
const WINDOW_TOP = 2200

// 창문은 오른쪽 벽 둘, 앞쪽 벽 둘의 자리에서 차례로 생기고 없어진다.
const windowSlots = ({ w, d }: RoomDims): Opening[] => ([
  { side: '+x', from: d * 0.17, to: d * 0.42, bottom: WINDOW_BOTTOM, top: WINDOW_TOP },
  { side: '+x', from: d * 0.58, to: d * 0.83, bottom: WINDOW_BOTTOM, top: WINDOW_TOP },
  { side: '+z', from: w * 0.1, to: w * 0.35, bottom: WINDOW_BOTTOM, top: WINDOW_TOP },
  { side: '+z', from: w * 0.67, to: w * 0.92, bottom: WINDOW_BOTTOM, top: WINDOW_TOP },
] as Opening[]).map((slot) => ({ ...slot, from: Math.round(slot.from), to: Math.round(slot.to) }))

export const studioRoom = (dims: RoomDims, windowCount: number): Room => {
  const doorFrom = Math.max(0, dims.d - 150 - dims.doorWidth)
  return {
    ...dims,
    openings: {
      door: { side: '-x', from: doorFrom, to: doorFrom + dims.doorWidth, bottom: 0, top: DOOR_HEIGHT },
      windows: windowSlots(dims).slice(0, windowCount),
    },
  }
}

const COLOR: Record<FurnitureCategory, string> = { 가구: '#9aa6b2', 소품: '#d1b58a', '벽·천장': '#7fb0cf' }

export const BED_ID = 'Xs_Qb6C3D61BBB72B9B4159'
export const DRAWER_ID = 'YSCLdDz3A9D4CDED05E451C'
export const SHELF_ID = 'ZHCng6-9DA238A1CE5340E1'
export const SOFA_ID = 'YBp1W4_021584BC9C234BDF'
export const LAMP_ID = 'Yq8D3hC589DB8DF6B7D4EC5'
export const TABLE_ID = 'YSEBSV826EADFB11D0F4FDD'
export const DINING_CHAIR_ID = 'XNpyDGd4339E9DBCEE941AC'
export const DESK_ID = 'YSZphlN2272C00BB9264030'
export const DESK_CHAIR_ID = '83470177e6504b21bad9d2d15b6d5fba'
export const BIG_RUG_ID = 'YvLiCvk04866276686B40C7'
export const ROUND_RUG_ID = 'X5S4t1X5DE143AD22764FF9'

const RUG_IDS = new Set([BIG_RUG_ID, ROUND_RUG_ID])

// [상품 id, 가운데 x, 가운데 z, 방향(0~3), 가로, 깊이, 높이]
type Row = [string, number, number, Rot, number, number, number]

const make = ([id, x, z, rot, w, d, h]: Row): Item => {
  const furniture = FURNITURE.find((f) => f.id === id)!
  const spec = MODEL_BY_FURNITURE[id]
  const item: Item = {
    id: `${id}#1`,
    name: spec?.model === 'bedset' ? `${furniture.name}${BED_SET_SUFFIX}` : furniture.name,
    kind: RUG_IDS.has(id) ? 'rug' : 'furniture',
    model: spec?.model ?? 'box',
    w,
    d,
    h,
    x,
    z,
    rot,
    color: COLOR[categoryOf(furniture)],
    image: furniture.image,
  }
  if (spec?.elevation) item.elevation = spec.elevation
  return item
}

// 데스크는 책상 상세 보기가 쓰는 값(다리 간격, 상판 아래 높이)을 가진다. 상판 두께 30mm, 다리는 가장자리에서 120mm 안쪽.
const DESK_SIZE = { w: 1600, d: 800, h: 740 }
const DESK_TOP_THICK = 30
const DESK_LEG_INSET = 120
const DESK_LEG_FOOT = 70

export const studioItems = (productColor: string): Item[] => {
  const desk: Item = {
    ...make([DESK_ID, 3300, 5100, 1, DESK_SIZE.w, DESK_SIZE.d, DESK_SIZE.h]),
    underClearance: DESK_SIZE.h - DESK_TOP_THICK,
    legGap: DESK_SIZE.w - DESK_LEG_INSET * 2 - DESK_LEG_FOOT,
  }
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
  const placed = { ...product, ...placeUnderDesk(desk, product, 'right') }
  return [
    make([ROUND_RUG_ID, 700, 2750, 0, 1000, 1000, 5]),
    make([BIG_RUG_ID, 4400, 2400, 0, 1494, 1697, 24]),
    make([BED_ID, 700, 1100, 0, 1125, 2098, 1058]),
    make([DRAWER_ID, 1560, 260, 0, 424, 501, 595]),
    make([SHELF_ID, 2500, 190, 0, 800, 380, 1741]),
    make([SOFA_ID, 4400, 405, 0, 1450, 810, 800]),
    make([LAMP_ID, 5500, 520, 0, 361, 972, 2050]),
    make([TABLE_ID, 4400, 2400, 0, 1000, 1000, 739]),
    { ...make([DINING_CHAIR_ID, 3628, 2400, 1, 444, 424, 851]), id: `${DINING_CHAIR_ID}#1` },
    { ...make([DINING_CHAIR_ID, 4400, 3172, 2, 444, 424, 851]), id: `${DINING_CHAIR_ID}#2` },
    desk,
    make([DESK_CHAIR_ID, 4060, 5400, 3, 718, 681, 1156]),
    placed,
  ]
}

// 상세 보기로 묶이는 가구 세 묶음. 값은 상품 id(같은 상품이 여러 개면 모두).
export type ClusterId = 'bed' | 'desk' | 'table'

export const CLUSTERS: { id: ClusterId; title: string; keys: string[]; pairs: [string, string][] }[] = [
  { id: 'bed', title: '침대 & 3단 서랍 수납장', keys: [BED_ID, DRAWER_ID], pairs: [[BED_ID, DRAWER_ID]] },
  { id: 'desk', title: '책상 & 의자 & 서랍장', keys: [DESK_ID, DESK_CHAIR_ID, 'product'], pairs: [] },
  { id: 'table', title: '원형 테이블 & 의자 & 소파', keys: [TABLE_ID, DINING_CHAIR_ID, SOFA_ID], pairs: [[TABLE_ID, DINING_CHAIR_ID], [TABLE_ID, SOFA_ID]] },
]

export const keyOf = (item: Item) => item.id.split('#')[0]

export const clusterOf = (item: Item) => CLUSTERS.find((cluster) => cluster.keys.includes(keyOf(item))) ?? null
