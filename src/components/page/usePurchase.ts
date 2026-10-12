import { useMemo, useState } from 'react'
import { ADDONS, ASSEMBLY_PRICE, COLORS, type ColorId } from '@/data/catalog'

export type PurchaseOption = { id: ColorId; qty: number }

// 색상 · 추가상품 · 조립신청 선택 상태와 주문금액. 히어로와 오른쪽 고정 카드가 같은 상태를 쓴다.
export function usePurchase(onPickColor: (id: ColorId) => void) {
  const [options, setOptions] = useState<PurchaseOption[]>([])
  const [addonQty, setAddonQty] = useState(0)
  const [assembly, setAssembly] = useState(false)
  const [pack, setPack] = useState(false)

  const addColor = (id: ColorId) => {
    setOptions((prev) => (prev.some((o) => o.id === id) ? prev.map((o) => (o.id === id ? { ...o, qty: o.qty + 1 } : o)) : [...prev, { id, qty: 1 }]))
    onPickColor(id)
  }

  const changeQty = (id: ColorId, delta: number) =>
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, qty: Math.max(1, Math.min(99, o.qty + delta)) } : o)))

  const removeColor = (id: ColorId) => setOptions((prev) => prev.filter((o) => o.id !== id))

  const units = options.reduce((sum, o) => sum + o.qty, 0)
  const total = useMemo(() => {
    const colors = options.reduce((sum, o) => sum + (COLORS.find((c) => c.id === o.id)?.price ?? 0) * o.qty, 0)
    return colors + addonQty * ADDONS[0].price + (assembly ? ASSEMBLY_PRICE * units : 0)
  }, [options, addonQty, assembly, units])

  return {
    options,
    addonQty,
    assembly,
    pack,
    total,
    addColor,
    changeQty,
    removeColor,
    addAddon: () => setAddonQty((q) => q + 1),
    changeAddonQty: (delta: number) => setAddonQty((q) => Math.max(1, Math.min(99, q + delta))),
    removeAddon: () => setAddonQty(0),
    setAssembly,
    setPack,
  }
}

export type Purchase = ReturnType<typeof usePurchase>
