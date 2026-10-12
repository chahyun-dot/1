import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Icon from '@/components/Icon'
import DetailScene from '@/components/fit/DetailScene'
import Scene, { type View } from '@/components/fit/Scene'
import { DESK_TOP, FOOT_W, legInner, maxLegGap, placeBesideDesk, placeUnderDesk, underOffsets, undersideOf, type UnderOffsets } from '@/lib/desk'
import { COLORS, DEFAULT_ROOM, PRODUCT, ROOM_PRESETS, WHEEL_DEFAULT, WHEEL_MAX, WHEEL_MIN, colorOf, createFurniture, createProduct, type ColorId } from '@/data/catalog'
import { DRAWER_PULL, backToWall, clampToRoom, cm, evaluate } from '@/lib/fit'
import type { FitResult, Item, Level, Room, Rot } from '@/lib/types'

export type FitSummary = {
  verdict: Level
  title: string
  space: string
}

type FitModalProps = {
  colorId: ColorId
  onColor: (id: ColorId) => void
  onClose: () => void
  onDone?: (summary: FitSummary) => void
}

const VERDICT: Record<Level, { label: string; icon: string; box: string; text: string }> = {
  ok: { label: '입력한 치수 기준으로 배치 가능해요', icon: 'check_circle', box: 'bg-status-success-bg', text: 'text-status-success' },
  warn: { label: '둘 수 있지만 확인이 필요해요', icon: 'error', box: 'bg-status-warn-bg', text: 'text-amber-600' },
  bad: { label: '현재 배치에서는 사용 공간이 부족해요', icon: 'cancel', box: 'bg-status-bad-bg', text: 'text-status-bad' },
}

const CHECK_ICON: Record<Level, string> = {
  ok: 'text-status-success',
  warn: 'text-amber-500',
  bad: 'text-status-bad',
}

const ROOM_FIELDS: { key: keyof Room; label: string }[] = [
  { key: 'w', label: '가로 (문 ↔ 창)' },
  { key: 'd', label: '세로 (책상 벽 ↔ 맞은편)' },
  { key: 'h', label: '천장 높이' },
  { key: 'doorWidth', label: '방문 폭' },
]

const FURNITURE_LABELS: Record<string, string> = { desk: '책상', chair: '의자', bed: '침대', shelf: '책장', sofa: '소파', plant: '화분' }

function Step({ title, children }: { step?: number; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border-subtle px-5 py-5">
      <h3 className="sr-only">{title}</h3>
      {children}
    </section>
  )
}

function StageButton({ icon, label, onClick, active = false, disabled = false }: {
  icon: string
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 px-2 py-1 text-[12px] transition-colors disabled:opacity-40 ${
        active ? 'font-bold text-primary-container' : 'font-medium text-text-secondary hover:text-primary-container'
      }`}
    >
      <Icon name={icon} className="text-[15px]" /> {label}
    </button>
  )
}

function NumberField({ label, value, min, max, onCommit }: {
  label: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const parsed = draft === null ? value : Number(draft)
  const invalid = draft !== null && !(parsed >= min && parsed <= max)
  return (
    <label className="text-[12px] text-text-secondary">
      {label}
      <div className="relative mt-1">
        <input
          type="number"
          step={10}
          min={min}
          max={max}
          value={draft ?? value}
          onChange={(event) => {
            const next = Number(event.target.value)
            setDraft(event.target.value)
            if (next >= min && next <= max) onCommit(Math.round(next))
          }}
          onBlur={() => setDraft(null)}
          className={`h-9 w-full rounded-lg border bg-surface-base pl-2.5 pr-9 text-[14px] text-text-primary outline-none focus:ring-2 ${
            invalid ? 'border-status-bad focus:ring-status-bad/20' : 'border-border-default focus:border-primary-container focus:ring-primary-container/20'
          }`}
        />
        <span className="pointer-events-none absolute right-2.5 top-2 text-[12px] text-text-muted">mm</span>
      </div>
      {invalid && <span className="mt-0.5 block text-[11px] text-status-bad">{min.toLocaleString()}~{max.toLocaleString()}mm</span>}
    </label>
  )
}

const initialItems = (room: Room, color: string) => [createProduct(room, color), ...createFurniture(room)]

export default function FitModal({ colorId, onColor, onClose, onDone }: FitModalProps) {
  const [presetId, setPresetId] = useState<string | null>(ROOM_PRESETS[0].id)
  const [room, setRoom] = useState<Room>(DEFAULT_ROOM)
  const [items, setItems] = useState<Item[]>(() => initialItems(DEFAULT_ROOM, colorOf(colorId).hex))
  const [hidden, setHidden] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>('product')
  const [view, setView] = useState<View>('persp')
  const [drawersOpen, setDrawersOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [gapsOpen, setGapsOpen] = useState(false)
  const [tab, setTab] = useState<'space' | 'furniture' | 'cabinet' | 'color'>('space')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [showDims, setShowDims] = useState(true)

  const visible = useMemo(() => items.filter((item) => !hidden.includes(item.id)), [items, hidden])
  const product = visible.find((item) => item.kind === 'product') ?? null
  const selected = visible.find((item) => item.id === selectedId) ?? null
  const desk = visible.find((item) => item.model === 'desk') ?? null
  const detailDesk = detailId ? (visible.find((item) => item.id === detailId) ?? null) : null
  const inDetail = Boolean(detailDesk && product)
  const activeTab = inDetail ? (tab === 'furniture' ? 'space' : tab) : tab === 'cabinet' ? 'space' : tab
  const fit: FitResult | null = useMemo(() => (product ? evaluate(product, room, visible) : null), [product, room, visible])
  const frontGap = fit?.gaps.find((gap) => gap.side === '앞')
  const spaceLabel = ROOM_PRESETS.find((p) => p.id === presetId)?.label ?? '직접 입력한 공간'
  const verdict = fit ? VERDICT[fit.verdict] : null

  useEffect(() => {
    setItems((prev) => prev.map((item) => (item.kind === 'product' ? { ...item, color: colorOf(colorId).hex } : item)))
  }, [colorId])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const updateItem = (id: string, patch: (item: Item) => Item) =>
    setItems((prev) => prev.map((item) => (item.id === id ? patch(item) : item)))

  const rotateSelected = () => {
    if (!selected) return
    updateItem(selected.id, (item) => {
      const turned = { ...item, rot: ((item.rot + 1) % 4) as Rot }
      return { ...turned, ...clampToRoom(turned, item.x, item.z, room) }
    })
  }

  const reset = (nextRoom: Room = room) => {
    setItems(initialItems(nextRoom, colorOf(colorId).hex))
    setSelectedId('product')
    setDrawersOpen(false)
  }

  // 바퀴 유무·높이에 따라 제품 높이가 바뀐다. 위치는 그대로 둔다.
  const setCaster = (caster: number) =>
    updateItem('product', (item) => ({ ...item, caster, h: PRODUCT.bodyH + caster }))

  const moveProduct = (x: number, z: number) =>
    updateItem('product', (item) => ({ ...item, ...clampToRoom(item, x, z, room) }))

  const placeProduct = (place: (desk: Item, item: Item) => { x: number; z: number; rot: Rot }) => {
    if (!detailDesk) return
    updateItem('product', (item) => {
      const next = { ...item, ...place(detailDesk, item) }
      return { ...next, ...clampToRoom(next, next.x, next.z, room) }
    })
  }

  const offsets = detailDesk && product ? underOffsets(detailDesk, product) : null

  const setOffsets = (patch: Partial<UnderOffsets>) => {
    const next = { side: 'right', leg: 30, back: 30, ...offsets, ...patch } as UnderOffsets
    placeProduct((d, item) => placeUnderDesk(d, item, next.side, next.leg, next.back))
  }

  // 책상 치수를 바꿔도 서랍장은 다리·뒤 간격을 그대로 유지한 채 따라간다.
  const updateDesk = (patch: Partial<Item>) => {
    if (!detailDesk) return
    const keep = product ? underOffsets(detailDesk, product) : null
    const raw = { ...detailDesk, ...patch }
    const nextDesk = { ...raw, ...clampToRoom(raw, raw.x, raw.z, room) }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === nextDesk.id) return nextDesk
        if (keep && item.kind === 'product') {
          const next = { ...item, ...placeUnderDesk(nextDesk, item, keep.side, keep.leg, keep.back) }
          return { ...next, ...clampToRoom(next, next.x, next.z, room) }
        }
        return item
      }),
    )
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (detailId) setDetailId(null)
        else close()
        return
      }
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'r' || event.key === 'R') rotateSelected()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // 확인 버튼이 없으므로 팝업을 닫을 때 지금 판정을 상품 페이지에 넘긴다.
  const close = () => {
    if (fit && verdict) onDone?.({ verdict: fit.verdict, title: fit.checks[0]?.title ?? verdict.label, space: spaceLabel })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] lg:p-8"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="fit-title" className="flex h-[min(880px,94vh)] w-full max-w-[1320px] flex-col overflow-hidden rounded-2xl bg-surface-base shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-brand-sky-border bg-brand-sky-light px-2.5 py-0.5 text-[12px] font-bold text-primary-container">
                NEW 내 공간 맞춤 시뮬레이션
              </span>
              <span className="text-[12px] text-text-muted">오늘의집 3D 공간엔진</span>
            </div>
            <div className="flex items-center gap-1.5">
              <h2 id="fit-title" className="text-[22px] font-bold tracking-tight text-text-primary">내 공간에 맞는지 확인하기</h2>
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="사용 방법 안내"
                  className="rounded-full p-0.5 text-primary-container outline-none hover:bg-brand-sky-light focus-visible:bg-brand-sky-light"
                >
                  <Icon name="info" className="text-[20px]" />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 w-[300px] rounded-lg bg-inverse-surface/95 px-3 py-2 text-[12px] font-normal leading-relaxed text-inverse-on-surface opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                >
                  가구 드래그로 옮기기 · 빈 곳 드래그로 시점 돌리기 · 휠로 확대 · 모바일 앱에서는 카메라 AR로 실제 크기를 볼 수 있어요.
                </span>
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-text-secondary">
              <span>{PRODUCT.shortName}를 우리 집 치수에 놓고 돌려 보세요.</span>
              <span className="font-semibold text-text-primary">① 책상 치수 입력 → ② 서랍장 위치 조정 → ③ 설치 조건 확인</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={close} aria-label="닫기" className="rounded-full p-2 text-text-secondary hover:bg-surface-subtle">
              <Icon name="close" className="text-[22px]" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-base px-5 py-3">
              {inDetail ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailId(null)}
                    className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[13px] font-semibold text-text-secondary hover:bg-surface-subtle"
                  >
                    <Icon name="arrow_back" className="text-[17px]" /> 방 전체
                  </button>
                  <span className="text-[14px] font-bold text-text-primary">책상 &amp; 서랍장 자세히 보기</span>
                  <span className="rounded-full bg-brand-sky-light px-2 py-0.5 text-[11px] font-semibold text-primary-container">360° 회전</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-status-success" />
                  <span className="text-[14px] font-bold text-text-primary">{spaceLabel} (가상 시뮬레이션 중)</span>
                  <span className="rounded-full bg-brand-sky-light px-2 py-0.5 text-[11px] font-semibold text-primary-container">실측 치수 1:1</span>
                </div>
              )}
            </div>

            <div className="relative min-h-0 flex-1 bg-surface-subtle">
              {inDetail && detailDesk && product ? (
                <DetailScene
                  desk={detailDesk}
                  product={product}
                  drawersOpen={drawersOpen}
                  showDims={showDims}
                  autoRotate={autoRotate}
                  onMove={moveProduct}
                />
              ) : (
                <Scene
                  room={room}
                  items={visible}
                  selectedId={selectedId}
                  focus={product}
                  fit={fit}
                  view={view}
                  drawersOpen={drawersOpen}
                  onSelect={setSelectedId}
                  onMove={(id, x, z) => updateItem(id, (item) => ({ ...item, ...clampToRoom(item, x, z, room) }))}
                  onOpenDetail={setDetailId}
                />
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

              <div className="pointer-events-none absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-inverse-surface/90 px-3 py-1 text-[12px] font-medium text-inverse-on-surface shadow-md">
                <span>
                  실측 규격 W{PRODUCT.size.w} × D{PRODUCT.size.d} × H{product?.h ?? PRODUCT.size.h}mm
                </span>
                {frontGap && <span className="font-bold text-primary-container">| 서랍 앞 여유 {frontGap.distance.toLocaleString()}mm</span>}
              </div>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-border-default bg-surface-base/95 px-3 py-1.5 shadow-md backdrop-blur-md">
                {inDetail ? (
                  <>
                    <StageButton icon="360" label="360° 자동 회전" active={autoRotate} onClick={() => setAutoRotate(!autoRotate)} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="straighten" label="간격 표시" active={showDims} onClick={() => setShowDims(!showDims)} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="open_in_full" label={drawersOpen ? '서랍 닫기' : '서랍 열어보기'} active={drawersOpen} onClick={() => setDrawersOpen(!drawersOpen)} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="align_horizontal_left" label="아래 왼쪽" onClick={() => placeProduct((d, item) => placeUnderDesk(d, item, 'left'))} />
                    <StageButton icon="align_horizontal_right" label="아래 오른쪽" onClick={() => placeProduct((d, item) => placeUnderDesk(d, item, 'right'))} />
                    <StageButton icon="east" label="책상 옆" onClick={() => placeProduct(placeBesideDesk)} />
                  </>
                ) : (
                  <>
                    <StageButton icon="rotate_90_degrees_cw" label="90° 회전 (R)" onClick={rotateSelected} disabled={!selected} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="vertical_align_top" label="벽에 붙이기" onClick={() => selected && updateItem(selected.id, (item) => backToWall(item, room))} disabled={!selected} />
                    <span className="text-border-default">|</span>
                    <StageButton icon="open_in_full" label={drawersOpen ? '서랍 닫기' : '서랍 열어보기'} active={drawersOpen} onClick={() => setDrawersOpen(!drawersOpen)} />
                    <span className="text-border-default">|</span>
                    <StageButton
                      icon={view === 'persp' ? 'grid_view' : 'view_in_ar'}
                      label={view === 'persp' ? '위에서 보기' : '3D로 보기'}
                      active={view === 'top'}
                      onClick={() => setView(view === 'persp' ? 'top' : 'persp')}
                    />
                    <span className="text-border-default">|</span>
                    <StageButton icon="refresh" label="초기화" onClick={() => reset()} />
                  </>
                )}
              </div>

              {inDetail && (
                <p className="pointer-events-none absolute right-16 top-4 rounded-lg bg-inverse-surface/75 px-3 py-1.5 text-[12px] text-white">
                  드래그: 360° 돌려 보기 · 서랍장 끌기: 위치 옮기기 · 휠: 확대
                </p>
              )}
            </div>
          </div>

          {!expanded && (
          <aside className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-l border-border-default">
            <div role="tablist" aria-label="설정" className="sticky top-0 z-10 flex border-b border-border-default bg-surface-base">
              {(
                [
                  { id: 'space', label: inDetail ? '내 책상 치수' : '내 공간 치수' },
                  ...(inDetail ? [{ id: 'cabinet', label: '서랍장 위치·바퀴' }] : [{ id: 'furniture', label: '함께 둔 가구' }]),
                  { id: 'color', label: '색상' },
                ] as { id: 'space' | 'furniture' | 'cabinet' | 'color'; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-[13px] transition-colors ${
                    activeTab === item.id
                      ? 'border-primary-container font-bold text-on-primary-container'
                      : 'border-transparent font-medium text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {activeTab === 'space' && (inDetail && detailDesk && product ? (
              <Step step={1} title="내 책상 치수">
                <p className="mb-3 text-[12px] leading-relaxed text-text-secondary">
                  줄자로 잰 우리 집 책상 치수를 넣으면 3D와 간격이 바로 바뀌어요.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="책상 가로"
                    value={detailDesk.w}
                    min={600}
                    max={room.w}
                    onCommit={(w) => {
                      const gap = legInner(detailDesk) * 2 + (w - detailDesk.w)
                      updateDesk({ w, legGap: Math.max(300, Math.min(gap, maxLegGap(w))) })
                    }}
                  />
                  <NumberField label="책상 깊이" value={detailDesk.d} min={400} max={1200} onCommit={(d) => updateDesk({ d })} />
                  <NumberField
                    label="책상 높이"
                    value={detailDesk.h}
                    min={500}
                    max={1200}
                    onCommit={(h) => updateDesk({ h, underClearance: Math.min(undersideOf(detailDesk) + h - detailDesk.h, h - DESK_TOP) })}
                  />
                  <NumberField
                    label="상판 아래 높이"
                    value={undersideOf(detailDesk)}
                    min={300}
                    max={detailDesk.h - DESK_TOP}
                    onCommit={(underClearance) => updateDesk({ underClearance })}
                  />
                  <NumberField
                    label="다리 안쪽 폭"
                    value={legInner(detailDesk) * 2}
                    min={300}
                    max={maxLegGap(detailDesk.w)}
                    onCommit={(legGap) => updateDesk({ legGap })}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                  상판 아래 높이는 바닥에서 상판(또는 서랍·프레임) 아랫면까지예요. 다리 안쪽 폭은 양쪽 다리 받침({FOOT_W}mm) 안쪽 사이 거리예요.
                </p>
              </Step>
            ) : (
            <Step step={1} title="내 공간 치수">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {ROOM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPresetId(preset.id)
                      setRoom(preset.room)
                      reset(preset.room)
                    }}
                    className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                      preset.id === presetId
                        ? 'bg-primary-container text-surface-base'
                        : 'bg-surface-subtle text-text-secondary hover:bg-brand-sky-light hover:text-on-primary-container'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_FIELDS.map((field) => (
                  <label key={field.key} className="text-[12px] text-text-secondary">
                    {field.label}
                    <div className="relative mt-1">
                      <input
                        type="number"
                        step={10}
                        min={500}
                        value={room[field.key]}
                        onChange={(event) => {
                          const value = Number(event.target.value)
                          if (value > 0) {
                            setPresetId(null)
                            setRoom({ ...room, [field.key]: value })
                          }
                        }}
                        className="h-9 w-full rounded-lg border border-border-default bg-surface-base pl-2.5 pr-9 text-[14px] text-text-primary outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-2 text-[12px] text-text-muted">mm</span>
                    </div>
                  </label>
                ))}
              </div>
              {desk && (
                <button
                  type="button"
                  onClick={() => setDetailId(desk.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-surface-subtle py-2 text-[12px] font-semibold text-text-secondary hover:bg-brand-sky-light hover:text-on-primary-container"
                >
                  <Icon name="straighten" className="text-[15px]" /> 책상·서랍장 치수 자세히 입력하기
                </button>
              )}
            </Step>
            ))}

            {activeTab === 'cabinet' && inDetail && detailDesk && product && (
              <Step step={2} title="서랍장 위치·바퀴">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-text-primary">서랍장 위치</h4>
                  {offsets && (
                    <div className="flex rounded-lg bg-surface-subtle p-0.5">
                      {(['left', 'right'] as const).map((side) => (
                        <button
                          key={side}
                          type="button"
                          onClick={() => setOffsets({ side })}
                          className={`rounded-md px-2.5 py-1 text-[12px] ${
                            offsets.side === side ? 'bg-surface-base font-semibold text-on-primary-container shadow-xs' : 'text-text-secondary'
                          }`}
                        >
                          {side === 'left' ? '왼쪽 다리 쪽' : '오른쪽 다리 쪽'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {offsets ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <NumberField
                      label={`${offsets.side === 'left' ? '왼쪽' : '오른쪽'} 다리와 간격`}
                      value={offsets.leg}
                      min={0}
                      max={Math.max(0, Math.round(legInner(detailDesk) * 2 - product.w))}
                      onCommit={(leg) => setOffsets({ leg })}
                    />
                    <NumberField
                      label="뒤(벽 쪽) 간격"
                      value={offsets.back}
                      min={0}
                      max={Math.max(0, detailDesk.d - product.d)}
                      onCommit={(back) => setOffsets({ back })}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOffsets({})}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-primary-container bg-brand-sky-light py-2 text-[13px] font-semibold text-on-primary-container"
                  >
                    <Icon name="south" className="text-[16px]" /> 책상 아래로 넣기
                  </button>
                )}
                <div className="mt-4 border-t border-border-subtle pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[13px] font-bold text-text-primary">바퀴</h4>
                      <p className="text-[11px] text-text-muted">
                        {(product.caster ?? 0) > 0 ? `바퀴 ${product.caster}mm 포함 · 높이 ${product.h}mm` : `바퀴 없음 · 높이 ${product.h}mm`}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={(product.caster ?? 0) > 0}
                      aria-label="바퀴 유무"
                      onClick={() => setCaster((product.caster ?? 0) > 0 ? 0 : WHEEL_DEFAULT)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${(product.caster ?? 0) > 0 ? 'bg-primary-container' : 'bg-border-default'}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-base shadow transition-all ${(product.caster ?? 0) > 0 ? 'left-[22px]' : 'left-0.5'}`}
                      />
                    </button>
                  </div>
                  {(product.caster ?? 0) > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <NumberField label="바퀴 높이" value={product.caster ?? WHEEL_DEFAULT} min={WHEEL_MIN} max={WHEEL_MAX} onCommit={setCaster} />
                    </div>
                  )}
                </div>
              </Step>
            )}

            {activeTab === 'furniture' && !inDetail && (
            <section className="border-b border-border-subtle px-5 py-5">
              <div className="flex flex-wrap gap-2">
                {Object.entries(FURNITURE_LABELS).filter(([id]) => items.some((item) => item.id === id)).map(([id, label]) => {
                  const on = !hidden.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setHidden((prev) => (on ? [...prev, id] : prev.filter((h) => h !== id)))}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] transition-colors ${
                        on ? 'border-primary-container bg-brand-sky-light font-semibold text-on-primary-container' : 'border-border-default text-text-muted'
                      }`}
                    >
                      <Icon name={on ? 'check' : 'add'} className="text-[14px]" />
                      {label}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-[11px] text-text-muted">가구도 끌어서 우리 집과 같은 자리로 옮길 수 있어요.</p>
            </section>
            )}

            {activeTab === 'color' && (
            <section className="border-b border-border-subtle px-5 py-5">
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onColor(color.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                      color.id === colorId ? 'border-primary-container bg-brand-sky-light font-semibold text-on-primary-container' : 'border-border-default text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: color.hex }} />
                    {color.label.replace(/\s*[\d.]+$/, '')}
                  </button>
                ))}
              </div>
            </section>
            )}

            <section className="px-5 py-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-text-primary">공간 적합도 진단</h3>
                <span className="text-[11px] text-text-muted">실측 규격 기준</span>
              </div>
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
                    <button
                      type="button"
                      onClick={() => setGapsOpen(!gapsOpen)}
                      aria-expanded={gapsOpen}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] font-semibold text-text-primary"
                    >
                      <span>주변 간격 (앞 · 뒤 · 옆)</span>
                      <span className="flex items-center gap-1.5">
                        {!gapsOpen && frontGap && (
                          <span className={`text-[12px] font-semibold ${CHECK_ICON[frontGap.level]}`}>앞 {cm(frontGap.distance)}</span>
                        )}
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
                          <span className={`font-semibold ${gap.side === '앞' ? CHECK_ICON[gap.level] : 'text-text-primary'}`}>
                            {gap.distance < 5 ? '붙어 있음' : cm(gap.distance)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    )}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
                    서랍 완전 개폐에 앞쪽 {cm(DRAWER_PULL)}가 필요해요. 바닥의 파란 영역이 서랍이 열리는 자리예요.
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-text-muted">제품이 공간에 없어요. 초기화를 눌러 주세요.</p>
              )}
            </section>
          </aside>
          )}
        </div>

      </div>
    </div>
  )
}
