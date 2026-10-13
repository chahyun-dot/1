import raw from '@/data/archisketch-furniture.json'

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
