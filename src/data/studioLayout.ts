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
  // 왼쪽 벽 창은 그대로 둔다(두 창 사이 184mm 가 앞쪽 벽 창 간격과 같게).
  if (opening.side === '-x') return opening
  const along = opening.side === '+x' ? shiftZ : shiftX
  return { ...opening, from: along(opening.from), to: along(opening.to) }
}

export const MAX_WINDOWS = 4

// 창 아래 높이를 990 → 1300mm 로 올려(창 높이 1216 → 906mm) 침대 머리·책상·3단 서랍·모니터암처럼 낮은 가구가 벽에 붙어도 창 커튼 라인에 걸리지 않게 한다. 블라인드도 1300mm 부터 2290mm 까지로 맞춘다.
const WINDOW_SILL = 1300
const BLIND_HEIGHT = 2290 - WINDOW_SILL

// 방 치수를 바꾸면 플래너 좌표의 문·창이 맞지 않아서, 오른쪽 벽 둘·앞쪽 벽 둘의 자리에 새로 낸다.
const windowSlots = ({ w, d }: RoomDims): Opening[] =>
  ([
    { side: '+x', from: d * 0.17, to: d * 0.42, bottom: WINDOW_SILL, top: 2206 },
    { side: '+x', from: d * 0.58, to: d * 0.83, bottom: WINDOW_SILL, top: 2206 },
    { side: '+z', from: w * 0.1, to: w * 0.35, bottom: WINDOW_SILL, top: 2206 },
    { side: '+z', from: w * 0.67, to: w * 0.92, bottom: WINDOW_SILL, top: 2206 },
  ] as Opening[]).map((slot) => ({ ...slot, from: Math.round(slot.from), to: Math.round(slot.to) }))

const sameDims = (a: RoomDims, b: RoomDims) => a.w === b.w && a.d === b.d && a.h === b.h && a.doorWidth === b.doorWidth

export const studioRoom = (dims: RoomDims, windowCount: number): Room => {
  if (sameDims(dims, STUDIO_DIMS)) {
    const { door, windows } = PLANNER_ROOM.openings!
    return { ...PLANNER_ROOM, ...dims, openings: { door: grownOpening(door), windows: windows.slice(0, windowCount).map((win) => ({ ...grownOpening(win), bottom: WINDOW_SILL })) } }
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
  // 가구를 조금씩 옮겨 "앞쪽 여유 60cm"와 "창가 커튼 라인"(창에서 200mm) 주의를 없앤다(옮긴 이유는 각 줄 설명).
  const KEY = (k: string) => (item: Item) => keyOf(item) === k
  const move = (list: Item[], match: (item: Item) => boolean, patch: Partial<Item> | ((item: Item) => Partial<Item>)) =>
    list.map((item) => (match(item) ? { ...item, ...(typeof patch === 'function' ? patch(item) : patch) } : item))
  const hangerKeys = new Set(['YSBhD9T1E65915F80104295', 'YV8EVEF2D36EE1DB1D44CAB', 'XX-zmmq45F1867DE7EE462B', 'ZFFQHal586565A1F38B473C'])

  // 책상 위 물건(노트북, 키보드 등)은 책상이 높아진 만큼 올린다.
  const onDesk = (item: Item) => (item.elevation ?? 0) >= 500 && item.x > area.minX && item.x < area.maxX && item.z > area.minZ && item.z < area.maxZ
  let furniture = all.map((item) => (item === oldDesk ? desk : onDesk(item) ? { ...item, elevation: (item.elevation ?? 0) + raise } : item))

  // 책상 묶음: 책상을 왼쪽 벽에 붙이고(깊이 816mm 의 절반이 가운데) 그 위 물건과 의자도 같이 옮긴다. 의자는 서랍장(왼쪽 다리 쪽) 앞을 비우려고 170mm 위로.
  const deskShift = oldDesk.d / 2 - oldDesk.x
  furniture = move(furniture, (item) => keyOf(item) === DESK_ID || keyOf(item) === DESK_CHAIR_ID || onDesk(item), (item) => ({ x: item.x + deskShift }))
  furniture = move(furniture, KEY(DESK_CHAIR_ID), (item) => ({ z: item.z - 170 }))
  // 싱글 모니터암도 벽에 붙이고(가로 방향 길이 521mm 의 절반), 그 끝에 달린 TV 는 같이 옮긴다.
  const ARM_KEY = 'YjCJHDA8B714D95FB9D45DD'
  const armDelta = 260.5 - furniture.find(KEY(ARM_KEY))!.x
  furniture = move(furniture, (item) => keyOf(item) === ARM_KEY || keyOf(item) === 'ZGXmJUk293C2AE613ED4B4B', (item) => ({ x: item.x + armDelta }))
  // 왼쪽 벽 창 둘의 간격은 앞쪽 벽 창 둘의 간격(184mm)과 같다(방을 넓히며 벌어진 두 번째 창과 그 블라인드를 원래 자리로).
  furniture = move(furniture, (item) => keyOf(item) === 'E1632324621148B0' && item.x < 100 && item.z > 2150, (item) => ({ z: item.z - GROW }))
  // 블라인드는 창에 맞춰 1300mm 부터 걸게 한다.
  furniture = move(furniture, KEY('E1632324621148B0'), { elevation: WINDOW_SILL, h: BLIND_HEIGHT })
  // 침대 묶음: 침대 머리와 3단 수납형 서랍을 왼쪽 벽에 붙이고(서랍은 침대 머리 옆), 그 위 조명과 머리 위 액자는 같이.
  furniture = move(furniture, KEY(BED_ID), { x: 1049, z: 3702 })
  furniture = move(furniture, KEY(DRAWER_ID), { x: 250.5, z: 2888 })
  furniture = move(furniture, KEY('ZZHrOv2AC2EF05FF43243FB'), { x: 150.5, z: 2888 })
  furniture = move(furniture, KEY('X8kL5fT81A10556FC5447E5'), { z: 3726 })
  // 행거 묶음: 침대 발치와 60cm 띄워 옷 걸리는 면(+x)이 오른쪽 벽의 문을 보게 하고, 둥근 러그를 그 아래에 깐다.
  const hanger = all.find(KEY('YSBhD9T1E65915F80104295'))!
  furniture = move(furniture, (item) => hangerKeys.has(keyOf(item)), (item) => ({ x: 2868 + (item.x - hanger.x), z: 3500 + (item.z - hanger.z) }))
  furniture = move(furniture, KEY(ROUND_RUG_ID), { x: 2900, z: 3500 })
  // 테이블 묶음: 소파(오른쪽 벽에 붙이고 위 코어렉과 60cm 띄움) 가운데 앞에 오도록 테이블·의자는 z 113mm, 러그는 350mm 아래로, 소파와 60cm 띄우려고 모두 110mm 왼쪽으로.
  furniture = move(furniture, (item) => keyOf(item) === TABLE_ID || keyOf(item) === DINING_CHAIR_ID, (item) => ({ x: item.x - 110, z: item.z + 113 }))
  furniture = move(furniture, KEY(BIG_RUG_ID), (item) => ({ x: item.x - 110, z: item.z + 350 }))
  furniture = move(furniture, (item) => keyOf(item) === SOFA_ID || keyOf(item) === 'XjOO_Xy13478D0D91CD493D', (item) => ({ x: item.x + 117, z: item.z + 350 }))
  // 그 밖: 제네바 스피커는 책상 앞에서 선반 옆 빈 벽으로, 코어렉은 앞(방 쪽)을 보게, 심플리 수납장은 오른쪽 벽에 붙인다.
  furniture = move(furniture, KEY('XRxqWHD79D04BB434D74AF9'), { x: 3019 })
  furniture = move(furniture, KEY('YHx4J5H2C427AA8FBFD482A'), { rot: 0 })
  furniture = move(furniture, KEY('ZCREWuP85D472F7745C4005'), (item) => ({ x: item.x + 66 }))

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
  // 오른쪽 다리 쪽은 톨로메오 램프가 있어서, 램프와 창가 커튼 라인을 피해 왼쪽 다리 쪽(뒤에서 120mm 띄움)에 넣는다.
  const movedDesk = furniture.find(KEY(DESK_ID))!
  return [...furniture, { ...product, ...placeUnderDesk(movedDesk, product, 'left', 30, 120) }]
}

// 상세 보기로 묶이는 가구 세 묶음. 값은 상품 id(같은 상품이 여러 개면 모두).
export type ClusterId = 'bed' | 'desk' | 'table'

export const CLUSTERS: { id: ClusterId; title: string; keys: string[]; pairs: [string, string][] }[] = [
  { id: 'bed', title: '침대 & 3단 서랍 수납장', keys: [BED_ID, DRAWER_ID], pairs: [[BED_ID, DRAWER_ID]] },
  { id: 'desk', title: '책상 & 의자 & 서랍장', keys: [DESK_ID, DESK_CHAIR_ID, 'product'], pairs: [] },
  { id: 'table', title: '원형 테이블 & 의자 & 소파', keys: [TABLE_ID, DINING_CHAIR_ID, SOFA_ID, BIG_RUG_ID], pairs: [[TABLE_ID, DINING_CHAIR_ID], [TABLE_ID, SOFA_ID]] },
]

export const clusterOf = (item: Item) => CLUSTERS.find((cluster) => cluster.keys.includes(keyOf(item))) ?? null
