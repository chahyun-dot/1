import { useEffect, useState } from 'react'
import { PRODUCT } from '@/data/catalog'

export const SECTIONS = [
  { id: 'goods-detail-section-information', label: '상품정보' },
  { id: 'goods-detail-section-reviews', label: '리뷰', count: PRODUCT.reviews.toLocaleString() },
  { id: 'goods-detail-section-question', label: '문의', count: '1,115' },
  { id: 'goods-detail-section-delivery', label: '배송/환불' },
  { id: 'goods-detail-section-suggestion', label: '추천' },
]

export const TAB_HEIGHT = 54
// 상단 줄만 고정됐을 때 탭 바가 붙는 위치와, 카테고리 줄까지 나타났을 때의 위치.
export const TAB_TOP_HIDDEN = 80
export const TAB_TOP_WITH_HEADER = 132

export function useActiveSection(ratio: number) {
  const [active, setActive] = useState(SECTIONS[0].id)
  useEffect(() => {
    const onScroll = () => {
      let current = SECTIONS[0].id
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * ratio) current = section.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ratio])
  return active
}

export default function StickyTabs({ top, active, onGo }: { top: number; active: string; onGo: () => void }) {
  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    onGo()
    const target = () => el.getBoundingClientRect().top + window.scrollY - TAB_TOP_HIDDEN - TAB_HEIGHT - 20
    window.scrollTo({ top: target() })
    // 이동 중에 위쪽 이미지가 불러와져 높이가 바뀌면 영역이 밀리므로 한 번 더 맞춘다.
    window.setTimeout(() => window.scrollTo({ top: target() }), 400)
  }

  return (
    <div className="sticky z-[1000] mt-10 border-y border-oh-line bg-oh-bg" style={{ top, height: TAB_HEIGHT }}>
      <div className="mx-auto h-full w-full max-w-[1256px] px-[60px]">
        <nav className="flex h-full gap-[10px] pl-[5px]">
          {SECTIONS.map((section) => {
            const on = section.id === active
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => go(section.id)}
                className={`flex h-full w-[140px] items-center justify-center border-b-2 text-[15px] font-bold leading-6 ${
                  on ? 'border-oh-blue text-oh-blue' : 'border-transparent text-oh-dark'
                }`}
              >
                {section.label}
                {section.count && <span className="ml-1 text-oh-gray">{section.count}</span>}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
