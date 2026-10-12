import ProductCard from '@/components/page/ProductCard'
import { SUGGESTED_PRODUCTS } from '@/data/ohou'

// 맨 아래 "추천" 목록: 164px 카드 4열. 원본은 스크롤하면 계속 이어지지만 여기서는 16개를 보여 준다.
export default function Suggestions() {
  return (
    <div id="goods-detail-section-suggestion" className="-ml-[6px] grid w-[704px] grid-cols-4">
      {SUGGESTED_PRODUCTS.map((card) => (
        <div key={card.id} className="px-[6px] pt-4">
          <ProductCard card={card} />
        </div>
      ))}
    </div>
  )
}
