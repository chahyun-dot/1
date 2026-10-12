import { useState } from 'react'
import Osset, { Stars } from '@/components/page/Osset'
import { ICONS, REVIEWS, REVIEW_KEYWORDS, REVIEW_STATS, type Review } from '@/data/ohou'

function ThumbUp({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={on ? '#00a1ff' : 'none'} aria-hidden="true">
      <path
        d="M5.5 7.2V13.5H3a.9.9 0 0 1-.9-.9V8.1c0-.5.4-.9.9-.9h2.5Zm0 0 2.2-4.4c.3-.6 1-.9 1.6-.6.6.3.9 1 .7 1.6L9.4 6.2h3.1c.9 0 1.5.8 1.3 1.7l-.9 4.2c-.1.8-.8 1.4-1.7 1.4H5.5"
        stroke={on ? '#00a1ff' : '#2e3337'}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
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

      <button type="button" aria-label="리뷰 사진 크게 보기" className="h-[112px] w-[112px] overflow-hidden rounded">
        <img src={review.image} alt={`${review.user}님의 리뷰 사진`} loading="lazy" className="h-full w-full bg-oh-bg object-cover" />
      </button>

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

function Pagination() {
  const [page, setPage] = useState(1)
  const pages = Array.from({ length: 9 }, (_, i) => i + 1)
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
        onClick={() => setPage(Math.min(9, page + 1))}
        className="flex h-8 w-8 items-center justify-center rounded border border-oh-line bg-white text-oh-dark"
      >
        <Osset name="chevronRight" size={18} />
      </button>
    </div>
  )
}

const FILTER = 'flex h-8 w-[62px] items-center justify-center rounded-md border border-oh-line bg-white text-[14px] leading-[18px] text-oh-ink'

export default function Reviews() {
  const [sort, setSort] = useState<'best' | 'latest'>('best')
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
              onClick={() => setSort(key)}
              className={`h-7 rounded-md border border-transparent px-2 text-[14px] font-medium leading-[18px] ${sort === key ? 'text-oh-blue' : 'text-oh-gray'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className={FILTER}>
            별점
            <Osset name="chevronDown" size={14} className="ml-1" />
          </button>
          <button type="button" className={FILTER}>
            옵션
            <Osset name="chevronDown" size={14} className="ml-1" />
          </button>
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
        {REVIEWS.map((review, index) => (
          <ReviewItem key={`${review.user}-${index}`} review={review} />
        ))}
      </div>

      <div className="mt-10">
        <Pagination />
      </div>

      <div className="mt-9 rounded bg-oh-bg p-3">
        <p className="text-[14px] leading-[18px] text-oh-gray">앱에서 더 많은 사진과 동영상 리뷰를 볼 수 있어요</p>
      </div>
    </section>
  )
}
