import { useState } from 'react'
import Osset from '@/components/page/Osset'
import ProductCard from '@/components/page/ProductCard'
import { AD_PRODUCTS } from '@/data/ohou'

const CARD = 164
const GAP = 12
const VIEW = 692
const STEP = (CARD + GAP) * 4
const TRACK = AD_PRODUCTS.length * (CARD + GAP) - GAP
const MAX = TRACK - VIEW
const ARROW = 'absolute top-[62px] z-[2] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(63,71,77,0.25)]'

export default function AdCarousel() {
  const [offset, setOffset] = useState(0)
  const move = (delta: number) => setOffset((current) => Math.max(0, Math.min(MAX, current + delta)))

  return (
    <section className="mb-20 w-[692px]">
      <header className="flex h-7 items-center">
        <h2 className="flex items-center gap-[10px] text-[18px] font-bold leading-6 text-oh-ink">
          함께 둘러보면 좋아요
          <span className="flex h-[22px] items-center rounded border border-oh-line px-[6px] text-[10px] font-normal text-oh-gray">AD</span>
        </h2>
      </header>

      <div className="relative mt-5 h-[403px]">
        <div className="h-full w-full overflow-hidden">
          <ul className="flex h-full transition-transform duration-300" style={{ gap: GAP, transform: `translateX(-${offset}px)` }}>
            {AD_PRODUCTS.map((card) => (
              <li key={card.id} className="h-[403px] shrink-0">
                <ProductCard card={card} />
              </li>
            ))}
          </ul>
        </div>
        {offset < MAX && (
          <button type="button" aria-label="다음" onClick={() => move(STEP)} className={`${ARROW} -right-5`}>
            <Osset name="chevronRight" size={24} />
          </button>
        )}
        {offset > 0 && (
          <button type="button" aria-label="이전" onClick={() => move(-STEP)} className={`${ARROW} -left-5`}>
            <Osset name="chevronLeft" size={24} />
          </button>
        )}
      </div>
    </section>
  )
}
