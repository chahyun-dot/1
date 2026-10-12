import { useState } from 'react'
import Osset from '@/components/page/Osset'
import { STYLING_SHOTS } from '@/data/ohou'

const PAGES = [STYLING_SHOTS.slice(0, 4), STYLING_SHOTS.slice(4, 8)]
const ARROW = 'absolute top-[226px] z-[2] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(63,71,77,0.25)]'
// 현재 쪽을 기준으로 멀어질수록 작아지는 점 5개
const DOT_SIZES = [6, 6, 6, 4, 2]

export default function StylingShots() {
  const [page, setPage] = useState(0)
  return (
    <section className="mb-20 w-[692px]">
      <header className="flex h-7 items-center justify-between">
        <h2 className="text-[18px] font-bold leading-6 text-oh-ink">
          유저들의 스타일링샷 <span className="text-oh-blue">11,612</span>
        </h2>
        <a href="#" aria-label="스타일링샷 전체보기" className="flex h-4 w-4 items-center justify-center">
          <Osset name="chevronRight" size={16} />
        </a>
      </header>

      <div className="relative mt-5 h-[500px]">
        <div className="h-full w-full overflow-hidden">
          <div className="flex h-full transition-transform duration-300" style={{ transform: `translateX(-${page * 100}%)` }}>
            {PAGES.map((shots, index) => (
              <div key={index} className="grid h-full w-full shrink-0 grid-cols-[342px_342px] grid-rows-[246px_246px] gap-2">
                {shots.map((shot) => (
                  <a key={shot.src} href="#" className="relative block overflow-hidden rounded-lg bg-oh-bg">
                    <img src={shot.src} alt={`${shot.user}님의 사진`} loading="lazy" className="h-full w-full object-cover" />
                    {shot.video && (
                      <span className="absolute right-[13px] top-3 flex h-6 items-center rounded-[20px] bg-black/70 px-[10px] text-[12px] leading-4 text-white">
                        {shot.video}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {page < PAGES.length - 1 && (
          <button type="button" aria-label="다음" onClick={() => setPage(page + 1)} className={`${ARROW} -right-6`}>
            <Osset name="chevronRight" size={24} />
          </button>
        )}
        {page > 0 && (
          <button type="button" aria-label="이전" onClick={() => setPage(page - 1)} className={`${ARROW} -left-6`}>
            <Osset name="chevronLeft" size={24} />
          </button>
        )}

        <div className="pointer-events-none absolute bottom-[17px] left-1/2 flex h-[6px] -translate-x-1/2 items-center justify-center gap-1">
          {DOT_SIZES.map((size, index) => (
            <span
              key={index}
              className="rounded-full bg-white"
              style={{ width: size, height: size, opacity: index === 0 ? 1 : 0.72 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex h-11 justify-center">
        <a
          href="#"
          className="flex h-11 w-[400px] items-center justify-center gap-[2px] rounded-lg border border-oh-blue bg-white text-[15px] font-medium leading-6 text-oh-blue"
        >
          스타일링샷 전체보기
          <Osset name="chevronRight" size={15} />
        </a>
      </div>
      <p className="mt-3 text-center text-[12px] leading-4 text-oh-light">
        해당 상품을 사용하는 유저들이 직접 태그한 콘텐츠로, 스타일링샷 속 상품과 실제 판매 상품이 다를 수 있습니다.
      </p>
    </section>
  )
}
