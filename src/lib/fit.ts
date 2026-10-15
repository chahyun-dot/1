import { measureAgainstDesk } from '@/lib/desk'
import { CURTAIN_GAP, curtainRects, doorSwingRect } from '@/lib/room'
import type { Check, Dir, FitResult, Gap, Item, Level, Rect, Room, Rot } from '@/lib/types'

export const DRAWER_PULL = 350
export const STAND_ROOM = 600
export const UNDER_MARGIN_MIN = 20
export const SNAP = 10
// 위 여유가 이 값(mm)보다 작을 때만 바퀴 높이 때문이라는 안내를 덧붙인다.
const WHEEL_TIP_MARGIN = 50

const FRONT: Dir[] = ['+z', '+x', '-z', '-x']
const OPPOSITE: Record<Dir, Dir> = { '+x': '-x', '-x': '+x', '+z': '-z', '-z': '+z' }
const LEVEL_RANK: Record<Level, number> = { ok: 0, warn: 1, bad: 2 }

export const cm = (mm: number) => `${Math.round(mm / 10).toLocaleString()}cm`
// 제품·책상 높이처럼 5mm 단위로 정해진 값(예: 685mm)은 68.5cm 로 소수 한 자리까지 보여 준다. 거리 라벨에는 쓰지 않는다.
const cmH = (mm: number) => `${(mm % 5 === 0 ? mm / 10 : Math.round(mm / 10)).toLocaleString()}cm`

export const frontDir = (rot: Rot) => FRONT[rot]

export const footprint = (item: Pick<Item, 'w' | 'd' | 'x' | 'z' | 'rot'>): Rect => {
  const swap = item.rot % 2 === 1
  const hw = (swap ? item.d : item.w) / 2
  const hd = (swap ? item.w : item.d) / 2
  return { minX: item.x - hw, maxX: item.x + hw, minZ: item.z - hd, maxZ: item.z + hd }
}

export const frontZone = (item: Item, depth: number): Rect => {
  const r = footprint(item)
  const dir = frontDir(item.rot)
  if (dir === '+z') return { ...r, minZ: r.maxZ, maxZ: r.maxZ + depth }
  if (dir === '-z') return { ...r, minZ: r.minZ - depth, maxZ: r.minZ }
  if (dir === '+x') return { ...r, minX: r.maxX, maxX: r.maxX + depth }
  return { ...r, minX: r.minX - depth, maxX: r.minX }
}

export const overlaps = (a: Rect, b: Rect) =>
  a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ

export const clampToRoom = (item: Item, x: number, z: number, room: Room) => {
  const swap = item.rot % 2 === 1
  const hw = (swap ? item.d : item.w) / 2
  const hd = (swap ? item.w : item.d) / 2
  const snap = (value: number) => Math.round(value / SNAP) * SNAP
  const clamp = (value: number, min: number, max: number) =>
    min > max ? (min + max) / 2 : Math.min(Math.max(value, min), max)
  return { x: clamp(snap(x), hw, room.w - hw), z: clamp(snap(z), hd, room.d - hd) }
}

type Obstacle = { name: string; rect: Rect }

const gapInDir = (rect: Rect, dir: Dir, room: Room, obstacles: Obstacle[]) => {
  const midX = (rect.minX + rect.maxX) / 2
  const midZ = (rect.minZ + rect.maxZ) / 2
  const alongZ = (o: Rect) => o.minZ < rect.maxZ && o.maxZ > rect.minZ
  const alongX = (o: Rect) => o.minX < rect.maxX && o.maxX > rect.minX

  let distance: number
  let target = '벽'
  const take = (d: number, name: string) => {
    if (d >= 0 && d < distance) {
      distance = d
      target = name
    }
  }

  if (dir === '+x') {
    distance = room.w - rect.maxX
    obstacles.forEach((o) => alongZ(o.rect) && o.rect.minX >= rect.maxX - 1 && take(o.rect.minX - rect.maxX, o.name))
    return { distance, target, from: [rect.maxX, midZ], to: [rect.maxX + distance, midZ] } as const
  }
  if (dir === '-x') {
    distance = rect.minX
    obstacles.forEach((o) => alongZ(o.rect) && o.rect.maxX <= rect.minX + 1 && take(rect.minX - o.rect.maxX, o.name))
    return { distance, target, from: [rect.minX, midZ], to: [rect.minX - distance, midZ] } as const
  }
  if (dir === '+z') {
    distance = room.d - rect.maxZ
    obstacles.forEach((o) => alongX(o.rect) && o.rect.minZ >= rect.maxZ - 1 && take(o.rect.minZ - rect.maxZ, o.name))
    return { distance, target, from: [midX, rect.maxZ], to: [midX, rect.maxZ + distance] } as const
  }
  distance = rect.minZ
  obstacles.forEach((o) => alongX(o.rect) && o.rect.maxZ <= rect.minZ + 1 && take(rect.minZ - o.rect.maxZ, o.name))
  return { distance, target, from: [midX, rect.minZ], to: [midX, rect.minZ - distance] } as const
}

const frontLevel = (distance: number): Level =>
  distance < DRAWER_PULL ? 'bad' : distance < STAND_ROOM ? 'warn' : 'ok'

export const evaluate = (item: Item, room: Room, items: Item[]): FitResult => {
  const rect = footprint(item)
  const others = items.filter((other) => other.id !== item.id && other.kind !== 'rug' && levelOverlap(item, other))
  const covering = others.filter((other) => overlaps(rect, footprint(other)))
  const under = covering.find((other) => other.underClearance !== undefined && item.h <= other.underClearance) ?? null
  const blocking = covering.filter((other) => other !== under)
  const doorRect = doorSwingRect(room)
  const obstacles: Obstacle[] = [
    ...others.filter((other) => other !== under).map((other) => ({ name: other.name, rect: footprint(other) })),
    { name: '문 여닫는 공간', rect: doorRect },
  ]
  const checks: Check[] = []

  const outside = Math.max(-rect.minX, -rect.minZ, rect.maxX - room.w, rect.maxZ - room.d)
  if (outside > 0) {
    checks.push({ level: 'bad', title: '방 밖으로 나가요', detail: `벽 밖으로 ${cm(outside)} 나가 있어요. 방 치수를 확인해 주세요.` })
  }

  if (item.h > room.h) {
    checks.push({ level: 'bad', title: '천장보다 높아요', detail: `제품 높이 ${cm(item.h)}, 천장 높이 ${cm(room.h)}예요.` })
  }

  blocking.forEach((other) => {
    const tooTall = other.underClearance !== undefined
    checks.push({
      level: 'bad',
      title: `${other.name}와 겹쳐요`,
      detail: tooTall
        ? `${other.name} 아래 높이 ${cm(other.underClearance!)}보다 제품(${cm(item.h)})이 높아 들어가지 않아요.`
        : '같은 자리에 둘 수 없어요. 끌어서 위치를 옮겨 주세요.',
    })
  })

  if (under?.model === 'desk' || under?.model === 'motiondesk') {
    const m = measureAgainstDesk(under, item)
    if (m.hitsLeg) {
      checks.push({
        level: 'bad',
        title: `${under.name} 다리에 걸려요`,
        detail: `다리 안쪽 폭은 ${cm(m.inner * 2)}예요. 다리 사이로 옮겨 주세요.`,
      })
    }
  }

  const caster = item.caster ?? 0
  const wheelNote = caster > 0 ? `바퀴 ${cmH(caster)} 포함` : '바퀴 없음'

  if (under) {
    const margin = under.underClearance! - item.h
    checks.push({
      level: margin < UNDER_MARGIN_MIN ? 'warn' : 'ok',
      title: margin < UNDER_MARGIN_MIN ? `${under.name} 아래 여유가 ${cm(margin)}뿐이에요` : `${under.name} 아래에 쏙 들어가요`,
      detail: `제품 높이 ${cmH(item.h)}(${wheelNote}), ${under.name} 아래 높이 ${cmH(under.underClearance!)}예요. 위로 ${cmH(margin)} 남아요.`,
    })
  }

  if (under && caster > 0 && under.underClearance! - item.h < WHEEL_TIP_MARGIN) {
    const without = under.underClearance! - (item.h - caster)
    checks.push({
      level: 'ok',
      title: `바퀴 ${cmH(caster)} 때문에 위 여유가 빠듯해요`,
      detail: `바퀴를 빼면 제품 높이 ${cmH(item.h - caster)}로 위 여유가 ${cmH(without)}까지 늘어요.`,
    })
  }

  if (caster === 0) {
    checks.push({
      level: 'ok',
      title: '바퀴 없이 바닥에 바로 놓여요',
      detail: `바닥에서 ${cmH(item.h)} 높이예요. 바퀴가 없어서 밀어 넣을 수 없고, 들어서 옮겨야 해요.`,
    })
  }

  if (overlaps(rect, doorRect)) {
    checks.push({ level: 'bad', title: '문 여닫는 공간을 막아요', detail: `문 폭 ${cm(room.doorWidth)}만큼 문이 열리는 자리예요.` })
  }

  const front = frontDir(item.rot)
  const gaps: Gap[] = (['+x', '-x', '+z', '-z'] as Dir[]).map((dir) => {
    const gap = gapInDir(rect, dir, room, obstacles)
    const side = dir === front ? '앞' : dir === OPPOSITE[front] ? '뒤' : '옆'
    const level = side === '앞' ? frontLevel(gap.distance) : 'ok'
    return { dir, side, level, distance: gap.distance, target: gap.target, from: [...gap.from], to: [...gap.to] }
  })

  const frontGap = gaps.find((gap) => gap.side === '앞')!
  const where = `앞쪽 ${frontGap.target}까지 ${cm(frontGap.distance)}`
  if (frontGap.level === 'bad') {
    checks.push({ level: 'bad', title: '서랍이 끝까지 안 열려요', detail: `${where}예요. 서랍을 완전히 열려면 ${cm(DRAWER_PULL)}가 필요해요.` })
  } else if (frontGap.level === 'warn') {
    checks.push({ level: 'warn', title: '서랍은 열리지만 앞이 좁아요', detail: `${where}예요. 앞에 서서 쓰려면 ${cm(STAND_ROOM)} 정도가 편해요.` })
  } else {
    checks.push({ level: 'ok', title: `서랍 여는 공간 ${cm(frontGap.distance)} 확보`, detail: `서랍 완전 개폐(${cm(DRAWER_PULL)})와 앞에 서는 공간까지 충분해요.` })
  }

  const sides = gaps.filter((gap) => gap.side === '옆')
  const tightSide = sides.find((gap) => gap.distance > 0 && gap.distance < 20)
  if (tightSide) {
    checks.push({ level: 'warn', title: `옆 ${tightSide.target}와 ${cm(tightSide.distance)}만 떨어져 있어요`, detail: caster > 0 ? '바퀴로 넣고 뺄 때 긁힐 수 있어요. 2cm 이상 띄워 주세요.' : '바퀴가 없어 끌면 바닥과 옆면이 긁힐 수 있어요. 들어서 옮기고 2cm 이상 띄워 주세요.' })
  }

  if (curtainRects(room).some((curtain) => overlaps(rect, curtain) && item.h + (item.elevation ?? 0) > (curtain.bottom ?? 0) + SILL_TOLERANCE)) {
    checks.push({ level: 'warn', title: '창가 커튼 라인에 닿아요', detail: `창에서 ${cm(CURTAIN_GAP)} 띄우면 커튼과 창을 여닫을 수 있어요.` })
  }

  const verdict = checks.reduce<Level>((worst, check) => (LEVEL_RANK[check.level] > LEVEL_RANK[worst] ? check.level : worst), 'ok')
  checks.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
  return { verdict, checks, gaps, under: under?.name ?? null }
}

// 바닥에 깔리는 얇은 것(러그 등)은 다른 가구를 막지 않는다.
const FLAT_MAX = 30

// 벽에 높이 걸린 가구(거울, 블라인드)는 그 아래에 놓인 가구와 높이가 겹칠 때만 서로 막는다.
// 높이가 150mm(얇은 물건은 절반) 넘게 겹쳐야 서로 막는 것으로 본다(침대 머리 위로 걸린 블라인드 아래쪽 같은 살짝 걸친 경우는 제외).
const levelOverlap = (a: Item, b: Item) => {
  const slack = Math.min(150, Math.min(a.h, b.h) / 2)
  const overlapY = Math.min((a.elevation ?? 0) + a.h, (b.elevation ?? 0) + b.h) - Math.max(a.elevation ?? 0, b.elevation ?? 0)
  return overlapY > slack && !rests(a, b) && !rests(b, a)
}

const isChair = (item: Item) => item.model === 'meshchair' || item.model === 'diningchair' || item.model === 'chair'
const isSurface = (item: Item) => item.model === 'motiondesk' || item.model === 'desk' || item.model === 'table' || item.model === 'roundtable'

// 의자는 책상·테이블 아래나 그 위에 얹은 물건(상판 높이 이상) 밑으로 밀어 넣을 수 있다. 같은 걸이 물건(셔츠 등)끼리 살짝 겹치는 것도 막지 않는다.
// 블라인드는 벽에 붙은 얇은 물건이라 100mm 이하로 살짝 걸친 것은 막는 것으로 보지 않는다.
const touchesBlind = (a: Item, b: Item) => {
  if (a.model !== 'blind' && b.model !== 'blind') return false
  const ra = footprint(a)
  const rb = footprint(b)
  return Math.min(Math.min(ra.maxX, rb.maxX) - Math.max(ra.minX, rb.minX), Math.min(ra.maxZ, rb.maxZ) - Math.max(ra.minZ, rb.minZ)) <= 100
}

const mayOverlap = (a: Item, b: Item) =>
  (isChair(a) && (isSurface(b) || (b.elevation ?? 0) >= 600)) ||
  (isChair(b) && (isSurface(a) || (a.elevation ?? 0) >= 600)) ||
  touchesBlind(a, b) ||
  (a.model === b.model && (a.elevation ?? 0) > 0 && (b.elevation ?? 0) > 0)

// 다른 가구 위에 대부분 얹힌 물건(소파 위 쿠션, 행거 받침 위 신발과 걸린 옷)은 그 가구를 막는 것으로 보지 않는다.
// 바닥에서 40mm 넘게 떠 있어야 얹힌 것으로 본다(바닥에 놓인 가구끼리 겹침은 그대로 막는다).
const rests = (top: Item, base: Item) => {
  if ((top.elevation ?? 0) < (base.elevation ?? 0) + 40) return false
  const a = footprint(top)
  const b = footprint(base)
  const overlapW = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)
  const overlapD = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ)
  if (overlapW <= 0 || overlapD <= 0) return false
  return (overlapW * overlapD) / ((a.maxX - a.minX) * (a.maxZ - a.minZ)) >= 0.6
}

// 가구를 끌어 옮길 때 같이 따라가는 물건: base 위(base 높이 안)에 놓인 물건과 그 위에 다시 놓인 물건들.
// 바닥에 놓인 것과 벽에 높이 걸린 것은 따라가지 않는다(base 의 높이 범위를 넘는 것).
export const itemsOn = (base: Item, items: Item[]): Item[] => {
  const found = new Map<string, Item>()
  const queue = [base]
  while (queue.length) {
    const under = queue.shift()!
    items.forEach((item) => {
      if (item.id === base.id || found.has(item.id) || item.kind === 'rug') return
      const bottom = under.elevation ?? 0
      const lift = item.elevation ?? 0
      if (lift > bottom + under.h + 60 || !rests(item, under)) return
      found.set(item.id, item)
      queue.push(item)
    })
  }
  return [...found.values()]
}

// 데모용: 서랍 전용 규칙 없이, 고른 가구 하나의 위치 문제와 앞뒤좌우 여유만 본다.
// 창턱 위로 100mm 이하로 살짝 걸친 가구(책상 위 모니터암 등)는 커튼 라인에 닿는 것으로 보지 않는다.
const SILL_TOLERANCE = 100

export const measureFurniture = (item: Item, room: Room, items: Item[]): FitResult => {
  const rect = footprint(item)
  const flat = item.h <= FLAT_MAX
  const others = items.filter((other) => other.id !== item.id && other.kind !== 'rug' && other.h > FLAT_MAX && levelOverlap(item, other))
  const covering = flat ? [] : others.filter((other) => overlaps(rect, footprint(other)))
  const under = covering.find((other) => other.underClearance !== undefined && item.h <= other.underClearance) ?? null
  // 내 상판 아래에 들어가 있는 가구(책상 아래 서랍장)와 의자처럼 밀어 넣는 가구는 막는 것으로 보지 않는다.
  const blocking = covering.filter((other) => other !== under && !mayOverlap(item, other) && !(item.underClearance !== undefined && other.h <= item.underClearance))
  // 앞쪽 여유를 잴 때 의자(빼고 앉는 가구)와 문 열림 자리(문이 닫혀 있으면 지나다니는 바닥)는 장애물로 보지 않는다. 겹침 판정은 따로 한다.
  // 눈높이 위(1200mm 이상)에 거는 얇은 물건(깊이 200mm 이하, 벽 램프 등)은 지나다니는 데 방해가 안 되어 장애물로 보지 않는다.
  // 소파 앞의 테이블, 행거 맞은편 벽에 붙은 수납장은 일부러 가까이 두는 것이라 장애물로 보지 않는다.
  const obstacles: Obstacle[] = others.filter((other) => other !== under && !isChair(other) && !((other.elevation ?? 0) >= 1200 && other.d <= 200) && !(item.model === 'fksofa' && isSurface(other)) && !(item.model === 'wallhanger' && other.model === 'chromecabinet')).map((other) => ({ name: other.name, rect: footprint(other) }))
  const checks: Check[] = []

  const outside = Math.max(-rect.minX, -rect.minZ, rect.maxX - room.w, rect.maxZ - room.d)
  if (outside > 5) checks.push({ level: 'bad', title: '방 밖으로 나가요', detail: `벽 밖으로 ${cm(outside)} 나가 있어요.` })
  if ((item.elevation ?? 0) + item.h > room.h) checks.push({ level: 'bad', title: '천장보다 높아요', detail: `가구 높이 ${cm((item.elevation ?? 0) + item.h)}, 천장 높이 ${cm(room.h)}예요.` })
  blocking.forEach((other) => checks.push({ level: 'bad', title: `${other.name}와 겹쳐요`, detail: '같은 자리에 둘 수 없어요. 끌어서 옮겨 주세요.' }))
  if (under) checks.push({ level: 'ok', title: `${under.name} 아래에 들어가요`, detail: `${under.name} 아래 높이 ${cm(under.underClearance!)}, 가구 높이 ${cm(item.h)}예요.` })
  if (!flat && overlaps(rect, doorSwingRect(room))) checks.push({ level: 'bad', title: '문 여닫는 공간을 막아요', detail: `문 폭 ${cm(room.doorWidth)}만큼 문이 열리는 자리예요.` })
  if (item.model !== 'blind' && curtainRects(room).some((curtain) => overlaps(rect, curtain) && item.h + (item.elevation ?? 0) > (curtain.bottom ?? 0) + SILL_TOLERANCE)) checks.push({ level: 'warn', title: '창가 커튼 라인에 닿아요', detail: `창에서 ${cm(CURTAIN_GAP)} 띄우면 커튼과 창을 여닫을 수 있어요.` })

  const front = frontDir(item.rot)
  // 앞쪽 여유(사람이 서는 자리)는 바닥에 놓인 큰 가구만 따진다. 선반·책상 위 물건, 벽에 건 것, 의자는 제외한다.
  // 침대 발치는 지나다니는 자리로 따지지 않는다(침대 옆을 따로 본다).
  const standing = (item.elevation ?? 0) === 0 && !isChair(item) && item.model !== 'bedset' && item.model !== 'bed' && item.model !== 'bedframe'
  const gaps: Gap[] = (['+x', '-x', '+z', '-z'] as Dir[]).map((dir) => {
    const gap = gapInDir(rect, dir, room, obstacles)
    const side = dir === front ? '앞' : dir === OPPOSITE[front] ? '뒤' : '옆'
    const level: Level = side === '앞' && standing && gap.distance < STAND_ROOM ? 'warn' : 'ok'
    return { dir, side, level, distance: gap.distance, target: gap.target, from: [...gap.from], to: [...gap.to] }
  })

  const frontGap = gaps.find((gap) => gap.side === '앞')!
  if (!flat && frontGap.level === 'warn') {
    checks.push({ level: 'warn', title: '앞쪽 여유가 좁아요', detail: `앞쪽 ${frontGap.target}까지 ${cm(frontGap.distance)}예요. 사람이 서거나 지나가려면 ${cm(STAND_ROOM)} 정도가 편해요.` })
  } else if (!flat) {
    checks.push({ level: 'ok', title: `앞쪽 여유 ${cm(frontGap.distance)}`, detail: `앞쪽 ${frontGap.target}까지 ${cm(frontGap.distance)}라 사람이 서거나 지나가기에 충분해요.` })
  }
  if (checks.every((check) => check.level === 'ok')) {
    checks.unshift({ level: 'ok', title: '이 자리에 둘 수 있어요', detail: '방 안에 들어가고 다른 가구와 겹치지 않아요.' })
  }

  const verdict = checks.reduce<Level>((worst, check) => (LEVEL_RANK[check.level] > LEVEL_RANK[worst] ? check.level : worst), 'ok')
  checks.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
  return { verdict, checks, gaps, under: under?.name ?? null }
}

// 가구를 놓을 빈 자리를 near(기본은 방 가운데)에서 가까운 순으로 찾는다. 없으면 null.
export const findFreeSpot = (item: Item, room: Room, items: Item[], near: { x: number; z: number } = { x: room.w / 2, z: room.d / 2 }): { x: number; z: number } | null => {
  const others = items.filter((other) => other.kind !== 'rug' && other.h > FLAT_MAX && levelOverlap(item, other)).map((other) => footprint(other))
  const blocked = [...others, doorSwingRect(room), ...curtainRects(room)]
  const candidates: { x: number; z: number; distance: number }[] = []
  for (let x = 0; x <= room.w; x += 100) {
    for (let z = 0; z <= room.d; z += 100) {
      const spot = clampToRoom(item, x, z, room)
      if (spot.x !== x && spot.z !== z) continue
      const rect = footprint({ ...item, ...spot })
      if (rect.minX < 0 || rect.minZ < 0 || rect.maxX > room.w || rect.maxZ > room.d) continue
      if (blocked.some((other) => overlaps(rect, other))) continue
      candidates.push({ ...spot, distance: Math.hypot(spot.x - near.x, spot.z - near.z) })
    }
  }
  candidates.sort((a, b) => a.distance - b.distance)
  return candidates[0] ? { x: candidates[0].x, z: candidates[0].z } : null
}

// 제품 뒷면을 가장 가까운 벽에 붙이고, 그 벽을 등지도록 돌린다.
export const backToWall = (item: Item, room: Room): Item => {
  const rect = footprint(item)
  const candidates: { rot: Rot; distance: number }[] = [
    { rot: 0, distance: rect.minZ },
    { rot: 2, distance: room.d - rect.maxZ },
    { rot: 1, distance: rect.minX },
    { rot: 3, distance: room.w - rect.maxX },
  ]
  // 두 벽에 똑같이 가까우면(모서리) 지금 향하고 있는 벽을 먼저 고른다.
  const { rot } = candidates.reduce((best, c) => (c.distance < best.distance || (c.distance === best.distance && c.rot === item.rot) ? c : best))
  const turned = { ...item, rot }
  // 뒷면(깊이 d)이 벽에 닿으니 어느 방향이든 벽에서 가운데까지는 d 의 절반이다.
  const half = item.d / 2
  const placed =
    rot === 0 ? { x: item.x, z: half } : rot === 2 ? { x: item.x, z: room.d - half } : rot === 1 ? { x: half, z: item.z } : { x: room.w - half, z: item.z }
  return { ...turned, ...clampToRoom(turned, placed.x, placed.z, room) }
}
