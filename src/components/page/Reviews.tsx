import { useEffect, useRef, useState } from 'react'
import Osset, { Stars } from '@/components/page/Osset'
import { REVIEW_PAGES } from '@/data/reviewPages'
import { ICONS, REVIEWS, REVIEW_KEYWORDS, REVIEW_STATS, type Review } from '@/data/ohou'

// 원본(Lottie 애니메이션)의 첫 프레임과 눌렀을 때 채워지는 모양을 66×66 좌표 그대로 옮겼다.
function ThumbUp({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 66 66" aria-hidden="true">
      {on ? (
        <>
          <path
            fill="#009ecd"
            transform="translate(38.86 32.62) scale(.69)"
            d="M9.7-10.5H4.8C1.9-10.5-.2-13.3.6-16L1.2-18.2C2.7-23.2-1.1-28-6.3-28c-2.6 0-5 1.2-6.4 3.4L-21-12.4c-.7 1-1 2.2-1 3.4v31c0 3.4 2.7 6 6 6H6.5c5.4 0 10.1-3.8 11.1-9L20.7 2.7C22-4.2 16.7-10.5 9.7-10.5z"
          />
          <path fill="#009ecd" transform="translate(16.58 39.66) scale(.69)" d="M-4.9-12.1V12.1c0 3.2 2.6 5.7 5.8 5.7h4v-35.6h-4c-3.2 0-5.8 2.5-5.8 5.7z" />
        </>
      ) : (
        <path
          fill="#2e3337"
          fillRule="evenodd"
          transform="translate(33.35 32.53)"
          d="M11.5-8H8.1C6.4-8 5.3-9.5 5.7-11.1L6.1-12.6C7.2-16.5 4.3-20.3.3-20.3c-2 0-3.9 1-5.1 2.7L-11.7-7.3c-.4.6-.7 1.3-1 1.9h-3.9c-2.2 0-4.1 1.8-4.1 4v17.7c0 2.2 1.9 4 4.1 4H9.3c4 0 7.5-2.9 8.3-6.8L19.8 2C20.8-3.2 16.8-8 11.5-8zM-13.2 15.5h-2.6V-.6h2.6zM15 1.1 12.8 12.5C12.5 14.2 11 15.5 9.3 15.5H-8.3V-2.7c0-.7.2-1.4.6-2L-.7-14.9c.2-.4.6-.6 1-.6.8 0 1.4.8 1.2 1.6L1-12.4C-.3-7.8 3.2-3.2 8.1-3.2h3.4c2.2 0 4 2.1 3.5 4.3z"
        />
      )}
    </svg>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const [liked, setLiked] = useState(false)
  const count = (review.helpful ?? 0) + (liked ? 1 : 0)
  return (
    <article className="mb-10 flex flex-col gap-4 border-b border-oh-line pb-10 last:mb-0 last:border-b-0">
      <div className="flex h-10 items-center gap-2">
        <a href="#" className="h-6 w-6 shrink-0">
          <img src={review.avatar} alt={`${review.user}님의 프로필`} className="h-6 w-6 rounded-full bg-oh-line2 object-cover" />
        </a>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] leading-[18px] text-oh-ink">{review.user}</span>
          <div className="flex items-center gap-1">
            <Stars value={review.rating} size={15} />
            <span className="text-[13px] leading-[18px] text-oh-gray">{review.date} ∙ 오늘의집 구매</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-sm border-l-2 border-oh-line pl-[10px]">
        <span className="text-[13px] leading-[18px] text-oh-gray">{review.option}</span>
      </div>

      {review.image && (
        <button type="button" aria-label="리뷰 사진 크게 보기" className="h-[112px] w-[112px] overflow-hidden rounded">
          <img src={review.image} alt={`${review.user}님의 리뷰 사진`} loading="lazy" className="h-full w-full bg-oh-bg object-cover" />
        </button>
      )}

      <div>
        <p className="whitespace-pre-wrap text-[15px] leading-6 text-oh-ink">{review.text}</p>
      </div>

      <div className="flex items-center justify-end gap-[10px]">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
          className="flex h-[38px] items-center gap-1 rounded-[50px] border border-oh-line bg-white px-[14px] py-[10px] text-[14px] leading-[18px]"
        >
          <ThumbUp on={liked} />
          <span className={liked ? 'text-oh-blue' : 'text-oh-ink'}>도움돼요</span>
          {count > 0 && <span className="text-oh-gray">{count}</span>}
        </button>
      </div>
    </article>
  )
}

const PER_PAGE = 5
// 옮겨 둔 리뷰 전체(1~9쪽, 베스트순). 정렬·필터는 이 안에서만 적용된다.
const ALL_REVIEWS = [...REVIEWS, ...REVIEW_PAGES.flat()]

function Pagination({ page, pageCount, setPage }: { page: number; pageCount: number; setPage: (page: number) => void }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  return (
    <div className="flex h-8 justify-center gap-[10px]">
      <button
        type="button"
        aria-label="이전 페이지"
        onClick={() => setPage(Math.max(1, page - 1))}
        className="flex h-8 w-8 items-center justify-center rounded border border-[#eaedef] bg-[#f7f9fa] text-oh-dark"
      >
        <Osset name="chevronLeft" size={18} />
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setPage(n)}
          className={`h-8 w-8 rounded text-[14px] ${n === page ? 'bg-oh-blue font-normal text-white' : 'font-medium text-oh-dark'}`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        onClick={() => setPage(Math.min(pageCount, page + 1))}
        className="flex h-8 w-8 items-center justify-center rounded border border-oh-line bg-white text-oh-dark"
      >
        <Osset name="chevronRight" size={18} />
      </button>
    </div>
  )
}

type FilterItem = { key: string; label: React.ReactNode }

function FilterMenu({ label, title, items, selected, onToggle }: { label: string; title?: string; items: FilterItem[]; selected: Set<string>; onToggle: (key: string) => void }) {
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
  const active = selected.size > 0
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 min-w-[62px] items-center justify-center rounded-md border bg-white px-2 text-[14px] leading-[18px] ${active ? 'border-oh-blue text-oh-blue' : 'border-oh-line text-oh-ink'}`}
      >
        {label}
        {active && <span className="ml-1">{selected.size}</span>}
        <Osset name="chevronDown" size={14} className={`ml-1 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[38px] z-10 w-[240px] rounded-md border border-oh-line bg-white py-2 shadow-[0_4px_10px_rgba(63,71,77,0.2)]">
          {title && <p className="px-4 pb-2 pt-1 text-[13px] font-bold leading-[18px] text-oh-ink">{title}</p>}
          <ul className="max-h-[320px] overflow-y-auto">
            {items.map((item) => (
              <li key={item.key}>
                <label className="flex cursor-pointer items-center gap-2 px-4 py-[7px] text-[14px] leading-5 text-oh-ink hover:bg-oh-bg">
                  <input
                    type="checkbox"
                    checked={selected.has(item.key)}
                    onChange={() => onToggle(item.key)}
                    className="oh-check h-5 w-5 shrink-0 cursor-pointer appearance-none rounded border border-oh-line bg-white"
                  />
                  <span className="min-w-0 truncate">{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const OPTIONS = [...new Set(ALL_REVIEWS.map((r) => r.option))]
  .map((option) => ({ option, count: ALL_REVIEWS.filter((r) => r.option === option).length }))
  .sort((a, b) => b.count - a.count)
  .map((o) => o.option)

function toggled<T>(set: Set<T>, key: T) {
  const next = new Set(set)
  if (!next.delete(key)) next.add(key)
  return next
}

export default function Reviews() {
  const [sort, setSort] = useState<'best' | 'latest'>('best')
  const [stars, setStars] = useState<Set<number>>(new Set())
  const [options, setOptions] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const filtered = ALL_REVIEWS.filter((r) => (stars.size === 0 || stars.has(r.rating)) && (options.size === 0 || options.has(r.option)))
  const sorted = sort === 'latest' ? [...filtered].sort((a, b) => b.date.localeCompare(a.date)) : filtered
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const reviews = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const scrollToTop = () => {
    // 새 목록의 첫 리뷰가 고정 탭 바 바로 아래(제목 154px)에 오도록 맨 위로 올린다.
    const top = document.getElementById('goods-detail-section-reviews')!.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top - 154 })
  }
  const goPage = (next: number) => {
    setPage(next)
    scrollToTop()
  }
  const change = <T,>(set: (value: T) => void, value: T) => {
    set(value)
    setPage(1)
  }
  return (
    <section id="goods-detail-section-reviews" className="mb-20 w-[692px]">
      <header className="flex h-7 items-center justify-between">
        <h2 className="text-[18px] font-bold leading-6 text-oh-ink">
          리뷰 <span className="text-oh-blue">{REVIEW_STATS.total}</span>
        </h2>
        <button type="button" className="h-7 rounded-md border border-transparent px-2 text-[14px] font-medium leading-[18px] text-oh-blue">
          리뷰 남기기
        </button>
      </header>

      <div className="mt-5 flex h-[158px] items-center rounded-lg bg-oh-bg py-6">
        <div className="flex h-[102px] w-[305px] shrink-0 items-center justify-center gap-3">
          <Stars value={4.5} size={20} />
          <span className="text-[32px] font-bold leading-[42px] text-black">{REVIEW_STATS.average}</span>
        </div>
        <div className="ml-[67px] flex w-[251px] flex-col gap-1">
          {REVIEW_STATS.bars.map((bar) => (
            <div key={bar.score} className="flex h-[18px] items-center">
              <span className={`pt-[2px] text-[12px] leading-4 ${bar.score === 5 ? 'font-bold text-oh-blue' : 'text-oh-gray'}`}>{bar.score}점</span>
              <div className="relative ml-[9px] h-[5px] w-[180px] rounded-[10px] bg-oh-line">
                <div className="absolute left-0 top-0 h-[5px] rounded-[10px] bg-oh-blue" style={{ width: bar.width }} />
              </div>
              <span className={`ml-2 text-[12px] leading-4 ${bar.score === 5 ? 'font-bold text-oh-blue' : 'text-oh-gray'}`}>{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex h-[58px] items-center justify-between border-y border-oh-line pr-1">
        <div className="flex gap-[6px]">
          {(
            [
              ['best', '베스트순'],
              ['latest', '최신순'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => change(setSort, key)}
              className={`h-7 rounded-md border border-transparent px-2 text-[14px] font-medium leading-[18px] ${sort === key ? 'text-oh-blue' : 'text-oh-gray'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <FilterMenu
            label="별점"
            items={REVIEW_STATS.bars.map((bar) => ({
              key: String(bar.score),
              label: (
                <span className="flex items-center gap-1">
                  <Stars value={bar.score} size={14} />
                  <span className="text-oh-gray">({bar.count})</span>
                </span>
              ),
            }))}
            selected={new Set([...stars].map(String))}
            onToggle={(key) => change(setStars, toggled(stars, Number(key)))}
          />
          <FilterMenu
            label="옵션"
            title="옵션"
            items={OPTIONS.map((option) => ({ key: option, label: option }))}
            selected={options}
            onToggle={(key) => change(setOptions, toggled(options, key))}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex items-center gap-1">
          <img src={ICONS.sparkles} alt="" className="h-4 w-4" />
          <span className="text-[16px] font-bold leading-5 text-oh-ink">궁금한 내용만 골라 보세요</span>
          <button type="button" aria-label="안내" className="flex h-4 w-4 items-center justify-center text-oh-light">
            <Osset name="info" size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-x-1 gap-y-2">
          {REVIEW_KEYWORDS.map((keyword) => (
            <button
              key={keyword.label}
              type="button"
              className="flex h-8 items-center gap-1 rounded-full border border-oh-line bg-white px-[9px] text-[14px] leading-[18px]"
            >
              <span className="text-oh-ink">{keyword.label}</span>
              <span className="text-oh-gray">{keyword.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {reviews.length === 0 && <p className="py-20 text-center text-[15px] text-oh-gray">조건에 맞는 리뷰가 없어요</p>}
        {reviews.map((review, index) => (
          <ReviewItem key={`${sort}-${page}-${review.user}-${index}`} review={review} />
        ))}
      </div>

      <div className="mt-10">
        <Pagination page={page} pageCount={pageCount} setPage={goPage} />
      </div>

      <div className="mt-9 rounded bg-oh-bg p-3">
        <p className="text-[14px] leading-[18px] text-oh-gray">앱에서 더 많은 사진과 동영상 리뷰를 볼 수 있어요</p>
      </div>
    </section>
  )
}
