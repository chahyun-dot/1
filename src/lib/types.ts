export type Rot = 0 | 1 | 2 | 3

export type ItemKind = 'product' | 'furniture' | 'rug'

export type ItemModel = 'cabinet' | 'desk' | 'chair' | 'bed' | 'rug' | 'roundrug' | 'shelf' | 'sofa' | 'table' | 'plant'

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
