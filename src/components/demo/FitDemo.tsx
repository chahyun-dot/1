import { useMemo, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import Scene, { type View } from '@/components/fit/Scene'
import { DEFAULT_ROOM, createFurniture, createProduct } from '@/data/catalog'
import { FURNITURE, categoryOf, hasSize, type Furniture, type FurnitureCategory } from '@/data/furniture'
import { backToWall, clampToRoom, cm, evaluate, findFreeSpot, measureFurniture } from '@/lib/fit'
import type { Check, Gap, Item, Level, Rot } from '@/lib/types'

// 데모: 현재 "내 공간에 맞는지 확인하기"와 별개로, 3D 영역에 가구를 더하고 크기·여유를 보는 개정판.
// 오른쪽 탭 = 배치된 가구 / 전체 가구 / 직접 입력.

const room = DEFAULT_ROOM
const PRODUCT_COLOR = '#f1f1ee'

type Tab = 'placed' | 'catalog' | 'custom'

const TABS: { id: Tab; label: string }[] = [
  { id: 'placed', label: '배치된 가구' },
  { id: 'catalog', label: '전체 가구' },
  { id: 'custom', label: '직접 입력' },
]

const CATEGORY_COLOR: Record<FurnitureCategory | '직접 입력', string> = {
  가구: '#9aa6b2',
  소품: '#d1b58a',
  '벽·천장': '#7fb0cf',
  '직접 입력': '#a89be0',
}

const LEVEL_STYLE: Record<Level, { icon: string; text: string; box: string; label: string }> = {
  ok: { icon: 'check_circle', text: 'text-status-success', box: 'bg-status-success-bg', label: '둘 수 있어요' },
  warn: { icon: 'error', text: 'text-status-warn', box: 'bg-status-warn-bg', label: '주의가 필요해요' },
  bad: { icon: 'cancel', text: 'text-status-bad', box: 'bg-status-bad-bg', label: '이대로는 어려워요' },
}

const DIR_NAME: Record<Gap['dir'], string> = { '-x': '문 쪽', '+x': '창 쪽', '-z': '뒷벽 쪽', '+z': '앞벽 쪽' }

const initialItems = (): Item[] => [createProduct(room, PRODUCT_COLOR), ...createFurniture(room)]

const sizeText = (item: Pick<Item, 'w' | 'd' | 'h'>) => `W${item.w} × D${item.d} × H${item.h}mm`
const won = (value: number) => `${value.toLocaleString()}원`

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

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((check, index) => (
        <li key={index} className="flex gap-2">
          <Icon name={LEVEL_STYLE[check.level].icon} filled className={`mt-0.5 text-[18px] ${LEVEL_STYLE[check.level].text}`} />
          <div>
            <p className="text-[13px] font-semibold text-text-primary">{check.title}</p>
            <p className="text-[12px] leading-relaxed text-text-secondary">{check.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function FitDemo() {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [selectedId, setSelectedId] = useState<string | null>('product')
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

  const addBox = (id: string, name: string, size: { w: number; d: number; h: number }, color: string, image?: string) => {
    const item: Item = { id, name, kind: 'furniture', model: 'box', rot: 0, x: room.w / 2, z: room.d / 2, color, image, ...size }
    const spot = findFreeSpot(item, room, items)
    const placed: Item = { ...item, ...(spot ?? clampToRoom(item, room.w / 2, room.d / 2, room)) }
    setItems((prev) => [...prev, placed])
    setSelectedId(placed.id)
    say(spot ? `${name}을(를) 3D 영역에 놓았어요` : '빈 자리가 없어 가운데에 겹쳐 놓았어요. 끌어서 옮겨 주세요.')
  }

  const addFromCatalog = (furniture: Furniture) => {
    const n = items.filter((item) => item.id.startsWith(`${furniture.id}#`)).length + 1
    addBox(`${furniture.id}#${n}`, furniture.name, { w: furniture.size.w, d: furniture.size.d, h: furniture.size.h }, CATEGORY_COLOR[categoryOf(furniture)], furniture.image)
  }

  const addCustom = () => {
    counter.current += 1
    const name = draft.name.trim() || `내 가구 ${counter.current}`
    addBox(`custom-${counter.current}`, name, { w: draft.w, d: draft.d, h: draft.h }, CATEGORY_COLOR['직접 입력'])
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
    return FURNITURE.filter((f) => (category === '전체' || categoryOf(f) === category) && (q === '' || `${f.name} ${f.brand ?? ''}`.toLowerCase().includes(q)))
  }, [query, category])

  const listed = items.filter((item) => item.kind !== 'rug')
  const draftValid = draft.w >= 50 && draft.w <= room.w && draft.d >= 50 && draft.d <= room.d && draft.h >= 50 && draft.h <= room.h

  return (
    <div className="flex h-screen flex-col bg-surface-base text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default px-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-brand-sky-border bg-brand-sky-light px-2.5 py-0.5 text-[12px] font-bold text-primary-container">DEMO</span>
          <h1 className="text-[17px] font-bold">내 공간에 가구 배치해 보기</h1>
          <span className="text-[12px] text-text-muted">넓은 침실 (6×6m) · 실측 치수 1:1</span>
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
              { icon: 'restart_alt', label: '초기화', onClick: () => { setItems(initialItems()); setSelectedId('product'); say('처음 배치로 되돌렸어요') }, disabled: false },
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

              <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  ['가로', cm(selected.w)],
                  ['세로(깊이)', cm(selected.d)],
                  ['높이', cm(selected.h)],
                  ['바닥 면적', `${((selected.w * selected.d) / 1_000_000).toFixed(2)}㎡`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-surface-alt px-1 py-2">
                    <dt className="text-[10px] text-text-muted">{label}</dt>
                    <dd className="text-[13px] font-bold">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className={`-mx-2 mt-3 flex gap-2 rounded-xl px-3 py-2.5 ${LEVEL_STYLE[fit.verdict].box}`}>
                <Icon name={LEVEL_STYLE[fit.verdict].icon} filled className={`text-[18px] ${LEVEL_STYLE[fit.verdict].text}`} />
                <span className={`text-[14px] font-bold ${LEVEL_STYLE[fit.verdict].text}`}>{LEVEL_STYLE[fit.verdict].label}</span>
              </div>

              <h3 className="mb-1.5 mt-4 text-[13px] font-bold">여유 사이즈</h3>
              <ul className="grid grid-cols-2 gap-2">
                {[...fit.gaps]
                  .sort((a, b) => ['앞', '뒤', '옆'].indexOf(a.side) - ['앞', '뒤', '옆'].indexOf(b.side))
                  .map((gap) => (
                    <li key={gap.dir} className={`rounded-lg border px-3 py-2 ${gap.level === 'warn' ? 'border-status-warn bg-status-warn-bg' : 'border-border-default'}`}>
                      <p className="text-[11px] text-text-muted">
                        {gap.side} · {DIR_NAME[gap.dir]}
                      </p>
                      <p className="text-[15px] font-bold">{gap.distance < 5 ? '붙어 있음' : cm(gap.distance)}</p>
                      <p className="truncate text-[11px] text-text-secondary">{gap.target}까지</p>
                    </li>
                  ))}
              </ul>

              <h3 className="mb-1.5 mt-4 text-[13px] font-bold">공간 적합도 진단</h3>
              <CheckList checks={fit.checks} />

              {selected.kind !== 'product' && (
                <button type="button" onClick={() => remove(selected.id)} className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-border-default py-2 text-[13px] font-medium text-status-bad hover:bg-status-bad-bg">
                  <Icon name="delete" className="text-[16px]" /> 3D 영역에서 빼기
                </button>
              )}
            </section>
          ) : (
            <section className="border-b border-border-subtle px-5 py-6 text-[13px] text-text-secondary">3D 영역의 가구를 누르거나, 아래 목록에서 골라 보세요. 크기와 여유 사이즈가 여기에 나와요.</section>
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
                {item.id === 'placed' && <span className="text-text-muted">{listed.length}</span>}
                {item.id === 'catalog' && <span className="text-text-muted">{FURNITURE.length}</span>}
              </button>
            ))}
          </div>

          {tab === 'placed' && (
            <section className="px-5 py-4">
              <p className="mb-3 text-[12px] text-text-secondary">지금 3D 영역에 놓인 가구예요. 누르면 크기와 여유를 볼 수 있어요.</p>
              <ul className="space-y-1.5">
                {listed.map((item) => (
                  <li key={item.id}>
                    <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${item.id === selectedId ? 'border-primary-container bg-brand-sky-light' : 'border-border-default'}`}>
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
                        <button type="button" aria-label={`${item.name} 빼기`} onClick={() => remove(item.id)} className="cursor-pointer rounded-full p-1.5 text-text-muted hover:bg-surface-subtle hover:text-status-bad">
                          <Icon name="close" className="text-[18px]" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'catalog' && (
            <section className="px-5 py-4">
              <p className="mb-3 text-[12px] text-text-secondary">등록된 가구 샘플 {FURNITURE.length}개예요. 누르면 3D 영역에 놓여요.</p>
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
              {category === '벽·천장' && <p className="mt-2 text-[11px] text-text-muted">벽에 걸거나 천장·창문·문에 붙는 것이라 데모에서는 바닥에 세워 크기만 확인해요.</p>}

              {visibleCatalog.length === 0 ? (
                <p className="py-10 text-center text-[13px] text-text-muted">조건에 맞는 가구가 없어요</p>
              ) : (
                <ul className="mt-3 grid grid-cols-2 gap-2.5">
                  {visibleCatalog.map((furniture) => {
                    const placedCount = items.filter((item) => item.id.startsWith(`${furniture.id}#`)).length
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
                            {placedCount > 0 && <span className="absolute right-1.5 top-1.5 rounded-full bg-primary-container px-1.5 py-0.5 text-[10px] font-bold text-white">{placedCount}개 배치됨</span>}
                          </span>
                          <span className="flex flex-1 flex-col gap-0.5 p-2">
                            <span className="line-clamp-2 text-[12px] font-bold leading-4">{furniture.name}</span>
                            <span className="text-[11px] text-text-muted">{missing ? '치수 정보 없음' : sizeText({ w: furniture.size.w, d: furniture.size.d, h: furniture.size.h })}</span>
                            <span className="text-[11px] text-text-secondary">{furniture.price > 0 ? won(furniture.price) : '가격 정보 없음'}</span>
                            <span className={`mt-1 text-[11px] font-semibold ${missing ? 'text-status-warn' : 'text-primary-container'}`}>{missing ? '치수 입력하기' : '3D에 놓기'}</span>
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
                <label className="block text-[13px] text-text-secondary">
                  가구 이름 (선택)
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    placeholder="예: 우리 집 수납장"
                    className="mt-1 h-10 w-full rounded-full border border-border-default bg-surface-base px-4 text-[15px] outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                  />
                </label>
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
                <Icon name="add" className="text-[18px]" /> 3D에 놓기
              </button>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
