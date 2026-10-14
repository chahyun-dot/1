import { fromDeskLocal } from '@/lib/desk'
import type { Item, Rot } from '@/lib/types'

export type AroundSide = 'left' | 'right' | 'front' | 'back'

// 기준 가구 둘레에서 마주 볼 때 가구가 향하는 방향(기준 가구 앞이 +z 일 때, 기준에 대한 상대 방향).
const FACE_REL: Record<AroundSide, number> = { left: 1, right: 3, front: 2, back: 0 }

// 기준 가구 옆·앞·뒤에 가구를 gap(mm) 띄워 놓는다. face 가 true 면 기준 가구를 바라보게 돌린다.
// 옆에 놓을 때는 기준 가구의 뒤쪽 끝에 맞춘다(침대 머리맡 옆 협탁처럼).
export const placeAround = (base: Item, item: Item, side: AroundSide, gap = 60, face = false): { x: number; z: number; rot: Rot } => {
  const rot = (face ? (base.rot + FACE_REL[side]) % 4 : item.rot) as Rot
  const rel = (((rot - base.rot) % 4) + 4) % 4
  const hw = (rel % 2 ? item.d : item.w) / 2
  const hd = (rel % 2 ? item.w : item.d) / 2
  const bw = base.w / 2
  const bd = base.d / 2
  const [lx, lz] =
    side === 'left' ? [-(bw + gap + hw), -bd + hd] : side === 'right' ? [bw + gap + hw, -bd + hd] : side === 'front' ? [0, bd + gap + hd] : [0, -(bd + gap + hd)]
  const [x, z] = fromDeskLocal(base, lx, lz)
  return { x, z, rot }
}
