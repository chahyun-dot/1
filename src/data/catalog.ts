import { DESK_TOP, defaultLegGap, placeUnderDesk } from '@/lib/desk'
import { isWideRoom } from '@/lib/room'
import type { Item, Room } from '@/lib/types'

export const PRODUCT = {
  brand: '마켓비',
  name: '피하 서랍장 4.1단',
  shortName: '피하 서랍장 4.1단',
  listPrice: 64680,
  discount: 16,
  price: 53900,
  couponPrice: 46354,
  rating: 4.5,
  reviews: 15236,
  scraps: 99631,
  size: { w: 280, d: 410, h: 690 },
  // 본체 높이(바퀴 제외)와 기본 바퀴 높이. 바퀴 포함 690mm = 640 + 50.
  bodyH: 640,
}

// 색상 옵션: 이름 · 가격은 오늘의집 상품 페이지 그대로. hex는 3D 모델용 근사색.
export const COLORS = [
  { id: 'lightgray', label: '라이트그레이 2290.7930', price: 56900, hex: '#c6c9cc' },
  { id: 'red', label: '레드 1966.7415', price: 54600, hex: '#b8352f' },
  { id: 'black', label: '블랙 4583.7527', price: 61900, hex: '#2a2b2e' },
  { id: 'white', label: '화이트 2981.3310', price: 53900, hex: '#f1f1ee' },
  { id: 'darkgray', label: '다크그레이 5389.0718', price: 53900, hex: '#4a4d52' },
  { id: 'solidbeige', label: '솔리드베이지 5352.6676', price: 53900, hex: '#d8c8b0' },
  { id: 'darkgreen', label: '다크그린 4847.2416', price: 58600, hex: '#2f4a3f' },
  { id: 'yellow', label: '옐로우 3002.7435', price: 59900, hex: '#e8c34a' },
  { id: 'cream', label: '크림 7537.3107', price: 58300, hex: '#ede3cd' },
  { id: 'pink', label: '핑크 6562.0674', price: 54600, hex: '#e8a7b5' },
] as const

export type ColorId = (typeof COLORS)[number]['id']

export const ADDONS = [{ id: 'finsert', label: 'FINSERT 수납함 KS1035DSW 라이트그레이', price: 15900 }] as const

export const ASSEMBLY_PRICE = 29000

export const WHEEL_DEFAULT = 50
export const WHEEL_MIN = 20
export const WHEEL_MAX = 100

export const colorOf = (id: string) => COLORS.find((c) => c.id === id) ?? COLORS[3]

export const DEFAULT_ROOM: Room = { w: 6000, d: 6000, h: 2600, doorWidth: 900 }

export const ROOM_PRESETS: { id: string; label: string; room: Room }[] = [
  { id: 'bedroom', label: '넓은 침실 · 책상 아래 (6×6m)', room: DEFAULT_ROOM },
]

const DESK = { w: 1200, d: 600, h: 740, left: 300 }
const BED = { w: 1100, d: 2000, h: 900 }

const makeDesk = (x: number, z: number, rot: Item['rot']): Item => ({
  id: 'desk',
  name: '책상',
  kind: 'furniture',
  model: 'desk',
  w: DESK.w,
  d: DESK.d,
  h: DESK.h,
  x,
  z,
  rot,
  color: '#efe9d8',
  underClearance: DESK.h - DESK_TOP,
  legGap: defaultLegGap(DESK.w),
})

const makeChair = (x: number, z: number, rot: Item['rot']): Item => ({
  id: 'chair',
  name: '의자',
  kind: 'furniture',
  model: 'chair',
  w: 500,
  d: 500,
  h: 850,
  x,
  z,
  rot,
  color: '#2f3033',
})

// 이미지 속 방: 뒷벽(z=0)을 따라 침대 · 책장 · 소파 · 화분, 가운데 둥근 러그,
// 앞쪽에 오른쪽 벽(창)을 바라보는 책상과 스툴. 좌표는 방 크기에 비례해 놓는다.
const wideFurniture = (room: Room): Item[] => {
  const { w, d } = room
  const decor = (item: Omit<Item, 'kind'> & { kind?: Item['kind'] }): Item => ({ kind: 'furniture', ...item })
  const deskX = w * 0.55
  const deskZ = d - 800
  return [
    decor({ id: 'rug-bed', name: '침대 러그', kind: 'rug', model: 'rug', w: 2600, d: 3200, h: 8, x: 1300, z: 1700, rot: 0, color: '#55565c' }),
    decor({ id: 'rug-round', name: '둥근 러그', kind: 'rug', model: 'roundrug', w: 2800, d: 2800, h: 10, x: w * 0.72, z: 1700, rot: 0, color: '#1f2433' }),
    // 책상은 짧은 쪽이 벽을 향하고 앞(의자 쪽)이 오른쪽 벽을 본다.
    makeDesk(deskX, deskZ, 1),
    // 의자는 서랍장(오른쪽 다리 쪽)을 막지 않게 반대쪽 다리 쪽으로 빼 둔다.
    makeChair(deskX + DESK.d / 2 + 200, deskZ + 250, 3),
    decor({ id: 'bed', name: '침대', model: 'bed', w: 1600, d: 2100, h: 1000, x: 1000, z: 1050, rot: 0, color: '#3a3a3d' }),
    decor({ id: 'shelf', name: '책장', model: 'shelf', w: 650, d: 450, h: 850, x: 2350, z: 225, rot: 0, color: '#3d3c3f' }),
    decor({ id: 'sofa', name: '소파', model: 'sofa', w: 1800, d: 900, h: 850, x: w * 0.65, z: 450, rot: 0, color: '#f1efea' }),
    decor({ id: 'plant', name: '화분', model: 'plant', w: 450, d: 450, h: 1000, x: w - 450, z: 350, rot: 0, color: '#2f8a4a' }),
  ]
}

export const createFurniture = (room: Room): Item[] => {
  if (isWideRoom(room)) return wideFurniture(room)
  return [
    makeDesk(DESK.left + DESK.w / 2, DESK.d / 2, 0),
    makeChair(DESK.left + 350, DESK.d + 200, 2),
    {
      id: 'bed',
      name: '침대',
      kind: 'furniture',
      model: 'bed',
      w: BED.w,
      d: BED.d,
      h: BED.h,
      x: room.w - BED.w / 2,
      z: BED.d / 2,
      rot: 0,
      color: '#3a3a3d',
    },
  ]
}

export const createProduct = (room: Room, color: string): Item => {
  const { w, d } = PRODUCT.size
  const product: Item = {
    id: 'product',
    name: '서랍장',
    kind: 'product',
    model: 'cabinet',
    w,
    d,
    h: PRODUCT.bodyH + WHEEL_DEFAULT,
    caster: WHEEL_DEFAULT,
    x: 0,
    z: d / 2,
    rot: 0,
    color,
  }
  const desk = createFurniture(room).find((item) => item.model === 'desk')!
  return { ...product, ...placeUnderDesk(desk, product, 'right') }
}
