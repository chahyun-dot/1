import Osset from '@/components/page/Osset'
import { TODAY_DELIVERY_BADGE, TODAY_SHIP_BADGE } from '@/data/badges'
import { ICONS, type ProductCard as Card } from '@/data/ohou'

function Chip({ children, outlined }: { children: React.ReactNode; outlined?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded border px-1 text-[10px] font-medium leading-[14px] ${
        outlined ? 'border-oh-line bg-white text-oh-ink' : 'border-transparent bg-black/5 text-oh-gray'
      }`}
    >
      {children}
    </span>
  )
}

function BenefitChip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center rounded border border-oh-line bg-white pl-[3px] pr-1 text-[10px] font-medium leading-[14px] text-oh-ink">
      <img src={icon} alt="" className="mr-[3px] h-3 w-3" />
      {children}
    </span>
  )
}

// 가로 슬라이드와 맨 아래 추천 목록이 함께 쓰는 164px 상품 카드.
export default function ProductCard({ card }: { card: Card }) {
  return (
    <article className="relative w-[164px] pb-4">
      <a
        href={`https://store.ohou.se/goods/${card.id}`}
        target="_blank"
        rel="noreferrer"
        aria-label={card.name}
        className="absolute inset-0 z-[1]"
      />
      <div className="relative h-[164px] w-[164px] rounded-lg bg-[#f7f9fa]">
        <img src={card.image} alt="상품-썸네일-이미지" loading="lazy" className="absolute inset-0 h-full w-full rounded-lg object-cover" />
        <div className="absolute inset-0 rounded-lg border-[0.5px] border-black/5" />
        {card.badgeImage && <img src={card.badgeImage} alt="" className="absolute left-0 top-0 h-12 w-12" />}
        <button type="button" aria-label="스크랩" className="absolute bottom-[10px] right-[10px] z-[2] flex h-6 w-6 items-center justify-center text-white">
          <svg width="24" height="24" viewBox="0 0 480 480" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M310 60c26.116 0 48.585 5.957 64.313 21.686S396 119.883 396 146v247.889c0 10.958-5.109 20.971-13.798 26.892-8.882 6.052-20.449 7.057-30.938 1.872a15 15 0 0 1-.698-.366L240 360.687l-110.566 61.6q-.344.192-.698.366c-10.489 5.185-22.056 4.18-30.938-1.872C89.108 414.86 84 404.847 84 393.889V146c0-26.117 5.958-48.586 21.687-64.314C121.415 65.957 143.884 60 170 60zM170 92c-21.884 0-34.415 5.042-41.687 12.313S116 124.115 116 146v247.14l116.213-64.745.457-.246a16 16 0 0 1 15.117.246L364 393.14V146c0-21.885-5.042-34.415-12.313-41.687C344.415 97.043 331.884 92 310 92z" />
            <path fillOpacity="0.5" d="M170 92c-21.884 0-34.415 5.042-41.687 12.313S116 124.115 116 146v247.14l116.213-64.745.457-.246a16 16 0 0 1 15.117.246L364 393.14V146c0-21.885-5.042-34.415-12.313-41.687C344.415 97.043 331.884 92 310 92z" />
          </svg>
        </button>
      </div>

      <div className="mt-[10px]">
        <div className="flex flex-col gap-[2px]">
          <p className="text-[12px] font-semibold leading-4 text-oh-ink">{card.brand}</p>
          <p className="line-clamp-2 text-[13px] leading-[18px] text-oh-ink">{card.name}</p>
        </div>

        <div className="mt-1">
          {card.specialPrice && <p className="pt-[2px] text-[12px] font-medium leading-4 text-oh-red">특별인증가</p>}
          <p className="flex items-center gap-1 text-[17px] font-semibold leading-[22px]">
            <span className="text-oh-red">{card.discount}%</span>
            <span className="text-oh-ink">{card.price}</span>
          </p>
        </div>

        <p className="mt-[2px] flex items-center gap-[2px] text-[12px] leading-4 text-oh-gray">
          <Osset name="star" size={12} color="#ffc300" />
          <span>{card.rating}</span>
          <span>·</span>
          <span>리뷰 {card.reviews}</span>
        </p>

        <div className={`flex flex-col ${card.ohouDelivery || card.todayShip ? 'mt-2' : 'mt-1'}`}>
          {card.ohouDelivery && <img src={TODAY_DELIVERY_BADGE} alt="오늘의집배송뱃지" className="h-[15px] w-[83px]" />}
          {card.todayShip && (
            <>
              <img src={TODAY_SHIP_BADGE} alt="오늘출발뱃지" className="h-[15px] w-[61px]" />
              <span className="mt-1 text-[12px] leading-4 text-oh-blue">{card.todayShip}</span>
            </>
          )}
          <div className={`flex gap-1 ${card.ohouDelivery || card.todayShip ? 'mt-1' : ''}`}>
            {card.tags.map((tag, index) => (
              <Chip key={tag} outlined={index === 0 && tag === '무료배송'}>
                {tag}
              </Chip>
            ))}
          </div>
          {(card.coupon || card.pay) && (
            <div className="mt-1 flex flex-col items-start gap-1">
              {card.coupon && <BenefitChip icon={ICONS.couponBadge}>{card.coupon}</BenefitChip>}
              {card.pay && <BenefitChip icon={ICONS.cardBadge}>{card.pay}</BenefitChip>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
