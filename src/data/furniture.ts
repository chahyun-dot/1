import raw from '@/data/archisketch-furniture.json'
import type { ItemModel } from '@/lib/types'

// Archisketch 에서 내보낸 가구 목록(docs/archisketch-furniture-items.md 와 같은 내용).
// 이미지는 componentId 로 짝지어 public/archisketch/{componentId}.png 에 받아 두었다.
export type Furniture = {
  id: string
  name: string
  brand: string | null
  quantity: number
  price: number
  size: { w: number; d: number; h: number }
  placed: boolean
  image: string
}

export const FURNITURE: Furniture[] = raw.furnitureItems.map((item) => ({
  id: item.componentId,
  name: item.name,
  brand: item.brand,
  quantity: item.quantity,
  price: item.retailPrice.value,
  size: { w: item.dimensionMm.width, d: item.dimensionMm.depth, h: item.dimensionMm.height },
  placed: item.roomId !== '',
  image: `/archisketch/${item.componentId}.png`,
}))

export const FURNITURE_PROJECT = raw.projectName

export type FurnitureCategory = '가구' | '소품' | '벽·천장'

// 데이터에 분류가 없어서 직접 나눴다. 벽에 걸거나 천장·창문·문에 붙는 것은 벽·천장, 옷과 작은 물건은 소품이다.
const WALL_OR_CEILING = new Set([
  'X8kL5fT81A10556FC5447E5', // Illusion 01 (액자)
  'XW_VtxtA8DF6CDA88104092', // Ideal living (액자)
  'ZLDAeRK53BFEDFD0CF2475A', // 아르덴 미러
  'YneAfk7A250635ACE594C54', // perforated board
  'ZGXmJUk293C2AE613ED4B4B', // 삼성 QLED 벽걸이
  'YPGPhJp77841A682B5A4CD2', // Front door
  'E976B33E1388415C', // JELD WEN Windows
  'E1632324621148B0', // 우드 블라인드
  'Xr78id08D1C38D7AD0D4D47', // LED 면조명
])
const CLOTHES = new Set(['YV8EVEF2D36EE1DB1D44CAB', 'XX-zmmq45F1867DE7EE462B', 'ZFFQHal586565A1F38B473C'])

export const hasSize = (f: Furniture) => f.size.w > 0 && f.size.d > 0 && f.size.h > 0

export const categoryOf = (f: Furniture): FurnitureCategory => {
  if (WALL_OR_CEILING.has(f.id)) return '벽·천장'
  if (CLOTHES.has(f.id) || Math.max(f.size.w, f.size.d, f.size.h) < 600) return '소품'
  return '가구'
}

// 이미지를 보고 코드로 모양을 만든 가구. 여기에 없는 가구는 치수 그대로의 상자(box)로 보인다.
// elevation 은 벽에 거는 높이(mm). 없으면 바닥에 놓인다.
export const MODEL_BY_FURNITURE: Record<string, { model: ItemModel; elevation?: number }> = {
  YSEBSV826EADFB11D0F4FDD: { model: 'roundtable' }, // W1000 원형테이블
  Xs_Qb6C3D61BBB72B9B4159: { model: 'bedframe' }, // D2178B 슈퍼싱글 침대(블랙)
  'ZHCng6-9DA238A1CE5340E1': { model: 'steelshelf' }, // H1740 5단 철제선반장
  YneAfk7A250635ACE594C54: { model: 'pegboard', elevation: 1100 }, // perforated board
  ZLDAeRK53BFEDFD0CF2475A: { model: 'mirror', elevation: 900 }, // 아르덴 미러
  E1632324621148B0: { model: 'blind', elevation: 240 }, // PREMIUM 우드 블라인드(2281mm, 천장 쪽에 맞춤)
}
