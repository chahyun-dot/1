import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Icon from '@/components/Icon'
import ClusterScene, { gapOf, type PairGap } from '@/components/fit/ClusterScene'
import DetailScene from '@/components/fit/DetailScene'
import type { FitSummary } from '@/components/fit/FitModal'
import type { OpeningKey } from '@/components/fit/RoomShell'
import Scene, { type View } from '@/components/fit/Scene'
import { COLORS, PRODUCT, WHEEL_DEFAULT, WHEEL_MAX, WHEEL_MIN, colorOf, type ColorId } from '@/data/catalog'
import { GALLERY, galleryUrl } from '@/data/ohou'
import { BED_FRAME_COLORS, BED_SET_SUFFIX, BUNDLE_OF, COLOR_OPTIONS, DEMO_FURNITURE, FURNITURE, MODEL_BY_FURNITURE, categoryOf, hasSize, type ColorOption, type Furniture, type FurnitureCategory } from '@/data/furniture'
import { BED_ID, CLUSTERS, DINING_CHAIR_ID, DRAWER_ID, HANGER_KEYS, MAX_WINDOWS, SOFA_ID, STUDIO_DIMS, STUDIO_PRESET, TABLE_ID, clusterOf, keyOf, studioItems, studioRoom, type ClusterId, type RoomDims } from '@/data/studioLayout'
import { DESK_TOP, legInner, maxLegGap, placeBesideDesk, placeUnderDesk, underOffsets, undersideOf, type UnderOffsets } from '@/lib/desk'
import { placeAround, type AroundSide } from '@/lib/cluster'
import { DRAWER_PULL, backToWall, clampToRoom, cm, evaluate, findFreeSpot, itemsOn, measureFurniture } from '@/lib/fit'
import type { FitResult, Item, Level, Opening, Rot } from '@/lib/types'

// 데모와 "내 공간에 맞는지 확인하기" 팝업을 합친 화면(데모 2번).
// 6×6m 방에 데모 가구와 책상 아래 서랍장으로 시작하고, 오른쪽 탭은 내 공간 치수 / 통합(배치된 가구·상품 종류) / 직접 입력이다.

type Props = {
  colorId?: ColorId
  onColor?: (id: ColorId) => void
  onClose: () => void
  onDone?: (summary: FitSummary) => void
  // 상품 페이지의 "내 공간에 맞는지 확인하기" 버튼으로 열 때는 방 전체가 아니라 책상 상세 화면으로 시작한다("방 전체" 버튼으로 방 화면으로 간다).
  startInDetail?: boolean
}

type Tab = 'space' | 'all' | 'custom'
type DetailTab = 'cabinet' | 'members'

const TABS: { id: Tab; label: string }[] = [
  { id: 'space', label: '내 공간 치수' },
  { id: 'all', label: '가구 목록' },
  { id: 'custom', label: '직접 입력' },
]

const VERDICT: Record<Level, { label: string; icon: string; box: string; text: string }> = {
  ok: { label: '입력한 치수 기준으로 배치 가능해요', icon: 'check_circle', box: 'bg-status-success-bg', text: 'text-status-success' },
  warn: { label: '둘 수 있지만 확인이 필요해요', icon: 'error', box: 'bg-status-warn-bg', text: 'text-amber-600' },
  bad: { label: '현재 배치에서는 사용 공간이 부족해요', icon: 'cancel', box: 'bg-status-bad-bg', text: 'text-status-bad' },
}

const VERDICT_SHORT: Record<Level, string> = { ok: '배치 가능', warn: '확인 필요', bad: '공간 부족' }

const CHECK_ICON: Record<Level, string> = { ok: 'text-status-success', warn: 'text-amber-500', bad: 'text-status-bad' }

// 방 치수는 1~10000mm 까지 입력할 수 있다.
const ROOM_MAX = 10000

const ROOM_FIELDS: { key: keyof RoomDims; label: string }[] = [
  { key: 'w', label: '가로 (문 ↔ 창)' },
  { key: 'd', label: '세로 (책상 벽 ↔ 맞은편)' },
  { key: 'h', label: '천장 높이' },
  { key: 'doorWidth', label: '방문 폭' },
]

const CATEGORY_COLOR: Record<FurnitureCategory | '직접 입력', string> = { 가구: '#9aa6b2', 소품: '#d1b58a', '벽·천장': '#7fb0cf', '직접 입력': '#a89be0' }
const CUSTOM_KINDS = ['침대', '테이블·식탁·책상', '소파', '서랍·수납장', '선반', '의자', '진열장·책장', '거울']
const DOOR_ID = 'YPGPhJp77841A682B5A4CD2'
const WINDOW_ID = 'E976B33E1388415C'

const CABINET_IMAGE = galleryUrl(GALLERY[1], 200)

const PRETENDARD = "'Pretendard Variable', Pretendard, Inter, -apple-system, 'Noto Sans KR', sans-serif"

const sizeText = (item: Pick<Item, 'w' | 'd' | 'h'>) => `W${item.w} × D${item.d} × H${item.h}mm`

function StageButton({ icon, label, onClick, active = false, disabled = false }: { icon: string; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 px-2 py-1 text-[12px] transition-colors disabled:opacity-40 ${active ? 'font-bold text-primary-container' : 'font-medium text-text-secondary hover:text-primary-container'}`}
    >
      <Icon name={icon} className="text-[15px]" /> {label}
    </button>
  )
}

function NumberField({ label, value, min, max, onCommit, pill = false, step = 10 }: { label: string; value: number; min: number; max: number; onCommit: (value: number) => void; pill?: boolean; step?: number }) {
  const [draft, setDraft] = useState<string | null>(null)
  // 값이 밖에서 바뀌면(초기화 등) 입력 중이던 글자를 버린다.
  useEffect(() => setDraft(null), [value])
  const parsed = draft === null ? value : Number(draft)
  const invalid = draft !== null && !(parsed >= min && parsed <= max)
  const input = (
    <input
      type="number"
      step={step}
      min={min}
      max={max}
      value={draft ?? value}
      onChange={(event) => {
        const next = Number(event.target.value)
        setDraft(event.target.value)
        if (next >= min && next <= max) onCommit(Math.round(next))
      }}
      onBlur={() => setDraft(null)}
      className={`border bg-surface-base text-text-primary outline-none focus:ring-2 ${pill ? 'h-10 min-w-0 flex-1 rounded-full px-4 text-[15px]' : 'h-9 w-full rounded-lg pl-2.5 pr-9 text-[14px]'} ${
        invalid ? 'border-status-bad focus:ring-status-bad/20' : 'border-border-default focus:border-primary-container focus:ring-primary-container/20'
      }`}
    />
  )
  return (
    <label className={pill ? 'text-[13px] text-text-secondary' : 'text-[12px] text-text-secondary'}>
      {label}
      {pill ? (
        <div className="mt-1 flex items-center gap-1.5">
          {input}
          <span className="text-[13px] text-text-muted">mm</span>
        </div>
      ) : (
        <div className="relative mt-1">
          {input}
          <span className="pointer-events-none absolute right-2.5 top-2 text-[12px] text-text-muted">mm</span>
        </div>
      )}
      {invalid && <span className="mt-0.5 block text-[11px] text-status-bad">{min.toLocaleString()}~{max.toLocaleString()}mm</span>}
    </label>
  )
}

function CountControls({ name, count, min, max = Infinity, onMinus, onPlus }: { name: string; count: number; min: number; max?: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="ml-2 mr-5 flex shrink-0 items-center gap-0.5">
      <button type="button" aria-label={`${name} 하나 줄이기`} disabled={count <= min} onClick={onMinus} className="flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full border border-border-default text-text-secondary hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30">
        <Icon name="remove" size={10} />
      </button>
      <span className="w-4 text-center text-[10px] font-semibold tabular-nums">{count}</span>
      <button type="button" aria-label={`${name} 하나 늘리기`} disabled={count >= max} onClick={onPlus} className="flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full border border-border-default text-text-secondary hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30">
        <Icon name="add" size={10} />
      </button>
    </div>
  )
}

function RemoveAll({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={`${name} 모두 빼기`} onClick={onClick} className="absolute right-1 top-1 flex h-[15px] w-[15px] cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle hover:text-status-bad">
      <Icon name="close" size={16} />
    </button>
  )
}

function ColorChips({ options, isOn, onPick, title = '색상' }: { options: ColorOption[]; isOn: (option: ColorOption) => boolean; onPick: (option: ColorOption) => void; title?: string }) {
  const current = options.find(isOn) ?? options[0]
  return (
    <div className="mt-3">
      <p className="text-[12px] font-bold">
        {title} <span className="font-medium text-text-secondary">{current.name}</span>
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = isOn(option)
          return (
            <button
              key={option.name}
              type="button"
              title={option.name}
              aria-label={`${title} ${option.name}`}
              aria-pressed={on}
              onClick={() => onPick(option)}
              className={`h-6 w-6 cursor-pointer rounded-full border ${on ? 'border-primary-container ring-2 ring-primary-container/40' : 'border-black/15'}`}
              style={{ background: option.hex2 && option.hex2 !== option.hex ? `linear-gradient(135deg, ${option.hex} 50%, ${option.hex2} 50%)` : option.hex }}
            />
          )
        })}
      </div>
    </div>
  )
}

const PRODUCT_COLOR_OPTIONS: (ColorOption & { id: ColorId })[] = COLORS.map((color) => ({ id: color.id, name: color.label.replace(/\s*[\d.]+$/, ''), hex: color.hex }))

// 제목 옆 파란 i 버튼. 마우스를 올리거나 눌러 포커스하면 설명이 뜬다("내 공간에 맞는지 확인하기" 옆 i 버튼과 같은 모양).
function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button type="button" aria-label={label} className="rounded-full p-0.5 text-primary-container outline-none hover:bg-brand-sky-light focus-visible:bg-brand-sky-light">
        <Icon name="info" size={18} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-20 mt-1 w-[260px] rounded-lg bg-inverse-surface/95 px-3 py-2 text-[12px] font-normal leading-relaxed text-inverse-on-surface opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {children}
      </span>
    </span>
  )
}

// 크기를 바꿀 수 있는 카드 오른쪽 끝에 두는 작은 초기화 버튼.
function ResetButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={`${label} 처음 크기로 초기화`} disabled={disabled} onClick={onClick} className="flex shrink-0 cursor-pointer items-center gap-0.5 rounded-full border border-border-default px-1.5 py-px text-[10px] font-medium text-text-secondary hover:border-primary-container hover:text-primary-container disabled:cursor-default disabled:opacity-30 disabled:hover:border-border-default disabled:hover:text-text-secondary">
      <Icon name="refresh" size={11} /> 초기화
    </button>
  )
}

function Section({ children }: { children: ReactNode }) {
  return <section className="border-b border-border-subtle px-5 py-5">{children}</section>
}

export default function FitStudio({ colorId: colorFromPage, onColor, onClose, onDone, startInDetail = false }: Props) {
  const [colorId, setColorId] = useState<ColorId>(colorFromPage ?? 'white')
  const [dims, setDims] = useState<RoomDims>(STUDIO_DIMS)
  const [presetId, setPresetId] = useState<string | null>(STUDIO_PRESET.id)
  const [windowCount, setWindowCount] = useState(MAX_WINDOWS)
  const baseRoom = useMemo(() => studioRoom(dims, windowCount), [dims, windowCount])
  // 끌어서 옮긴 문·창(창은 순서 번호로). 방 치수를 바꾸거나 초기화하면 처음 자리로 돌아간다.
  const [movedOpenings, setMovedOpenings] = useState<{ door?: Opening; windows: Record<number, Opening> }>({ windows: {} })
  const room = useMemo(() => {
    const base = baseRoom.openings
    if (!base) return baseRoom
    return { ...baseRoom, openings: { door: movedOpenings.door ?? base.door, windows: base.windows.map((win, index) => movedOpenings.windows[index] ?? win) } }
  }, [baseRoom, movedOpenings])
  useEffect(() => setMovedOpenings({ windows: {} }), [dims])
  const [items, setItems] = useState<Item[]>(() => studioItems(colorOf(colorFromPage ?? 'white').hex))
  // 크기 초기화 버튼이 돌아갈 처음 크기.
  const initialItems = useMemo(() => studioItems(colorOf('white').hex), [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<View>('persp')
  // 서랍이 열린 가구 id (서랍장 제품과 3단 수납형 서랍을 따로 열고 닫는다).
  const [openIds, setOpenIds] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [gapsOpen, setGapsOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('space')
  const [sub, setSub] = useState<'placed' | 'catalog'>('placed')
  const [detail, setDetail] = useState<ClusterId | null>(startInDetail ? 'desk' : null)
  const [ready, setReady] = useState(false)
  const [mount, setMount] = useState(false)
  const [detailTab, setDetailTab] = useState<DetailTab>('members')
  const [autoRotate, setAutoRotate] = useState(true)
  const [showDims, setShowDims] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FurnitureCategory | '전체'>('전체')
  const [placedQuery, setPlacedQuery] = useState('')
  const [placedCategory, setPlacedCategory] = useState<FurnitureCategory | '전체'>('전체')
  const [draft, setDraft] = useState({ name: '', w: 600, d: 600, h: 800 })
  const counter = useRef(0)
  const asideRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [diagOpen, setDiagOpen] = useState(false)
  const toastTimer = useRef<number | undefined>(undefined)

  // 책상 상세의 서랍장은 처음부터 있던 서랍장(id 'product')이다. 나중에 더한 서랍장은 책상 아래 장면에 없다.
  const product = items.find((item) => item.id === 'product') ?? null
  const productId = 'product'
  const desk = items.find((item) => item.model === 'motiondesk') ?? null
  const selected = items.find((item) => item.id === selectedId) ?? null
  const cluster = detail ? (CLUSTERS.find((c) => c.id === detail) ?? null) : null
  // 상세 화면은 처음부터 그 묶음에 있던 가구만 보여 준다(나중에 더한 같은 가구는 방에 따로 놓이므로 상세 장면에 없다).
  const initialIds = useMemo(() => new Set(initialItems.map((item) => item.id)), [initialItems])
  const members = useMemo(() => (cluster ? items.filter((item) => cluster.keys.includes(keyOf(item)) && initialIds.has(item.id)) : []), [cluster, items, initialIds])
  const inDetail = Boolean(cluster && (cluster.id !== 'desk' || desk))
  const deskChairs = useMemo(() => (cluster?.id === 'desk' ? members.filter((item) => item.model === 'meshchair') : []), [cluster, members])
  const gaps: PairGap[] = useMemo(() => {
    if (!cluster) return []
    return cluster.pairs.flatMap(([ka, kb, kind]) => members.filter((a) => keyOf(a) === ka).flatMap((a) => members.filter((b) => keyOf(b) === kb).map((b) => ({ ...gapOf(a, b), rest: kind === 'on' || kind === 'height', heightOnly: kind === 'height' }))))
  }, [cluster, members])

  const bedItem = members.find((item) => keyOf(item) === BED_ID)
  const drawerItem = members.find((item) => keyOf(item) === DRAWER_ID)
  const tableItem = members.find((item) => keyOf(item) === TABLE_ID)
  const chairItem = members.find((item) => keyOf(item) === DINING_CHAIR_ID)
  const sofaItem = members.find((item) => keyOf(item) === SOFA_ID)

  // 진단 대상: 고른 가구. 상세 보기에서는 묶음의 가구(책상 묶음은 서랍장)를 본다.
  const target = inDetail ? (cluster!.id === 'desk' ? (product ?? desk) : (members.find((item) => item.id === selectedId) ?? members.find((item) => item.kind !== 'rug') ?? members[0] ?? null)) : selected
  const fit: FitResult | null = useMemo(() => {
    if (!target) return null
    return target.kind === 'product' ? evaluate(target, room, items) : measureFurniture(target, room, items)
  }, [target, room, items])
  const verdict = fit ? VERDICT[fit.verdict] : null
  const frontGap = fit?.gaps.find((gap) => gap.side === '앞')
  const spaceLabel = presetId === STUDIO_PRESET.id ? STUDIO_PRESET.label : '직접 입력한 공간'
  const offsets = desk && product ? underOffsets(desk, product) : null

  // 3D 장면은 가구가 많아 처음 그릴 때 시간이 걸린다. 화면이 바뀔 때마다 스피너를 먼저 보여 주고 장면을 그린다.
  const viewKey = detail ?? 'room'
  useEffect(() => {
    setReady(false)
    setMount(false)
    const timer = window.setTimeout(() => setMount(true), 60)
    return () => window.clearTimeout(timer)
  }, [viewKey])

  useEffect(() => {
    if (colorFromPage) setColorId(colorFromPage)
  }, [colorFromPage])

  useEffect(() => {
    setItems((prev) => prev.map((item) => (item.id === 'product' ? { ...item, color: colorOf(colorId).hex } : item)))
  }, [colorId])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const isOpen = (id: string) => openIds.includes(id)
  const toggleOpen = (id: string) => setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const say = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }

  // 서랍장 색은 가구마다 따로 고른다. 처음 서랍장(id 'product')만 상품 페이지의 색 선택과 이어진다.
  const pickProductColor = (item: Item, option: ColorOption) => {
    updateItem(item.id, (current) => ({ ...current, color: option.hex }))
    if (item.id === 'product') {
      const id = (option as ColorOption & { id: ColorId }).id
      setColorId(id)
      onColor?.(id)
    }
  }
  const pickFrameColor = (item: Item, option: ColorOption) => updateItem(item.id, (current) => ({ ...current, frameTint: option.isDefault ? undefined : option.hex }))

  const updateItem = (id: string, patch: (item: Item) => Item) => setItems((prev) => prev.map((item) => (item.id === id ? patch(item) : item)))
  const clampTo = (item: Item, x: number, z: number) => ({ ...item, ...clampToRoom(item, x, z, room) })

  // 가구(base)를 nextBase 로 바꾼다. 그 위에 올려 둔 물건은 가구에 고정된 것처럼 같은 간격 그대로 따라간다
  // (옮기면 같은 만큼 이동, 돌리면 가구 가운데를 중심으로 같이 돌고, 벽에 막혀 덜 움직이면 같이 덜 움직인다).
  const commitBase = (base: Item, nextBase: Item, rotated = false) => {
    const followers = new Map(itemsOn(base, items).map((entry) => [entry.id, entry]))
    setItems((prev) =>
      prev.map((entry) => {
        if (entry.id === base.id) return nextBase
        const follower = followers.get(entry.id)
        if (!follower) return entry
        if (!rotated) return { ...follower, x: follower.x + nextBase.x - base.x, z: follower.z + nextBase.z - base.z }
        // 90° 돌리면 가구 가운데에서 잰 간격(rx, rz)도 같은 방향으로 90° 돈다.
        const rx = follower.x - base.x
        const rz = follower.z - base.z
        return { ...follower, x: nextBase.x + rz, z: nextBase.z - rx, rot: ((follower.rot + 1) % 4) as Rot, yaw: follower.yaw !== undefined ? follower.yaw + 90 : undefined }
      }),
    )
  }

  const rotateSelected = () => {
    if (!selected) return
    commitBase(selected, clampTo({ ...selected, rot: ((selected.rot + 1) % 4) as Rot }, selected.x, selected.z), true)
  }

  const reset = () => {
    // 초기화는 가구 배치와 방 치수(4.5×4.5m)를 처음으로 되돌린다. 창문 개수는 그대로 둔다.
    setDims(STUDIO_DIMS)
    setMovedOpenings({ windows: {} })
    setPresetId(STUDIO_PRESET.id)
    setItems(studioItems(colorOf(colorId).hex))
    setSelectedId(null)
    setOpenIds([])
    say('처음 배치로 되돌렸어요')
  }

  // 문·창을 끌어 옮긴다. 다른 문·창과 겹치는 자리로는 옮기지 않는다. 블라인드는 창과 따로 옮긴다.
  const moveOpening = (key: OpeningKey, next: Opening) => {
    const open = room.openings
    if (!open) return
    const current = key.kind === 'door' ? open.door : open.windows[key.index]
    const others = key.kind === 'door' ? open.windows : [open.door, ...open.windows.filter((_, index) => index !== key.index)]
    if (!current || others.some((other) => other.side === next.side && next.from < other.to + 20 && next.to > other.from - 20)) return
    setMovedOpenings((prev) => (key.kind === 'door' ? { ...prev, door: next } : { ...prev, windows: { ...prev.windows, [key.index]: next } }))
  }

  // 가구를 끌면 그 위에 올려 둔 물건도 같이 옮겨진다. 위에 놓인 물건만 끌면 그 물건만 옮겨진다.
  const moveWithFollowers = (id: string, x: number, z: number) => {
    const base = items.find((entry) => entry.id === id)
    if (!base) return
    const moved = clampTo(base, x, z)
    if (moved.x === base.x && moved.z === base.z) return
    commitBase(base, moved)
  }

  const openDetail = (id: ClusterId, memberId?: string) => {
    setDetail(id)
    setDetailTab('members')
    if (memberId) setSelectedId(memberId)
  }

  const addBox = (id: string, name: string, size: { w: number; d: number; h: number }, color: string, image?: string, model: Item['model'] = 'box', elevation?: number, extra: Partial<Item> = {}) => {
    const item: Item = { id, name, kind: 'furniture', model, elevation, rot: 0, x: room.w / 2, z: room.d / 2, color, image, ...size, ...extra }
    const spot = findFreeSpot(item, room, items)
    const placed = { ...item, ...(spot ?? clampToRoom(item, room.w / 2, room.d / 2, room)) }
    setItems((prev) => [...prev, placed])
    setSelectedId(placed.id)
    say(spot ? `${name}을(를) 놓았어요` : '빈 자리가 없어 가운데에 겹쳐 놓았어요. 끌어서 옮겨 주세요.')
  }

  const addFromCatalog = (picked: Furniture) => {
    const furniture = FURNITURE.find((f) => f.id === BUNDLE_OF[picked.id]) ?? picked
    const spec = MODEL_BY_FURNITURE[furniture.id]
    const n = Math.max(0, ...items.filter((item) => keyOf(item) === furniture.id).map((item) => Number(item.id.split('#')[1] ?? 1))) + 1
    const name = spec?.model === 'bedset' ? `${furniture.name}${BED_SET_SUFFIX}` : furniture.name
    addBox(`${furniture.id}#${n}`, name, { w: furniture.size.w, d: furniture.size.d, h: furniture.size.h }, CATEGORY_COLOR[categoryOf(furniture)], furniture.image, spec?.model, spec?.elevation)
  }

  // 전체 가구 목록의 피하 서랍장 4.1단: 처음 배치에 있는 서랍장과 같은 제품(서랍장 전용 판정·서랍 열기·바퀴)을 하나 더 놓는다.
  const addCabinet = () => {
    const n = Math.max(0, ...items.filter((item) => keyOf(item) === 'product').map((item) => Number(item.id.split('#')[1] ?? 1))) + 1
    const id = items.some((item) => item.id === 'product') ? `product#${n}` : 'product'
    addBox(id, PRODUCT.shortName, { w: PRODUCT.size.w, d: PRODUCT.size.d, h: PRODUCT.bodyH + WHEEL_DEFAULT }, colorOf(colorId).hex, CABINET_IMAGE, 'cabinet', undefined, { kind: 'product', caster: WHEEL_DEFAULT })
  }

  const addCustom = () => {
    counter.current += 1
    const name = draft.name.trim() || `내 가구 ${counter.current}`
    addBox(`custom-${counter.current}`, name, { w: draft.w, d: draft.d, h: draft.h }, CATEGORY_COLOR['직접 입력'])
  }

  const duplicate = (source: Item) => {
    const key = keyOf(source)
    const n = Math.max(0, ...items.filter((item) => keyOf(item) === key).map((item) => Number(item.id.split('#')[1] ?? 1))) + 1
    const item: Item = { ...source, id: `${key}#${n}`, x: room.w / 2, z: room.d / 2 }
    const spot = findFreeSpot(item, room, items)
    const placed = { ...item, ...(spot ?? clampToRoom(item, room.w / 2, room.d / 2, room)) }
    setItems((prev) => [...prev, placed])
    setSelectedId(placed.id)
    say(spot ? `${source.name}을(를) 하나 더 놓았어요` : '빈 자리가 없어 가운데에 겹쳐 놓았어요. 끌어서 옮겨 주세요.')
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const needsSize = (furniture: Furniture) => !hasSize(furniture)
  const openCustomFor = (furniture: Furniture) => {
    setDraft({ name: furniture.name, w: furniture.size.w || 600, d: furniture.size.d || 600, h: furniture.size.h || 800 })
    setTab('custom')
    say('치수를 알려 주세요. 입력하면 3D에 놓을 수 있어요.')
  }

  // 서랍장: 바퀴 유무·높이에 따라 제품 높이가 바뀐다. 위치는 그대로 둔다.
  const setCaster = (caster: number) => updateItem(productId, (item) => ({ ...item, caster, h: item.h - (item.caster ?? 0) + caster }))
  const moveProduct = (x: number, z: number) => updateItem(productId, (item) => clampTo(item, x, z))
  const placeProduct = (place: (deskItem: Item, item: Item) => { x: number; z: number; rot: Rot }) => {
    if (!desk) return
    updateItem(productId, (item) => {
      const next = { ...item, ...place(desk, item) }
      return clampTo(next, next.x, next.z)
    })
  }
  const setOffsets = (patch: Partial<UnderOffsets>) => {
    const next = { side: 'right', leg: 30, back: 30, ...offsets, ...patch } as UnderOffsets
    placeProduct((d, item) => placeUnderDesk(d, item, next.side, next.leg, next.back))
  }

  // 책상 치수를 바꿔도 서랍장은 다리·뒤 간격을 그대로 유지한 채 따라간다.
  const updateDesk = (patch: Partial<Item>) => {
    if (!desk) return
    const keep = product ? underOffsets(desk, product) : null
    const nextDesk = clampTo({ ...desk, ...patch }, desk.x, desk.z)
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === nextDesk.id) return nextDesk
        if (keep && item.id === productId) {
          const next = { ...item, ...placeUnderDesk(nextDesk, item, keep.side, keep.leg, keep.back) }
          return clampTo(next, next.x, next.z)
        }
        return item
      }),
    )
  }

  // 기준 가구 둘레에 가구를 옮겨 놓는다(침대 옆 서랍, 테이블 둘레 의자·소파).
  const arrange = (mover: Item | undefined, base: Item | undefined, side: AroundSide, gap: number, face: boolean) => {
    if (!mover || !base) return
    updateItem(mover.id, (item) => {
      const next = { ...item, ...placeAround(base, item, side, gap, face), yaw: undefined }
      return clampTo(next, next.x, next.z)
    })
  }

  const setSize = (id: string, patch: Partial<Pick<Item, 'w' | 'd' | 'h'>>) => updateItem(id, (item) => clampTo({ ...item, ...patch }, item.x, item.z))
  const initialOf = (id: string) => initialItems.find((item) => item.id === id)
  const sizeChanged = (item: Item) => {
    const first = initialOf(item.id)
    return !!first && (first.w !== item.w || first.d !== item.d || first.h !== item.h || first.caster !== item.caster)
  }
  const resetSize = (id: string) => {
    const first = initialOf(id)
    if (!first) return
    // 서랍장은 높이에 바퀴가 들어 있어서 바퀴도 처음(30mm)으로 돌린다.
    updateItem(id, (item) => clampTo({ ...item, w: first.w, d: first.d, h: first.h, caster: first.caster ?? item.caster }, item.x, item.z))
  }
  // 책상은 크기를 바꾸면 서랍장이 따라가므로 updateDesk 로 되돌린다.
  const deskSizeChanged = (item: Item) => {
    const first = initialOf(item.id)
    return !!first && (first.w !== item.w || first.d !== item.d || first.h !== item.h || first.underClearance !== item.underClearance || first.legGap !== item.legGap)
  }
  const installChanged = (item: Item) => {
    const first = initialOf(item.id)
    return !!first && (first.underClearance !== item.underClearance || first.legGap !== item.legGap)
  }

  const close = () => {
    const productFit = product ? evaluate(product, room, items) : null
    if (productFit) onDone?.({ verdict: productFit.verdict, title: productFit.checks[0]?.title ?? VERDICT[productFit.verdict].label, space: spaceLabel })
    onClose()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (detail) setDetail(null)
        else close()
        return
      }
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'r' || event.key === 'R') rotateSelected()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const groups = useMemo(() => {
    const map = new Map<string, Item[]>()
    items.forEach((item) => {
      const key = keyOf(item)
      map.set(key, [...(map.get(key) ?? []), item])
    })
    return [...map.values()]
  }, [items])
  // 배치된 가구 목록의 검색·분류(상품 종류와 같은 방식). 서랍장 제품·직접 입력한 가구는 '가구'로 본다.
  const matchesPlaced = (id: string, name: string) => {
    const furniture = FURNITURE.find((f) => f.id === id)
    const q = placedQuery.trim().toLowerCase()
    return (placedCategory === '전체' || (furniture ? categoryOf(furniture) : '가구') === placedCategory) && (q === '' || `${name} ${furniture?.brand ?? ''}`.toLowerCase().includes(q))
  }
  const visibleGroups = groups.filter((group) => matchesPlaced(keyOf(group[0]), group[0].name))
  const doorFurniture = FURNITURE.find((f) => f.id === DOOR_ID)
  const windowFurniture = FURNITURE.find((f) => f.id === WINDOW_ID)
  const listedCount = groups.length + (doorFurniture ? 1 : 0) + (windowFurniture && windowCount > 0 ? 1 : 0)
  const visibleCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_FURNITURE.filter((f) => (category === '전체' || categoryOf(f) === category) && (q === '' || `${f.name} ${f.brand ?? ''}`.toLowerCase().includes(q)))
  }, [query, category])
  const showCabinet = (category === '전체' || category === '가구') && (query.trim() === '' || `${PRODUCT.shortName} ${PRODUCT.brand}`.toLowerCase().includes(query.trim().toLowerCase()))
  const cabinetCount = items.filter((item) => keyOf(item) === 'product').length
  const draftValid = draft.w >= 50 && draft.w <= room.w && draft.d >= 50 && draft.d <= room.d && draft.h >= 50 && draft.h <= room.h

  const options = target && target.kind !== 'product' ? COLOR_OPTIONS[keyOf(target)] : undefined

  const diagnosis = (
    <>
          {fit && verdict ? (
            <>
              <div className={`-mx-3 flex gap-2 rounded-xl px-3 py-3 ${verdict.box}`}>
                <Icon name={verdict.icon} filled className={`mt-px text-[18px] ${verdict.text}`} />
                <span className={`text-[15px] font-bold leading-snug ${verdict.text}`}>{verdict.label}</span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {fit.checks.map((check, index) => (
                  <li key={index} className="flex gap-2">
                    <Icon name={check.level === 'ok' ? 'check_circle' : check.level === 'warn' ? 'error' : 'cancel'} filled className={`mt-0.5 text-[18px] ${CHECK_ICON[check.level]}`} />
                    <div>
                      <p className="text-[13px] font-semibold text-text-primary">{check.title}</p>
                      <p className="text-[12px] leading-relaxed text-text-secondary">{check.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 overflow-hidden rounded-xl bg-surface-alt">
                <button type="button" onClick={() => setGapsOpen(!gapsOpen)} aria-expanded={gapsOpen} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] font-semibold text-text-primary">
                  <span>주변 간격 (앞 · 뒤 · 옆)</span>
                  <span className="flex items-center gap-1.5">
                    {!gapsOpen && frontGap && <span className={`text-[12px] font-semibold ${CHECK_ICON[frontGap.level]}`}>앞 {cm(frontGap.distance)}</span>}
                    <Icon name="expand_more" className={`text-[20px] text-text-secondary transition-transform ${gapsOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {gapsOpen && (
                  <ul className="divide-y divide-border-subtle px-3">
                    {[...fit.gaps]
                      .sort((a, b) => ['앞', '뒤', '옆'].indexOf(a.side) - ['앞', '뒤', '옆'].indexOf(b.side))
                      .map((gap) => (
                        <li key={gap.dir} className="flex items-center justify-between py-2 text-[13px]">
                          <span className="text-text-secondary">
                            <span className="font-semibold text-text-primary">{gap.side}</span> · {gap.target}까지
                          </span>
                          <span className={`font-semibold ${gap.side === '앞' ? CHECK_ICON[gap.level] : 'text-text-primary'}`}>{gap.distance < 5 ? '붙어 있음' : cm(gap.distance)}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              {target?.kind === 'product' && <p className="mt-3 text-[11px] leading-relaxed text-text-muted">서랍 완전 개폐에 앞쪽 {cm(DRAWER_PULL)}가 필요해요. 바닥의 파란 영역이 서랍이 열리는 자리예요.</p>}
            </>
          ) : null}
            </>
  )

  // 탭 위에 놓이는 아코디언. 접어 두면 판정 한 줄만 보이고, 스크롤해도 탭과 함께 위에 붙어 따라온다.
  const diagnosisPanel = (
      <div className="border-b border-border-subtle bg-surface-base">
        <button type="button" onClick={() => setDiagOpen(!diagOpen)} aria-expanded={diagOpen} className="flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3 text-left">
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 whitespace-nowrap text-[14px] font-bold text-text-primary">공간 적합도 진단</span>
            {fit && verdict ? (
              <span className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${verdict.box} ${verdict.text}`}>
                <Icon name={verdict.icon} filled size={12} /> {VERDICT_SHORT[fit.verdict]}
              </span>
            ) : (
              <span className="truncate text-[11px] text-text-muted">가구를 선택해 주세요</span>
            )}
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <Icon name="expand_more" className={`shrink-0 text-[20px] text-text-secondary transition-transform ${diagOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {diagOpen && fit && <div className="max-h-[42vh] overflow-y-auto px-5 pb-4">{diagnosis}</div>}
      </div>
  )

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] lg:p-8" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div role="dialog" aria-modal="true" aria-labelledby="fit-title" className="flex h-[min(880px,94vh)] w-full max-w-[1320px] flex-col overflow-hidden rounded-2xl bg-surface-base shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-brand-sky-border bg-brand-sky-light px-2.5 py-0.5 text-[12px] font-bold text-primary-container">NEW 내 공간 맞춤 시뮬레이션</span>
              <span className="text-[12px] text-text-muted">오늘의집 3D 공간엔진</span>
            </div>
            <div className="flex items-center gap-1.5">
              <h2 id="fit-title" className="text-[22px] font-bold tracking-tight text-text-primary">내 공간에 맞는지 확인하기</h2>
              <span className="group relative inline-flex">
                <button type="button" aria-label="사용 방법 안내" className="rounded-full p-0.5 text-primary-container outline-none hover:bg-brand-sky-light focus-visible:bg-brand-sky-light">
                  <Icon name="info" className="text-[20px]" />
                </button>
                <span role="tooltip" className="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 w-max rounded-lg bg-inverse-surface/95 px-3 py-2 text-[12px] font-normal leading-relaxed text-inverse-on-surface opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="space-y-0.5 whitespace-nowrap">
                    <li>- 가구 드래그로 옮기기</li>
                    <li>- 빈 곳 드래그로 시점 돌리기 &amp; 휠로 확대</li>
                    <li>- 모바일 앱에서는 카메라 AR로 실제 크기를 볼 수 있어요</li>
                  </ul>
                </span>
              </span>
            </div>
            <p className="text-[13px] font-medium text-primary-container">
              {inDetail ? (cluster!.id === 'desk' ? '책상 치수와 서랍장 위치를 조정하고, 설치 조건을 확인해 보세요.' : '가구의 색상과 크기를 바꾸고, 어떻게 놓이는지 확인해 보세요.') : '방을 둘러보고, 가구를 배치해 보세요.'}
            </p>
          </div>
          <button type="button" onClick={close} aria-label="닫기" className="rounded-full p-2 text-text-secondary hover:bg-surface-subtle">
            <Icon name="close" className="text-[22px]" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col">
            {inDetail && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-base px-5 py-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setDetail(null)} className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[13px] font-semibold text-text-secondary hover:bg-surface-subtle">
                    <Icon name="arrow_back" className="text-[17px]" /> 방 전체
                  </button>
                  <span className="text-[14px] font-bold text-text-primary">{cluster!.title} 자세히 보기</span>
                  <span className="rounded-full bg-brand-sky-light px-2 py-0.5 text-[11px] font-semibold text-primary-container">360° 회전</span>
                </div>
              </div>
            )}

            <div className="relative min-h-0 flex-1 bg-surface-subtle">
              {!ready && (
                <div role="status" aria-live="polite" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface-subtle">
                  <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-container border-t-transparent" />
                  <span className="text-[13px] font-semibold text-text-secondary">3D 공간을 준비하고 있어요</span>
                </div>
              )}
              {!mount ? null : inDetail && cluster!.id === 'desk' && desk ? (
                <DetailScene key="desk" desk={desk} product={product} drawersOpen={isOpen(productId)} showDims={showDims} autoRotate={autoRotate} onMove={moveProduct} extras={deskChairs} onMoveExtra={(id, x, z) => updateItem(id, (item) => clampTo(item, x, z))} onReady={() => setReady(true)} />
              ) : inDetail ? (
                <ClusterScene key={cluster!.id} members={members} gaps={gaps} showDims={showDims} autoRotate={autoRotate} isDrawerOpen={(item) => isOpen(item.id)} onMoveMember={moveWithFollowers} onReady={() => setReady(true)} />
              ) : (
                <Scene
                  key="room"
                  detailButton
                  onOpeningMove={moveOpening}
                  distance={1.2}
                  onReady={() => setReady(true)}
                  room={room}
                  items={items}
                  selectedId={selectedId}
                  focus={target}
                  fit={fit}
                  view={view}
                  drawersOpen={false}
                  isDrawerOpen={(item) => isOpen(item.id)}
                  showFrontZone={target?.kind === 'product'}
                  onSelect={setSelectedId}
                  onMove={moveWithFollowers}
                  onOpenDetail={(id) => {
                    const clicked = items.find((item) => item.id === id)
                    const found = clicked ? clusterOf(clicked) : null
                    if (found) openDetail(found.id, id)
                  }}
                  canOpenDetail={(item) => clusterOf(item) !== null}
                />
              )}

              {toast && (
                <p role="status" className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-inverse-surface/90 px-4 py-2 text-[13px] text-inverse-on-surface shadow-lg">
                  {toast}
                </p>
              )}

              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                aria-pressed={expanded}
                aria-label={expanded ? '3D 화면 축소' : '3D 화면 확장'}
                title={expanded ? '3D 화면 축소 (상세 내용 보기)' : '3D 화면 확장 (상세 내용 숨기기)'}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface-base/95 text-text-secondary shadow-md backdrop-blur-md hover:text-on-primary-container"
              >
                <Icon name={expanded ? 'close_fullscreen' : 'open_in_full'} className="text-[18px]" />
              </button>

              {!inDetail && target && (
                <div className="pointer-events-none absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-inverse-surface/90 px-3 py-1 text-[12px] font-medium text-inverse-on-surface shadow-md">
                  <span>실측 규격 W{target.w} × D{target.d} × H{target.h}mm</span>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-border-default bg-surface-base/95 px-3 py-1.5 shadow-md backdrop-blur-md">
                {inDetail ? (
                  <>
                    <StageButton icon="360" label="360° 자동 회전" active={autoRotate} onClick={() => setAutoRotate(!autoRotate)} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="straighten" label="간격 표시" active={showDims} onClick={() => setShowDims(!showDims)} />
                    {cluster!.id === 'desk' && product && (
                      <>
                        <span className="text-border-default">|</span>
                        <StageButton icon="open_in_full" label={isOpen(productId) ? '서랍 닫기' : '서랍 열어보기'} active={isOpen(productId)} onClick={() => toggleOpen(productId)} />
                        <span className="text-border-default">|</span>
                        <StageButton icon="align_horizontal_left" label="아래 왼쪽" onClick={() => placeProduct((d, item) => placeUnderDesk(d, item, 'left'))} />
                        <StageButton icon="align_horizontal_right" label="아래 오른쪽" onClick={() => placeProduct((d, item) => placeUnderDesk(d, item, 'right'))} />
                        <StageButton icon="east" label="책상 옆" onClick={() => placeProduct(placeBesideDesk)} />
                      </>
                    )}
                    {cluster!.id === 'bed' && (
                      <>
                        <span className="text-border-default">|</span>
                        <StageButton icon="open_in_full" label={drawerItem && isOpen(drawerItem.id) ? '서랍 닫기' : '서랍 열어보기'} active={!!drawerItem && isOpen(drawerItem.id)} onClick={() => drawerItem && toggleOpen(drawerItem.id)} />
                        <span className="text-border-default">|</span>
                        <StageButton icon="align_horizontal_left" label="왼쪽 옆" onClick={() => arrange(drawerItem, bedItem, 'left', 60, false)} />
                        <StageButton icon="align_horizontal_right" label="오른쪽 옆" onClick={() => arrange(drawerItem, bedItem, 'right', 60, false)} />
                        <StageButton icon="south" label="침대 발치" onClick={() => arrange(drawerItem, bedItem, 'front', 60, false)} />
                      </>
                    )}
                    {cluster!.id === 'table' && (
                      <>
                        <span className="text-border-default">|</span>
                        <StageButton icon="align_horizontal_left" label="의자 왼쪽" onClick={() => arrange(chairItem, tableItem, 'left', 60, true)} />
                        <StageButton icon="align_horizontal_right" label="의자 오른쪽" onClick={() => arrange(chairItem, tableItem, 'right', 60, true)} />
                        <StageButton icon="south" label="의자 앞" onClick={() => arrange(chairItem, tableItem, 'front', 60, true)} />
                        <StageButton icon="north" label="의자 뒤" onClick={() => arrange(chairItem, tableItem, 'back', 60, true)} />
                        <span className="text-border-default">|</span>
                        <StageButton icon="keyboard_double_arrow_up" label="소파 맞은편" onClick={() => arrange(sofaItem, tableItem, 'back', 900, true)} />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <StageButton icon="rotate_90_degrees_cw" label="90° 회전 (R)" onClick={rotateSelected} disabled={!selected} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="vertical_align_top" label="벽에 붙이기" onClick={() => selected && commitBase(selected, backToWall(selected, room))} disabled={!selected} />
                    <span className="text-border-default">|</span>
                    {selected && (selected.kind === 'product' || selected.model === 'drawerunit') && (
                      <>
                        <StageButton icon="open_in_full" label={isOpen(selected.id) ? '서랍 닫기' : '서랍 열어보기'} active={isOpen(selected.id)} onClick={() => toggleOpen(selected.id)} />
                        <span className="text-border-default">|</span>
                      </>
                    )}
                    <StageButton icon={view === 'persp' ? 'grid_view' : 'view_in_ar'} label={view === 'persp' ? '위에서 보기' : '3D로 보기'} active={view === 'top'} onClick={() => setView(view === 'persp' ? 'top' : 'persp')} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="refresh" label="초기화" onClick={reset} />
                  </>
                )}
              </div>

              {inDetail && (
                <p className="pointer-events-none absolute right-16 top-4 rounded-lg bg-inverse-surface/75 px-3 py-1.5 text-[12px] text-white">
                  {cluster!.id === 'desk' ? `드래그: 360° 돌려 보기 · ${product ? '서랍장' : '의자'} 끌기: 위치 옮기기 · 휠: 확대` : '드래그: 360° 돌려 보기 · 휠: 확대'}
                </p>
              )}
            </div>
          </div>

          {!expanded && (
            <aside ref={asideRef} onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 120)} className="flex w-[400px] shrink-0 flex-col overflow-y-auto border-l border-border-default">
              {!inDetail && target && (
                <section className="border-b border-border-subtle px-5 py-4">
                  <div className="flex gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
                      {target.image ? <img src={target.image} alt="" className="h-full w-full object-contain" /> : <Icon name="chair" className="text-[28px] text-text-muted" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-primary-container">선택한 가구</p>
                      <h2 className="line-clamp-2 text-[15px] font-bold leading-snug">{target.name}</h2>
                      <p className="mt-0.5 text-[12px] text-text-secondary">{sizeText(target)}</p>
                    </div>
                  </div>
                  {target.kind === 'product' && <ColorChips options={PRODUCT_COLOR_OPTIONS} isOn={(option) => option.hex === target.color} onPick={(option) => pickProductColor(target, option)} />}
                  {options && (
                    <ColorChips
                      options={options}
                      isOn={(option) => (target.tint ? option.hex === target.tint && option.hex2 === target.tint2 : !!option.isDefault)}
                      onPick={(option) => updateItem(target.id, (item) => ({ ...item, tint: option.isDefault ? undefined : option.hex, tint2: option.isDefault ? undefined : option.hex2 }))}
                    />
                  )}
                  {target.model === 'bedset' && <ColorChips title="프레임 색상" options={BED_FRAME_COLORS} isOn={(option) => (target.frameTint ? option.hex === target.frameTint : !!option.isDefault)} onPick={(option) => pickFrameColor(target, option)} />}
                </section>
              )}

              <div className="sticky top-0 z-20 bg-surface-base">
              {diagnosisPanel}
              <div role="tablist" aria-label="설정" className="flex border-b border-border-default bg-surface-base">
                {inDetail
                  ? (cluster!.id === 'desk'
                      ? ((product ? [{ id: 'members', label: '가구 정보' }, { id: 'cabinet', label: '서랍장 위치·바퀴' }] : [{ id: 'members', label: '가구 정보' }]) as { id: DetailTab; label: string }[])
                      : ([{ id: 'members', label: '가구 정보' }] as { id: DetailTab; label: string }[])
                    ).map((item) => (
                      <button key={item.id} type="button" role="tab" aria-selected={detailTab === item.id} onClick={() => setDetailTab(item.id)} className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-[13px] transition-colors ${detailTab === item.id ? 'border-primary-container font-bold text-on-primary-container' : 'border-transparent font-medium text-text-secondary hover:text-text-primary'}`}>
                        {item.label}
                      </button>
                    ))
                  : TABS.map((item) => (
                      <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-[13px] transition-colors ${tab === item.id ? 'border-primary-container font-bold text-on-primary-container' : 'border-transparent font-medium text-text-secondary hover:text-text-primary'}`}>
                        {item.label}
                      </button>
                    ))}
              </div>
              </div>

              {inDetail && cluster!.id === 'desk' && desk && product && detailTab === 'cabinet' && (
                <Section>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13px] font-bold text-text-primary">서랍장 위치</h4>
                    {offsets && (
                      <div className="flex rounded-lg bg-surface-subtle p-0.5">
                        {(['left', 'right'] as const).map((side) => (
                          <button key={side} type="button" onClick={() => setOffsets({ side })} className={`rounded-md px-2.5 py-1 text-[12px] ${offsets.side === side ? 'bg-surface-base font-semibold text-on-primary-container shadow-xs' : 'text-text-secondary'}`}>
                            {side === 'left' ? '왼쪽 다리 쪽' : '오른쪽 다리 쪽'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {offsets ? (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <NumberField label={`${offsets.side === 'left' ? '왼쪽' : '오른쪽'} 다리와 간격`} value={offsets.leg} min={0} max={Math.max(0, Math.round(legInner(desk) * 2 - product.w))} onCommit={(leg) => setOffsets({ leg })} />
                      <NumberField label="뒤(벽 쪽) 간격" value={offsets.back} min={0} max={Math.max(0, desk.d - product.d)} onCommit={(back) => setOffsets({ back })} />
                    </div>
                  ) : (
                    <button type="button" onClick={() => setOffsets({})} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-primary-container bg-brand-sky-light py-2 text-[13px] font-semibold text-on-primary-container">
                      <Icon name="south" className="text-[16px]" /> 책상 아래로 넣기
                    </button>
                  )}
                  <div className="mt-4 border-t border-border-subtle pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[13px] font-bold text-text-primary">바퀴</h4>
                        <p className="text-[11px] text-text-muted">{(product.caster ?? 0) > 0 ? `바퀴 ${product.caster}mm 포함 · 높이 ${product.h}mm` : `바퀴 없음 · 높이 ${product.h}mm`}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={(product.caster ?? 0) > 0}
                        aria-label="바퀴 유무"
                        onClick={() => setCaster((product.caster ?? 0) > 0 ? 0 : WHEEL_DEFAULT)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${(product.caster ?? 0) > 0 ? 'bg-primary-container' : 'bg-border-default'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-base shadow transition-all ${(product.caster ?? 0) > 0 ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {(product.caster ?? 0) > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <NumberField label="바퀴 높이" value={product.caster ?? WHEEL_DEFAULT} min={WHEEL_MIN} max={WHEEL_MAX} onCommit={setCaster} />
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {inDetail && detailTab === 'members' && (
                <Section>
                  {cluster!.id === 'desk' && desk && (
                    <div className="mt-3 rounded-xl border border-border-default px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[13px] font-bold text-text-primary">
                          설치 공간 치수 <span className="ml-1 rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">중요</span>
                        </h4>
                        <ResetButton label="설치 공간 치수" disabled={!installChanged(desk)} onClick={() => { const first = initialOf(desk.id); if (first) updateDesk({ underClearance: first.underClearance, legGap: first.legGap }) }} />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <NumberField label="상판 아래 높이" value={undersideOf(desk)} min={300} max={desk.h - DESK_TOP} onCommit={(underClearance) => updateDesk({ underClearance })} />
                        <NumberField label="다리 안쪽 폭" value={legInner(desk) * 2} min={300} max={maxLegGap(desk.w)} onCommit={(legGap) => updateDesk({ legGap })} />
                      </div>
                    </div>
                  )}
                  <ul className="mt-3 space-y-3">
                    {members
                      .filter((member) => (member.kind !== 'rug' || cluster!.id !== 'desk') && !HANGER_KEYS.slice(1).includes(keyOf(member)))
                      .map((member) => {
                        const memberOptions = member.kind === 'product' ? undefined : COLOR_OPTIONS[keyOf(member)]
                        const resizable = member.model !== 'motiondesk'
                        return (
                          <li key={member.id} className={`rounded-xl border px-3 py-3 ${target?.id === member.id ? 'border-primary-container bg-brand-sky-light' : 'border-border-default'}`}>
                            <div className="flex items-center gap-2">
                              <div onClick={() => setSelectedId(member.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-subtle">
                                  {member.image ? <img src={member.image} alt="" className="h-full w-full object-contain" /> : <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: member.color }} />}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-[13px] font-semibold">{member.name}</span>
                                  <span className="block text-[11px] text-text-muted">{sizeText(member)}</span>
                                </span>
                              </div>
                              {resizable && <ResetButton label={member.name} disabled={!sizeChanged(member)} onClick={() => resetSize(member.id)} />}
                              {member.model === 'motiondesk' && <ResetButton label={member.name} disabled={!deskSizeChanged(member)} onClick={() => { const first = initialOf(member.id); if (first) updateDesk({ w: first.w, d: first.d, h: first.h, underClearance: first.underClearance, legGap: first.legGap }) }} />}
                            </div>
                            {member.kind === 'product' && <ColorChips options={PRODUCT_COLOR_OPTIONS} isOn={(option) => option.hex === member.color} onPick={(option) => pickProductColor(member, option)} />}
                            {member.model === 'bedset' && <ColorChips title="프레임 색상" options={BED_FRAME_COLORS} isOn={(option) => (member.frameTint ? option.hex === member.frameTint : !!option.isDefault)} onPick={(option) => pickFrameColor(member, option)} />}
                            {memberOptions && (
                              <ColorChips
                                options={memberOptions}
                                isOn={(option) => (member.tint ? option.hex === member.tint && option.hex2 === member.tint2 : !!option.isDefault)}
                                onPick={(option) => updateItem(member.id, (item) => ({ ...item, tint: option.isDefault ? undefined : option.hex, tint2: option.isDefault ? undefined : option.hex2 }))}
                              />
                            )}
                            {member.model === 'motiondesk' && cluster!.id === 'desk' && (
                              <div className="mt-3 border-t border-border-subtle pt-3">
                                <h4 className="flex items-center gap-0.5 text-[13px] font-bold text-text-primary">
                                  책상 전체 크기
                                  <InfoTip label="치수 입력 안내">
                                    상판 아래 높이는 바닥에서 상판 밑면까지의 거리예요. 다리 안쪽 폭은 양쪽 다리 사이의 거리예요. 치수를 바꿔도 서랍장은 다리·뒤 간격을 유지하며 따라가요.
                                  </InfoTip>
                                </h4>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  <NumberField
                                    label="가로"
                                    value={member.w}
                                    min={600}
                                    max={room.w}
                                    onCommit={(w) => {
                                      const gap = legInner(member) * 2 + (w - member.w)
                                      updateDesk({ w, legGap: Math.max(300, Math.min(gap, maxLegGap(w))) })
                                    }}
                                  />
                                  <NumberField label="깊이" value={member.d} min={400} max={1200} onCommit={(d) => updateDesk({ d })} />
                                  <NumberField label="높이" value={member.h} min={500} max={1200} onCommit={(h) => updateDesk({ h, underClearance: Math.min(undersideOf(member) + h - member.h, h - DESK_TOP) })} />
                                </div>
                              </div>
                            )}
                            {resizable && (
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                <NumberField label="가로" value={member.w} min={50} max={room.w} onCommit={(w) => setSize(member.id, { w })} />
                                <NumberField label="깊이" value={member.d} min={50} max={room.d} onCommit={(d) => setSize(member.id, { d })} />
                                <NumberField label="높이" value={member.h} min={5} max={room.h} onCommit={(h) => setSize(member.id, { h })} />
                              </div>
                            )}
                          </li>
                        )
                      })}
                  </ul>
                </Section>
              )}

              {!inDetail && tab === 'space' && (
                <Section>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_FIELDS.map((field) => (
                      <NumberField
                        key={field.key}
                        label={field.label}
                        value={dims[field.key]}
                        min={1}
                        max={ROOM_MAX}
                        step={1}
                        onCommit={(value) => {
                          setPresetId(null)
                          setDims({ ...dims, [field.key]: value })
                        }}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {!inDetail && tab === 'all' && (
                <section className="px-5 py-4">
                  <div className="mb-3 flex rounded-lg bg-surface-subtle p-0.5">
                    {([['placed', `배치된 가구 목록 ${listedCount}`], ['catalog', `전체 가구 목록 ${DEMO_FURNITURE.length + 1}`]] as const).map(([id, label]) => (
                      <button key={id} type="button" aria-pressed={sub === id} onClick={() => setSub(id)} className={`flex-1 cursor-pointer rounded-md py-1.5 text-[12px] ${sub === id ? 'bg-surface-base font-semibold text-on-primary-container shadow-xs' : 'text-text-secondary'}`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {sub === 'placed' && (
                    <>
                      <input type="search" value={placedQuery} onChange={(event) => setPlacedQuery(event.target.value)} placeholder="이름·브랜드 검색" className="h-9 w-full rounded-full border border-border-default bg-surface-base px-4 text-[13px] outline-none focus:border-primary-container" />
                      <div className="mb-3 mt-2 flex flex-wrap gap-1.5">
                        {(['전체', '가구', '소품', '벽·천장'] as const).map((id) => (
                          <button key={id} type="button" onClick={() => setPlacedCategory(id)} className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] ${placedCategory === id ? 'border-primary-container bg-brand-sky-light font-semibold text-on-primary-container' : 'border-border-default text-text-secondary'}`}>
                            {id}
                          </button>
                        ))}
                      </div>
                      <ul className="space-y-1.5">
                        {visibleGroups.map((group) => {
                          const item = group.find((member) => member.id === selectedId) ?? group[0]
                          const last = group[group.length - 1]
                          return (
                            <li key={keyOf(item)}>
                              <div className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-2 ${group.some((member) => member.id === selectedId) ? 'border-primary-container bg-brand-sky-light' : 'border-border-default'}`}>
                                <button type="button" onClick={() => setSelectedId(item.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left">
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-subtle">
                                    {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain" /> : <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: item.color }} />}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-[13px] font-semibold">{item.name}</span>
                                    <span className="block text-[11px] text-text-muted">{sizeText(item)}</span>
                                  </span>
                                </button>
                                {(
                                  <>
                                    <CountControls name={item.name} count={group.length} min={1} onMinus={() => remove(last.id)} onPlus={() => duplicate(item)} />
                                    <RemoveAll name={item.name} onClick={() => group.forEach((member) => remove(member.id))} />
                                  </>
                                )}
                              </div>
                            </li>
                          )
                        })}
                        {doorFurniture && matchesPlaced(DOOR_ID, doorFurniture.name) && (
                          <li>
                            <div className="flex items-center gap-2 rounded-lg border border-border-default px-2.5 py-2">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-subtle">
                                <img src={doorFurniture.image} alt="" className="h-full w-full object-contain" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] font-semibold">{doorFurniture.name}</span>
                                <span className="block text-[11px] text-text-muted">방 구조에 포함돼요</span>
                              </span>
                            </div>
                          </li>
                        )}
                        {windowFurniture && matchesPlaced(WINDOW_ID, windowFurniture.name) && (
                          <li>
                            <div className="relative flex items-center gap-2 rounded-lg border border-border-default px-2.5 py-2">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-subtle">
                                <img src={windowFurniture.image} alt="" className="h-full w-full object-contain" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-semibold">{windowFurniture.name}</span>
                                <span className="block text-[11px] text-text-muted">벽에 낸 창문 · 최대 {MAX_WINDOWS}개</span>
                              </span>
                              <CountControls name={windowFurniture.name} count={windowCount} min={0} max={MAX_WINDOWS} onMinus={() => setWindowCount((n) => n - 1)} onPlus={() => setWindowCount((n) => n + 1)} />
                              {windowCount > 0 && <RemoveAll name={windowFurniture.name} onClick={() => setWindowCount(0)} />}
                            </div>
                          </li>
                        )}
                        {visibleGroups.length === 0 && !(doorFurniture && matchesPlaced(DOOR_ID, doorFurniture.name)) && !(windowFurniture && matchesPlaced(WINDOW_ID, windowFurniture.name)) && <li className="py-10 text-center text-[13px] text-text-muted">조건에 맞는 가구가 없어요</li>}
                      </ul>
                    </>
                  )}

                  {sub === 'catalog' && (
                    <>
                      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·브랜드 검색" className="h-9 w-full rounded-full border border-border-default bg-surface-base px-4 text-[13px] outline-none focus:border-primary-container" />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(['전체', '가구', '소품', '벽·천장'] as const).map((id) => (
                          <button key={id} type="button" onClick={() => setCategory(id)} className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] ${category === id ? 'border-primary-container bg-brand-sky-light font-semibold text-on-primary-container' : 'border-border-default text-text-secondary'}`}>
                            {id}
                          </button>
                        ))}
                      </div>
                      {visibleCatalog.length === 0 && !showCabinet ? (
                        <p className="py-10 text-center text-[13px] text-text-muted">조건에 맞는 가구가 없어요</p>
                      ) : (
                        <ul className="mt-3 grid grid-cols-2 gap-2.5">
                          {showCabinet && (
                            <li>
                              <button type="button" onClick={addCabinet} className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border-default bg-surface-base text-left hover:border-primary-container">
                                <span className="relative block aspect-square bg-surface-subtle">
                                  <img src={CABINET_IMAGE} alt="" loading="lazy" className="h-full w-full object-contain" />
                                  {cabinetCount > 0 && <span aria-label="배치됨" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary-container" />}
                                </span>
                                <span className="flex flex-1 flex-col gap-0.5 p-2">
                                  <span className="line-clamp-2 text-[12px] font-bold leading-4">{PRODUCT.shortName}</span>
                                  <span className="text-[11px] text-text-muted">{sizeText({ w: PRODUCT.size.w, d: PRODUCT.size.d, h: PRODUCT.bodyH + WHEEL_DEFAULT })}</span>
                                </span>
                              </button>
                            </li>
                          )}
                          {visibleCatalog.map((furniture) => {
                            const bundledInto = BUNDLE_OF[furniture.id]
                            const placedCount = items.filter((item) => keyOf(item) === (bundledInto ?? furniture.id)).length
                            const missing = needsSize(furniture)
                            return (
                              <li key={furniture.id}>
                                <button type="button" onClick={() => (missing ? openCustomFor(furniture) : addFromCatalog(furniture))} className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border-default bg-surface-base text-left hover:border-primary-container">
                                  <span className="relative block aspect-square bg-surface-subtle">
                                    <img src={furniture.image} alt="" loading="lazy" className="h-full w-full object-contain" />
                                    {placedCount > 0 && <span aria-label="배치됨" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary-container" />}
                                  </span>
                                  <span className="flex flex-1 flex-col gap-0.5 p-2">
                                    <span className="line-clamp-2 text-[12px] font-bold leading-4">{furniture.name}</span>
                                    {bundledInto && <span className="text-[11px] font-semibold text-primary-container">침대에 포함돼요(침대 위에 덮임)</span>}
                                    <span className="text-[11px] text-text-muted">{missing ? '치수 정보 없음' : sizeText({ w: furniture.size.w, d: furniture.size.d, h: furniture.size.h })}</span>
                                    {(missing || bundledInto) && <span className={`mt-1 text-[11px] font-semibold ${missing ? 'text-status-warn' : 'text-primary-container'}`}>{missing ? '치수 입력하기' : '침대와 함께 놓기'}</span>}
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  )}
                </section>
              )}

              {!inDetail && tab === 'custom' && (
                <section className="relative border-b border-border-subtle px-5 py-4">
                  <div aria-hidden="true" inert className="pointer-events-none select-none blur-[6px]">
                  <p className="mb-3 text-[12px] leading-relaxed text-text-secondary">등록되어 있지 않은 가구는 줄자로 잰 치수를 넣어 주세요. 입력한 크기 그대로 3D 영역에 놓여요.</p>
                  <div className="space-y-3">
                    <div>
                      <span className="block text-[13px] text-text-secondary">가구 종류 (선택)</span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {CUSTOM_KINDS.map((kind) => (
                          <button key={kind} type="button" aria-pressed={draft.name === kind} onClick={() => setDraft({ ...draft, name: draft.name === kind ? '' : kind })} className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] ${draft.name === kind ? 'border-primary-container bg-brand-sky-light font-semibold text-on-primary-container' : 'border-border-default text-text-secondary'}`}>
                            {kind}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                      <NumberField pill label="가로" value={draft.w} min={50} max={room.w} onCommit={(w) => setDraft({ ...draft, w })} />
                      <NumberField pill label="세로(깊이)" value={draft.d} min={50} max={room.d} onCommit={(d) => setDraft({ ...draft, d })} />
                      <NumberField pill label="높이" value={draft.h} min={50} max={room.h} onCommit={(h) => setDraft({ ...draft, h })} />
                    </div>
                  </div>
                  <button type="button" onClick={addCustom} disabled={!draftValid} className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary-container py-3 text-[14px] font-bold text-white disabled:cursor-default disabled:opacity-40">
                    <Icon name="add" className="text-[18px]" /> 놓기
                  </button>
                  </div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-xl">
                    <span className="text-[26px] font-semibold tracking-tight text-white/70" style={{ fontFamily: PRETENDARD }}>11.16 COMING SOON</span>
                    <span className="text-[40px] font-extrabold leading-none tracking-tight text-white" style={{ fontFamily: PRETENDARD }}>오늘의집</span>
                  </div>
                </section>
              )}

              {!inDetail && tab === 'all' && scrolled && (
                <div className="pointer-events-none sticky bottom-3 z-10 -mt-8 flex h-8 shrink-0 justify-end pr-4">
                  <button type="button" aria-label="맨 위로 올라가기" title="맨 위로" onClick={() => asideRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="pointer-events-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface-base/95 text-text-secondary shadow-md hover:border-primary-container hover:text-primary-container">
                    <Icon name="keyboard_arrow_up" size={18} />
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
