import { useEffect, useState } from 'react'
import Osset from '@/components/page/Osset'
import { CATEGORY_NAV, GNB, HOT_KEYWORDS, ICONS } from '@/data/ohou'

const LINKS = ['로그인', '회원가입', '고객센터']

function HeaderRow() {
  return (
    <div className="mx-auto flex h-20 w-full max-w-[1256px] items-center justify-between px-[60px]">
      <div className="flex items-center">
        <a href="#" className="-ml-1 flex items-center p-1">
          <img src={ICONS.logo} alt="오늘의집 로고" className="h-[30px] w-[106px]" />
        </a>
        <nav className="ml-[41px] flex items-center gap-[19px]">
          {GNB.map((item) => (
            <a key={item.label} href="#" className="px-px py-[21px]">
              <span className={`inline rounded-[3px] p-1 text-[18px] font-bold leading-[18px] ${item.active ? 'text-oh-blue' : 'text-oh-dark'}`}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-end">
        <label className="flex h-[38px] w-[305px] items-center gap-[6px] rounded-full border border-transparent bg-oh-bg px-[10px]">
          <Osset name="search" size={16} color="#8c8c8c" />
          <input
            type="search"
            placeholder="쇼핑 검색"
            className="h-5 w-full bg-transparent text-[14px] text-oh-ink outline-none placeholder:text-oh-gray"
          />
        </label>
        <a href="#" aria-label="장바구니" className="ml-[14px] flex h-9 w-9 items-center justify-center p-[6px] text-oh-ink">
          <Osset name="cart" size={24} />
        </a>
        <div className="ml-[9px] flex items-center">
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
        <button
          type="button"
          className="ml-[10px] flex h-10 w-[83px] items-center justify-center gap-[1px] rounded-lg bg-oh-blue px-[13px] text-[14px] font-medium text-white"
        >
          글쓰기
          <Osset name="chevronDown" size={14} />
        </button>
      </div>
    </div>
  )
}

function HotKeyword() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % HOT_KEYWORDS.length), 3000)
    return () => window.clearInterval(id)
  }, [])
  const item = HOT_KEYWORDS[index]
  return (
    <div className="flex h-[30px] w-[192px] items-center justify-between">
      <a href="#" className="flex h-6 w-[156px] items-center gap-[6px] text-[14px]">
        <span className="w-4 text-center font-bold text-oh-ink">{item.rank}</span>
        {item.isNew && <span className="text-[9px] font-bold leading-none text-oh-red">NEW</span>}
        {item.up && <Osset name="triangleDown" size={14} className="rotate-180 text-oh-red" />}
        <span className="truncate text-oh-ink">{item.text}</span>
      </a>
      <button type="button" aria-label="급상승 검색어 펼치기" className="flex h-[30px] w-[30px] items-center justify-center p-[6px]">
        <Osset name="chevronDown" size={18} />
      </button>
    </div>
  )
}

function CategoryNav() {
  return (
    <div className="border-b border-oh-line2 bg-white">
      <div className="mx-auto flex h-[51px] w-full max-w-[1256px] items-center justify-between px-[60px]">
        <nav className="flex items-stretch gap-[10px] self-stretch">
          {CATEGORY_NAV.map((label) => (
            <a key={label} href="#" className="flex flex-col justify-center px-[2px] py-3">
              <div className="p-1">
                <p className="text-[16px] font-bold leading-5 text-oh-dark">{label}</p>
              </div>
            </a>
          ))}
        </nav>
        <HotKeyword />
      </div>
    </div>
  )
}

// 스크롤을 내리면 숨고, 올리면 화면 맨 위에 다시 나타나는 고정 헤더. 변경 시 탭 바 위치도 맞춰야 해서 높이를 밖으로 알려 준다.
export const FIXED_HEADER_HEIGHT = 133

export function useHeaderVisible() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 200) setVisible(false)
      else if (y < last - 4) setVisible(true)
      else if (y > last + 4) setVisible(false)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return visible
}

export default function SiteHeader({ fixedVisible }: { fixedVisible: boolean }) {
  return (
    <>
      <header className="bg-white">
        <div className="border-b border-oh-line2 bg-white">
          <HeaderRow />
        </div>
        <CategoryNav />
      </header>
      <div
        className="fixed inset-x-0 top-0 z-[1102] bg-white transition-transform duration-200"
        style={{ transform: fixedVisible ? 'translateY(0)' : 'translateY(-100%)' }}
        aria-hidden={!fixedVisible}
      >
        <div className="border-b border-oh-line2">
          <HeaderRow />
        </div>
        <CategoryNav />
      </div>
    </>
  )
}
