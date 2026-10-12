import { useEffect, useRef, useState } from 'react'
import Osset from '@/components/page/Osset'
import { CATEGORY_NAV, GNB, GNB_MENUS, HOT_KEYWORDS, ICONS, STORE_CATEGORIES, WRITE_MENU } from '@/data/ohou'
import type { GnbLabel } from '@/data/ohou'

const LINKS = ['로그인', '회원가입', '고객센터']

// 본문이 1199px 아래로 줄지 않아서 헤더도 그 폭을 지키고, 글자는 줄바꿈하지 않는다.
// 두 번째 줄에 올릴 GNB 메뉴와 마우스를 올린 항목을 두 줄이 함께 알아야 해서 헤더 한 벌마다 하나씩 둔다.
function useHeaderState() {
  const [gnb, setGnb] = useState<GnbLabel>('쇼핑')
  return { gnb, setGnb, reset: () => setGnb('쇼핑') }
}
type HeaderState = ReturnType<typeof useHeaderState>

function WriteMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className="relative ml-[10px]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-[83px] items-center justify-center gap-[1px] rounded-lg bg-oh-blue px-[13px] text-[14px] font-medium text-white"
      >
        글쓰기
        <Osset name="chevronDown" size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-[50px] z-10 w-[345px] rounded-[6px] border border-oh-line2 bg-white p-2 shadow-[0_4px_10px_rgba(63,71,77,0.2)]">
          {WRITE_MENU.map((item) => (
            <a key={item.title} href="#" className="flex items-center gap-3 rounded-[4px] p-[15px] hover:bg-oh-bg">
              <img src={item.icon} alt="" width={30} height={30} className="shrink-0" />
              <div>
                <div className="text-[16px] font-bold leading-6 text-oh-ink">{item.title}</div>
                <div className="text-[14px] leading-5 text-oh-gray">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function HeaderRow({ state }: { state: HeaderState }) {
  return (
    <div className="mx-auto flex h-20 w-full max-w-[1256px] items-center justify-between whitespace-nowrap px-[60px]">
      <div className="flex shrink-0 items-center">
        <a href="#" className="-ml-1 flex items-center p-1">
          <img src={ICONS.logo} alt="오늘의집 로고" className="h-[30px] w-[106px]" />
        </a>
        <nav className="ml-[41px] flex items-center gap-[19px]">
          {GNB.map((label) => (
            <a key={label} href="#" onMouseEnter={() => state.setGnb(label)} className="px-px py-[21px]">
              <span className={`inline rounded-[3px] p-1 text-[18px] font-bold leading-[18px] ${state.gnb === label ? 'text-oh-blue' : 'text-oh-dark'}`}>
                {label}
              </span>
            </a>
          ))}
        </nav>
      </div>

      <div className="flex min-w-0 items-center justify-end">
        <label className="flex h-[38px] w-[305px] min-w-[120px] shrink items-center gap-[6px] rounded-full border border-transparent bg-oh-bg px-[10px]">
          <Osset name="search" size={16} color="#8c8c8c" />
          <input
            type="search"
            placeholder="쇼핑 검색"
            className="h-5 w-full bg-transparent text-[14px] text-oh-ink outline-none placeholder:text-oh-gray"
          />
        </label>
        <a href="#" aria-label="장바구니" className="ml-[14px] flex h-9 w-9 shrink-0 items-center justify-center p-[6px] text-oh-ink">
          <Osset name="cart" size={24} />
        </a>
        <div className="ml-[9px] flex shrink-0 items-center">
          {LINKS.map((label, index) => (
            <a
              key={label}
              href="#"
              className={`px-[10px] text-[14px] leading-[18px] text-oh-dark ${index > 0 ? 'border-l border-oh-dark' : ''}`}
            >
              {label}
            </a>
          ))}
        </div>
        <WriteMenu />
      </div>
    </div>
  )
}

function KeywordTag({ item }: { item: (typeof HOT_KEYWORDS)[number] }) {
  return (
    <>
      {item.isNew && <span className="text-[9px] font-bold leading-none text-oh-red">NEW</span>}
      {item.up && <Osset name="triangleDown" size={14} className="rotate-180 text-oh-red" />}
    </>
  )
}

function HotKeyword() {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % HOT_KEYWORDS.length), 3000)
    return () => window.clearInterval(id)
  }, [])
  const item = HOT_KEYWORDS[index]
  return (
    <div className="relative shrink-0" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="flex h-[30px] w-[192px] items-center justify-between">
        <a href="#" className="flex h-6 w-[156px] items-center gap-[6px] text-[14px]">
          <span className="w-4 text-center font-bold text-oh-ink">{item.rank}</span>
          <KeywordTag item={item} />
          <span className="truncate text-oh-ink">{item.text}</span>
        </a>
        <button type="button" aria-label="급상승 검색어 펼치기" className="flex h-[30px] w-[30px] items-center justify-center p-[6px]">
          <Osset name="chevronDown" size={18} />
        </button>
      </div>
      {open && (
        <div className="absolute right-0 top-[-10px] z-10 w-[268px] rounded-lg border border-oh-line2 bg-white px-4 pb-3 pt-[10px] shadow-[0_4px_10px_rgba(63,71,77,0.2)]">
          <div className="flex h-[30px] items-center justify-between">
            <span className="text-[14px] font-bold text-oh-ink">인기 검색어</span>
            <Osset name="arrowUp" size={18} />
          </div>
          <ol className="mt-1">
            {HOT_KEYWORDS.map((k) => (
              <li key={k.rank}>
                <a href="#" className="flex h-[30px] items-center gap-[6px] text-[14px] text-oh-ink">
                  <span className="w-4 text-center font-bold">{k.rank}</span>
                  <KeywordTag item={k} />
                  <span className="truncate">{k.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function CategoryPanel() {
  return (
    <div className="absolute inset-x-0 top-full z-10 border-b border-oh-line2 bg-white">
      <div className="mx-auto flex h-[160px] w-full max-w-[1256px] overflow-x-auto px-[58px] pt-3">
        {STORE_CATEGORIES.map((c) => (
          <a key={c.label} href={c.href} className="flex w-[100px] shrink-0 flex-col items-center gap-2 text-[14px] text-oh-dark hover:text-oh-blue">
            <img src={c.image} alt="" loading="lazy" className="h-[68px] w-[68px] rounded-full object-cover" />
            {c.label}
          </a>
        ))}
      </div>
    </div>
  )
}

function CategoryNav({ state }: { state: HeaderState }) {
  const [panel, setPanel] = useState(false)
  const items = state.gnb === '쇼핑' ? CATEGORY_NAV.map((label) => ({ label, href: '#' })) : GNB_MENUS[state.gnb]
  return (
    <div className="relative border-b border-oh-line2 bg-white" onMouseLeave={() => setPanel(false)}>
      <div className="mx-auto flex h-[51px] w-full max-w-[1256px] items-center justify-between whitespace-nowrap px-[60px]">
        <nav className="flex min-w-0 items-stretch gap-[10px] self-stretch">
          {items.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onMouseEnter={() => setPanel(state.gnb === '쇼핑' && label === '카테고리')}
              className="flex flex-col justify-center px-[2px] py-3"
            >
              <div className="p-1">
                <p className={`text-[16px] font-bold leading-5 ${panel && label === '카테고리' ? 'text-oh-blue' : 'text-oh-dark'}`}>{label}</p>
              </div>
            </a>
          ))}
        </nav>
        <HotKeyword />
      </div>
      {panel && <CategoryPanel />}
    </div>
  )
}

// 원본처럼 스크롤을 100px 넘게 내리면 상단 줄만 고정되고, 위로 올리면 카테고리 줄이 그 아래로 내려온다.
export type HeaderMode = 'static' | 'top' | 'full'

export function useHeaderMode() {
  const [mode, setMode] = useState<HeaderMode>('static')
  const pinnedUntil = useRef(0)
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Date.now() < pinnedUntil.current) {
        last = y
        return
      }
      if (y < 100) setMode('static')
      else if (y < last - 4) setMode('full')
      else if (y > last + 4) setMode('top')
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // 탭으로 위쪽 영역에 이동할 때 "올리는 중"으로 읽혀 카테고리 줄이 나와 제목을 가리지 않도록, 잠깐 상단 줄만 고정한 채로 둔다.
  const pin = () => {
    pinnedUntil.current = Date.now() + 800
    setMode('top')
  }
  return { mode, pin }
}

export default function SiteHeader({ mode }: { mode: HeaderMode }) {
  const staticState = useHeaderState()
  const fixedState = useHeaderState()
  return (
    <>
      <header className="min-w-[1199px] bg-white" onMouseLeave={staticState.reset}>
        <div className="border-b border-oh-line2 bg-white">
          <HeaderRow state={staticState} />
        </div>
        <CategoryNav state={staticState} />
      </header>
      <div
        className="fixed inset-x-0 top-0 z-[1102] min-w-[1199px] transition-transform duration-200"
        style={{ transform: mode === 'static' ? 'translateY(-100%)' : 'translateY(0)' }}
        aria-hidden={mode === 'static'}
        onMouseLeave={fixedState.reset}
      >
        <div className="relative z-10 border-b border-oh-line2 bg-white">
          <HeaderRow state={fixedState} />
        </div>
        <div className="transition-transform duration-200" style={{ transform: mode === 'full' ? 'translateY(0)' : 'translateY(-100%)' }}>
          <CategoryNav state={fixedState} />
        </div>
      </div>
    </>
  )
}
