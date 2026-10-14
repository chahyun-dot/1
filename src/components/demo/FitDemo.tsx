import { useMemo, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import Scene, { type View } from '@/components/fit/Scene'
import { PLANNER_ROOM, plannerItems } from '@/data/plannerLayout'
import { BED_SET_SUFFIX, BUNDLE_OF, DEMO_FURNITURE, FURNITURE, MODEL_BY_FURNITURE, categoryOf, hasSize, type Furniture, type FurnitureCategory } from '@/data/furniture'
import { backToWall, clampToRoom, evaluate, findFreeSpot, measureFurniture } from '@/lib/fit'
import type { Item, Room, Rot } from '@/lib/types'

// 데모: 현재 "내 공간에 맞는지 확인하기"와 별개로, 3D 영역에 가구를 더하고 크기·여유를 보는 개정판.
// 오른쪽 탭 = 배치된 가구 / 상품 종류 / 직접 입력.

// 플래너 프로젝트(Archisketch)와 같은 방·배치로 시작한다.
const BASE_ROOM = PLANNER_ROOM

type Tab = 'placed' | 'catalog' | 'custom'

const TABS: { id: Tab; label: string }[] = [
  { id: 'placed', label: '배치된 가구' },
  { id: 'catalog', label: '상품 종류' },
  { id: 'custom', label: '직접 입력' },
]

const CATEGORY_COLOR: Record<FurnitureCategory | '직접 입력', string> = {
  가구: '#9aa6b2',
  소품: '#d1b58a',
  '벽·천장': '#7fb0cf',
  '직접 입력': '#a89be0',
}

const CUSTOM_KINDS = ['침대', '테이블·식탁·책상', '소파', '서랍·수납장', '선반', '의자', '진열장·책장', '거울']
const DOOR_ID = 'YPGPhJp77841A682B5A4CD2'
const WINDOW_ID = 'E976B33E1388415C'

const initialItems = (): Item[] => plannerItems()

const sizeText = (item: Pick<Item, 'w' | 'd' | 'h'>) => `W${item.w} × D${item.d} × H${item.h}mm`

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

// 카드 오른쪽 위 모서리에 작게 붙는 "모두 빼기" 버튼.
function RemoveAll({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={`${name} 모두 빼기`} onClick={onClick} className="absolute right-1 top-1 flex h-[15px] w-[15px] cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle hover:text-status-bad">
      <Icon name="close" size={19} />
    </button>
  )
}

function NumberInput({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  const invalid = !(value >= 50 && value <= max)
  return (
    <label className="block text-[13px] text-text-secondary">
      {label}
      <div className="mt-1 flex items-center gap-1.5">
        <input
          type="number"
          step={10}
          min={50}
          max={max}
          value={value || ''}
          onChange={(event) => onChange(Number(event.target.value))}
          className={`h-10 min-w-0 flex-1 rounded-full border bg-surface-base px-4 text-[15px] text-text-primary outline-none focus:ring-2 ${
            invalid ? 'border-status-bad focus:ring-status-bad/20' : 'border-border-default focus:border-primary-container focus:ring-primary-container/20'
          }`}
        />
        <span className="text-[13px] text-text-muted">mm</span>
      </div>
      {invalid && <span className="mt-0.5 block text-[11px] text-status-bad">50~{max.toLocaleString()}mm 로 입력해 주세요</span>}
    </label>
  )
}

export default function FitDemo() {
  const [items, setItems] = useState<Item[]>(initialItems)
  // 창문은 처음 4개 자리에서만 생기고 없어진다(최대 4개).
  const [windowCount, setWindowCount] = useState(BASE_ROOM.openings!.windows.length)
  const room = useMemo<Room>(() => ({ ...BASE_ROOM, openings: { ...BASE_ROOM.openings!, windows: BASE_ROOM.openings!.windows.slice(0, windowCount) } }), [windowCount])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<View>('persp')
  const [tab, setTab] = useState<Tab>('placed')
  const [toast, setToast] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FurnitureCategory | '전체'>('전체')
  const [draft, setDraft] = useState({ name: '', w: 600, d: 600, h: 800 })
  const counter = useRef(0)
  const toastTimer = useRef<number | undefined>(undefined)

  const selected = items.find((item) => item.id === selectedId) ?? null
  const fit = useMemo(() => {
    if (!selected) return null
    return selected.kind === 'product' ? evaluate(selected, room, items) : measureFurniture(selected, room, items)
  }, [selected, items])

  const say = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }

  const updateItem = (id: string, patch: (item: Item) => Item) => setItems((prev) => prev.map((item) => (item.id === id ? patch(item) : item)))

  const addBox = (id: string, name: string, size: { w: number; d: number; h: number }, color: string, image?: string, model: Item['model'] = 'box', elevation?: number) => {
    const item: Item = { id, name, kind: 'furniture', model, elevation, rot: 0, x: room.w / 2, z: room.d / 2, color, image, ...size }
    const spot = findFreeSpot(item, room, items)
    const placed: Item = { ...item, ...(spot ?? clampToRoom(item, room.w / 2, room.d / 2, room)) }
    setItems((prev) => [...prev, placed])
    setSelectedId(placed.id)
    say(spot ? `${name}을(를) 놓았어요` : '빈 자리가 없어 가운데에 겹쳐 놓았어요. 끌어서 옮겨 주세요.')
  }

  const addFromCatalog = (picked: Furniture) => {
    // 침구처럼 다른 가구와 하나로 놓이는 것은 짝 가구(침대)로 놓는다.
    const furniture = FURNITURE.find((f) => f.id === BUNDLE_OF[picked.id]) ?? picked
    const spec = MODEL_BY_FURNITURE[furniture.id]
    const n = items.filter((item) => item.id.startsWith(`${furniture.id}#`)).length + 1
    const name = spec?.model === 'bedset' ? `${furniture.name}${BED_SET_SUFFIX}` : furniture.name
    addBox(`${furniture.id}#${n}`, name, { w: furniture.size.w, d: furniture.size.d, h: furniture.size.h }, CATEGORY_COLOR[categoryOf(furniture)], furniture.image, spec?.model, spec?.elevation)
  }

  const addCustom = () => {
    counter.current += 1
    const name = draft.name.trim() || `내 가구 ${counter.current}`
    addBox(`custom-${counter.current}`, name, { w: draft.w, d: draft.d, h: draft.h }, CATEGORY_COLOR['직접 입력'])
  }

  // 목록의 + 버튼: 같은 가구를 하나 더 놓는다(빈 자리를 찾아서).
  const duplicate = (source: Item) => {
    const key = source.id.split('#')[0]
    const n = Math.max(0, ...items.filter((item) => item.id.split('#')[0] === key).map((item) => Number(item.id.split('#')[1] ?? 1))) + 1
    const item: Item = { ...source, id: `${key}#${n}`, x: room.w / 2, z: room.d / 2 }
    const spot = findFreeSpot(item, room, items)
    const placed: Item = { ...item, ...(spot ?? clampToRoom(item, room.w / 2, room.d / 2, room)) }
    setItems((prev) => [...prev, placed])
    setSelectedId(placed.id)
    say(spot ? `${source.name}을(를) 하나 더 놓았어요` : '빈 자리가 없어 가운데에 겹쳐 놓았어요. 끌어서 옮겨 주세요.')
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const rotate = () => {
    if (!selected) return
    updateItem(selected.id, (item) => {
      const turned = { ...item, rot: ((item.rot + 1) % 4) as Rot }
      return { ...turned, ...clampToRoom(turned, item.x, item.z, room) }
    })
  }

  const needsSize = (furniture: Furniture) => !hasSize(furniture)
  const openCustomFor = (furniture: Furniture) => {
    setDraft({ name: furniture.name, w: furniture.size.w || 600, d: furniture.size.d || 600, h: furniture.size.h || 800 })
    setTab('custom')
    say('치수를 알려 주세요. 입력하면 3D에 놓을 수 있어요.')
  }

  const visibleCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_FURNITURE.filter((f) => (category === '전체' || categoryOf(f) === category) && (q === '' || `${f.name} ${f.brand ?? ''}`.toLowerCase().includes(q)))
  }, [query, category])

  // 같은 상품은 3D 에 몇 개를 놓았든 목록에서 한 줄(상품 종류 1개)로 센다. 문·창문도 한 종류씩 센다.
  const groups = useMemo(() => {
    const map = new Map<string, Item[]>()
    items.forEach((item) => {
      const key = item.id.split('#')[0]
      map.set(key, [...(map.get(key) ?? []), item])
    })
    return [...map.values()]
  }, [items])
  const doorFurniture = FURNITURE.find((f) => f.id === DOOR_ID)
  const windowFurniture = FURNITURE.find((f) => f.id === WINDOW_ID)
  const listedCount = groups.length + (doorFurniture ? 1 : 0) + (windowFurniture && windowCount > 0 ? 1 : 0)
  const draftValid = draft.w >= 50 && draft.w <= room.w && draft.d >= 50 && draft.d <= room.d && draft.h >= 50 && draft.h <= room.h

  return (
    <div className="flex h-screen flex-col bg-surface-base text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default px-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-brand-sky-border bg-brand-sky-light px-2.5 py-0.5 text-[12px] font-bold text-primary-container">DEMO</span>
          <h1 className="text-[17px] font-bold">내 공간에 가구 배치해 보기</h1>
          <span className="text-[12px] text-text-muted">플래너 배치 (4.2×4.2m, 천장 2.3m) · 실측 치수 1:1</span>
        </div>
        <a href="#/" className="text-[14px] font-medium text-primary-container">상품 페이지로 돌아가기</a>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 bg-[#2b2c2f]">
          <div className="absolute inset-0">
            <Scene
              room={room}
              items={items}
              selectedId={selectedId}
              focus={selected}
              fit={fit}
              view={view}
              drawersOpen={false}
              showFrontZone={selected?.kind === 'product'}
              distance={1.18}
              onSelect={setSelectedId}
              onMove={(id, x, z) => updateItem(id, (item) => ({ ...item, ...clampToRoom(item, x, z, room) }))}
              onOpenDetail={() => undefined}
            />
          </div>

          {toast && (
            <p role="status" className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-inverse-surface/90 px-4 py-2 text-[13px] text-inverse-on-surface shadow-lg">
              {toast}
            </p>
          )}

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-surface-base px-3 py-1.5 shadow-lg">
            {[
              { icon: 'rotate_right', label: '90° 회전', onClick: rotate, disabled: !selected },
              { icon: 'vertical_align_top', label: '벽에 붙이기', onClick: () => selected && updateItem(selected.id, (item) => backToWall(item, room)), disabled: !selected },
              { icon: view === 'top' ? 'view_in_ar' : 'grid_view', label: view === 'top' ? '비스듬히 보기' : '위에서 보기', onClick: () => setView(view === 'top' ? 'persp' : 'top'), disabled: false },
              { icon: 'restart_alt', label: '초기화', onClick: () => { setItems(initialItems()); setSelectedId(null); say('처음 배치로 되돌렸어요') }, disabled: false },
            ].map((button) => (
              <button
                key={button.label}
                type="button"
                onClick={button.onClick}
                disabled={button.disabled}
                className="flex cursor-pointer items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-text-secondary hover:text-primary-container disabled:cursor-default disabled:opacity-40"
              >
                <Icon name={button.icon} className="text-[16px]" /> {button.label}
              </button>
            ))}
          </div>
        </div>

        <aside className="flex w-[400px] shrink-0 flex-col overflow-y-auto border-l border-border-default">
          {selected && fit ? (
            <section className="border-b border-border-subtle px-5 py-4">
              <div className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
                  {selected.image ? <img src={selected.image} alt="" className="h-full w-full object-contain" /> : <Icon name="chair" className="text-[28px] text-text-muted" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-primary-container">선택한 가구</p>
                  <h2 className="line-clamp-2 text-[15px] font-bold leading-snug">{selected.name}</h2>
                  <p className="mt-0.5 text-[12px] text-text-secondary">{sizeText(selected)}</p>
                </div>
              </div>


            </section>
          ) : (
            <section className="border-b border-border-subtle px-5 py-6 text-[13px] text-text-secondary">3D 영역의 가구를 누르거나, 아래 목록에서 골라 보세요. 크기가 여기에 나와요.</section>
          )}

          <div role="tablist" aria-label="가구" className="sticky top-0 z-10 flex border-b border-border-default bg-surface-base">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1 border-b-2 px-2 py-3 text-[13px] ${
                  tab === item.id ? 'border-primary-container font-bold text-on-primary-container' : 'border-transparent font-medium text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
                {item.id === 'placed' && <span className="text-text-muted">{listedCount}</span>}
                {item.id === 'catalog' && <span className="text-text-muted">{DEMO_FURNITURE.length}</span>}
              </button>
            ))}
          </div>

          {tab === 'placed' && (
            <section className="px-5 py-4">
              <p className="mb-3 text-[12px] text-text-secondary">3D 영역에 놓인 가구를 상품 종류별로 모았어요(같은 상품은 한 줄, +/−로 개수 조절). 누르면 3D 영역에서 선택돼요.</p>
              <ul className="space-y-1.5">
                {groups.map((group) => {
                  const item = group.find((member) => member.id === selectedId) ?? group[0]
                  const last = group[group.length - 1]
                  return (
                    <li key={item.id.split('#')[0]}>
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
                        {item.kind !== 'product' && (
                          <>
                            <CountControls name={item.name} count={group.length} min={1} onMinus={() => remove(last.id)} onPlus={() => duplicate(item)} />
                            <RemoveAll name={item.name} onClick={() => group.forEach((member) => remove(member.id))} />
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
                {doorFurniture && (
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
                {windowFurniture && (
                  <li>
                    <div className="relative flex items-center gap-2 rounded-lg border border-border-default px-2.5 py-2">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-subtle">
                        <img src={windowFurniture.image} alt="" className="h-full w-full object-contain" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{windowFurniture.name}</span>
                        <span className="block text-[11px] text-text-muted">벽에 낸 창문 · 최대 4개</span>
                      </span>
                      <CountControls name={windowFurniture.name} count={windowCount} min={0} max={BASE_ROOM.openings!.windows.length} onMinus={() => setWindowCount((n) => n - 1)} onPlus={() => setWindowCount((n) => n + 1)} />
                      {windowCount > 0 && <RemoveAll name={windowFurniture.name} onClick={() => setWindowCount(0)} />}
                    </div>
                  </li>
                )}
              </ul>
            </section>
          )}

          {tab === 'catalog' && (
            <section className="px-5 py-4">
              <p className="mb-3 text-[12px] text-text-secondary">등록된 상품 종류 {DEMO_FURNITURE.length}개예요. 누르면 놓여요.</p>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름·브랜드 검색"
                className="h-9 w-full rounded-full border border-border-default bg-surface-base px-4 text-[13px] outline-none focus:border-primary-container"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(['전체', '가구', '소품', '벽·천장'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] ${category === id ? 'border-primary-container bg-brand-sky-light font-semibold text-on-primary-container' : 'border-border-default text-text-secondary'}`}
                  >
                    {id}
                  </button>
                ))}
              </div>
              {category === '벽·천장' && <p className="mt-2 text-[11px] text-text-muted">벽에 걸거나 천장·창문·문에 붙는 것이에요. 걸리는 높이에 걸려요.</p>}

              {visibleCatalog.length === 0 ? (
                <p className="py-10 text-center text-[13px] text-text-muted">조건에 맞는 가구가 없어요</p>
              ) : (
                <ul className="mt-3 grid grid-cols-2 gap-2.5">
                  {visibleCatalog.map((furniture) => {
                    const bundledInto = BUNDLE_OF[furniture.id]
                    const placedCount = items.filter((item) => item.id.startsWith(`${bundledInto ?? furniture.id}#`)).length
                    const missing = needsSize(furniture)
                    return (
                      <li key={furniture.id}>
                        <button
                          type="button"
                          onClick={() => (missing ? openCustomFor(furniture) : addFromCatalog(furniture))}
                          className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border-default bg-surface-base text-left hover:border-primary-container"
                        >
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
            </section>
          )}

          {tab === 'custom' && (
            <section className="px-5 py-4">
              <p className="mb-3 text-[12px] leading-relaxed text-text-secondary">등록되어 있지 않은 가구는 줄자로 잰 치수를 넣어 주세요. 입력한 크기 그대로 3D 영역에 놓여요.</p>
              <div className="space-y-3">
                <div>
                  <span className="block text-[13px] text-text-secondary">가구 종류 (선택)</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {CUSTOM_KINDS.map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        aria-pressed={draft.name === kind}
                        onClick={() => setDraft({ ...draft, name: draft.name === kind ? '' : kind })}
                        className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] ${draft.name === kind ? 'border-primary-container bg-brand-sky-light font-semibold text-on-primary-container' : 'border-border-default text-text-secondary'}`}
                      >
                        {kind}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                  <NumberInput label="가로" value={draft.w} max={room.w} onChange={(w) => setDraft({ ...draft, w })} />
                  <NumberInput label="세로(깊이)" value={draft.d} max={room.d} onChange={(d) => setDraft({ ...draft, d })} />
                  <NumberInput label="높이" value={draft.h} max={room.h} onChange={(h) => setDraft({ ...draft, h })} />
                </div>
              </div>
              <button
                type="button"
                onClick={addCustom}
                disabled={!draftValid}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary-container py-3 text-[14px] font-bold text-white disabled:cursor-default disabled:opacity-40"
              >
                <Icon name="add" className="text-[18px]" /> 놓기
              </button>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
