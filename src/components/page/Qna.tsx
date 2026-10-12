import { useState } from 'react'
import Osset from '@/components/page/Osset'
import { QNAS } from '@/data/ohou'

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

export default function Qna() {
  return (
    <section id="goods-detail-section-question" className="mb-20 w-[692px]">
      <header className="flex h-7 items-center justify-between">
        <h2 className="text-[18px] font-bold leading-6 text-oh-ink">
          문의 <span className="text-oh-blue">1,115</span>
        </h2>
        <button type="button" className="h-7 rounded-md border border-transparent px-2 text-[14px] font-medium leading-[18px] text-oh-blue">
          문의하기
        </button>
      </header>

      <div className="mt-5">
        {QNAS.map((qna) => (
          <article key={qna.asked} className="mb-10">
            <header className="text-[12px] leading-[19px]">
              <span className="text-oh-ink">{qna.tags}</span> <span className="text-oh-blue">답변완료</span>
            </header>
            <p className="mt-2 text-[12px] leading-4 text-oh-gray">
              {qna.author} | {qna.asked}
            </p>

            <div className="mt-2 flex gap-3">
              <span className="text-[15px] font-bold leading-6 text-oh-blue">Q</span>
              <div className="flex min-w-0 flex-col gap-[6px]">
                {qna.option && <p className="text-[13px] leading-[22px] text-oh-gray">{qna.option}</p>}
                <span className="whitespace-pre-wrap text-[15px] leading-6 text-black">{qna.question}</span>
              </div>
            </div>

            <div className="mt-[10px] flex gap-3">
              <span className="text-[15px] font-bold leading-6 text-oh-blue">A</span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold leading-6 text-oh-ink">마켓비</span>
                  <span className="text-[12px] leading-4 text-oh-gray">{qna.answerDate}</span>
                </div>
                <p className="whitespace-pre-wrap break-all text-[15px] leading-6 text-black">{qna.answer}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-[40px]">
        <Pagination />
      </div>
    </section>
  )
}
