export type Rot = 0 | 1 | 2 | 3

export type ItemKind = 'product' | 'furniture' | 'rug'

export type ItemModel = 'cabinet' | 'desk' | 'chair' | 'bed' | 'rug' | 'roundrug' | 'shelf' | 'sofa' | 'table' | 'plant' | 'box' | 'roundtable' | 'bedframe' | 'steelshelf' | 'pegboard' | 'mirror' | 'blind' | 'fksofa' | 'meshchair' | 'diningchair' | 'motiondesk' | 'chromecabinet' | 'corerack' | 'aralia' | 'tolomeo' | 'drawerunit' | 'walltv'

export type Item = {
  id: string
  name: string
  kind: ItemKind
  model: ItemModel
  w: number
  d: number
  h: number
  x: number
  z: number
  rot: Rot
  color: string
  underClearance?: number
  legGap?: number
  // 서랍장 바퀴 높이(mm). 0이면 바퀴 없이 바닥에 놓인다.
  caster?: number
  // 데모 페이지에서 고른 가구의 미리보기 이미지 주소.
  image?: string
  // 바닥에서 띄워 건 높이(mm). 벽에 거는 거울·액자·블라인드용이며, 없으면 바닥에 놓인다.
  elevation?: number
}

export type Room = {
  w: number
  d: number
  h: number
  doorWidth: number
}

export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number }

export type Dir = '+x' | '-x' | '+z' | '-z'

export type Level = 'ok' | 'warn' | 'bad'

export type Gap = {
  dir: Dir
  side: '앞' | '뒤' | '옆'
  distance: number
  target: string
  from: [number, number]
  to: [number, number]
  level: Level
}

export type Check = {
  level: Level
  title: string
  detail: string
}

export type FitResult = {
  verdict: Level
  checks: Check[]
  gaps: Gap[]
  under: string | null
}
