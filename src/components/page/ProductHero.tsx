import { useState } from 'react'
import Osset, { Stars } from '@/components/page/Osset'
import character from '@/assets/oh-character-new.webp'
import PurchasePanel from '@/components/page/PurchasePanel'
import type { Purchase } from '@/components/page/usePurchase'
import { PRODUCT } from '@/data/catalog'
import { BENEFITS, BREADCRUMB, DELIVERY, GALLERY, ICONS, galleryUrl } from '@/data/ohou'

export function Breadcrumb() {
  return (
    <div className="pt-5">
      <nav className="flex h-[18px] items-center gap-1 text-[14px] leading-[18px]">
        {BREADCRUMB.map((label, index) => (
          <span key={label} className="flex items-center gap-1">
            <button type="button" className={index === BREADCRUMB.length - 1 ? 'text-oh-ink' : 'text-oh-gray'}>
              {label}
            </button>
            {index < BREADCRUMB.length - 1 && <Osset name="chevronRight" size={18} color="#8c8c8c" />}
          </span>
        ))}
      </nav>
    </div>
  )
}

function Gallery({ onOpenFit }: { onOpenFit: () => void }) {
  const [index, setIndex] = useState(0)
  return (
    <div className="relative h-[537px] w-[603px] shrink-0">
      <div className="absolute left-0 top-0 flex w-14 flex-col gap-[10px]">
        {GALLERY.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`상품 이미지 ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`relative h-14 w-14 overflow-hidden rounded bg-oh-bg ${i === index ? 'ring-2 ring-inset ring-oh-blue' : ''}`}
          >
            <img src={galleryUrl(src, 144)} alt={`상품 이미지 ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="relative ml-[66px] h-[537px] w-[537px] overflow-hidden rounded-[10px] bg-oh-bg">
        <img src={galleryUrl(GALLERY[index], 1280)} alt={`상품 이미지 ${index + 1}`} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={onOpenFit}
          className="absolute bottom-4 right-4 flex cursor-pointer items-center gap-2 rounded-full border border-oh-line2 bg-white/95 px-[14px] py-2 text-oh-ink shadow-md backdrop-blur-md transition-colors hover:text-oh-blue"
        >
          <img src={character} alt="" width={52} height={52} className="-my-[14px] -ml-1 h-[52px] w-[52px] shrink-0 object-contain" />
          <span className="text-[13px] font-semibold">내 방에 맞을까? 가상배치</span>
          <Osset name="chevronRight" size={14} />
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="w-[42px] shrink-0 pt-[2px] text-[14px] leading-[17px] text-oh-gray">{label}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
    </div>
  )
}

export default function ProductHero({ purchase, onOpenFit }: { purchase: Purchase; onOpenFit: () => void }) {
  return (
    <section className="mt-10 flex gap-[60px] pb-[30px]">
      <Gallery onOpenFit={onOpenFit} />

      <div className="w-[473px] shrink-0">
        <a href="#" className="-mt-1 block w-fit rounded-[3px] text-[14px] font-semibold leading-[19px] text-oh-gray">
          {PRODUCT.brand}
        </a>

        <div className="relative mt-1 flex h-[43px] items-start justify-between">
          <h1 className="text-[20px] font-normal leading-7">{PRODUCT.name}</h1>
          <div className="absolute -right-[3px] top-0 flex">
            <button type="button" aria-label="스크랩" className="flex h-[45px] w-10 flex-col items-center pt-[5px]">
              <Osset name="bookmark" size={24} />
              <span className="text-[11px] leading-[14px]">{PRODUCT.scraps.toLocaleString()}</span>
            </button>
            <button type="button" aria-label="공유" className="flex h-[29px] w-8 items-start justify-center pt-[5px]">
              <Osset name="share" size={24} />
            </button>
          </div>
        </div>

        <a href="#reviews" className="mt-3 flex h-[21px] w-fit items-center gap-2">
          <Stars value={PRODUCT.rating} size={15} gap={2} />
          <span className="text-[13px] font-bold leading-5 text-oh-blue">{PRODUCT.reviews.toLocaleString()}개 리뷰</span>
        </a>

        <div className="relative mt-2 h-[108px]">
          <div className="flex h-5 items-center gap-[6px] text-[16px] leading-5">
            <span className="text-oh-gray">{PRODUCT.discount}%</span>
            <del className="text-oh-light">{PRODUCT.listPrice.toLocaleString()}원</del>
            <button type="button" aria-label="가격 안내" className="flex h-4 w-4 items-center justify-center text-oh-light">
              <Osset name="info" size={16} />
            </button>
          </div>
          <div className="mt-[2px] flex h-[42px] items-center gap-1">
            <span className="text-[32px] font-bold leading-[42px]">{PRODUCT.price.toLocaleString()}</span>
            <span className="text-[24px] leading-8">원</span>
          </div>
          <div className="mt-[2px] flex h-[42px] items-center text-oh-red">
            <span className="text-[32px] font-bold leading-[42px]">{PRODUCT.couponPrice.toLocaleString()}</span>
            <span className="ml-[3px] text-[24px] leading-8">원</span>
            <span className="ml-[9px] text-[15px] font-semibold leading-6">쿠폰 할인가</span>
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-10 w-[94px] items-center justify-center gap-1 rounded-lg border border-oh-line bg-white text-[14px] font-medium"
          >
            쿠폰 받기
            <Osset name="download" size={14} />
          </button>
        </div>

        <a
          href="#"
          className="mt-2 flex h-11 items-center justify-between rounded px-3"
          style={{ background: 'linear-gradient(90deg, rgb(20,125,225) 40%, rgb(0,161,255) 100%)' }}
        >
          <span className="flex items-center gap-[6px]">
            <img src={ICONS.packagePromo} alt="패키지 프로모션" className="h-5 w-5" />
            <span className="text-[14px] font-medium leading-5 text-white">패키지할인 받으면 더 할인돼요</span>
          </span>
          <Osset name="chevronRight" size={12} color="#fff" />
        </a>

        <div className="mt-5 flex flex-col gap-[14px]">
          <InfoRow label="혜택">
            <span className="text-[14px] leading-5">
              <b className="font-semibold">{BENEFITS.point.amount}</b> 적립 ({BENEFITS.point.note})
            </span>
            <button type="button" className="flex items-center gap-[2px] text-[14px] leading-5">
              최대 <b className="font-semibold">8%</b> 결제할인 (토스)
              <Osset name="chevronRight" size={12} />
            </button>
            <button type="button" className="flex items-center gap-[2px] text-[14px] leading-5">
              {BENEFITS.installment}
              <Osset name="chevronRight" size={12} />
            </button>
          </InfoRow>

          <InfoRow label="배송">
            <span className="text-[14px] font-semibold leading-5">{DELIVERY.fee}</span>
            <span className="text-[14px] leading-5">{DELIVERY.method}</span>
            <span className="flex items-center text-[13px] leading-[18px] text-oh-gray">
              {DELIVERY.notes[0]}
              <i className="mx-3 h-3 w-px bg-oh-line" />
              {DELIVERY.notes[1]}
            </span>
            <div className="mt-3 flex items-center rounded bg-oh-bg px-3 py-2">
              <Osset name="truck" size={18} />
              <span className="ml-1 flex-1 text-[14px] leading-5 text-black">
                <b className="font-bold text-oh-blue">{DELIVERY.arrive}</b> 이내 도착 예정
              </span>
              <button type="button" aria-label="배송 안내" className="flex h-[26px] w-[26px] items-center justify-center rounded text-oh-light">
                <Osset name="info" size={18} />
              </button>
            </div>
          </InfoRow>
        </div>

        <hr className="mt-5 border-0 border-t border-oh-line2" />
        <div className="flex h-[72px] items-center justify-between py-4 pr-4">
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-oh-line bg-white p-[5px]">
              <img src={ICONS.brandLogo} alt="마켓비-brand-logo" className="h-7 w-7" />
            </span>
            <span className="flex flex-col">
              <span className="flex items-center text-[14px] font-semibold leading-[18px] text-black">
                {PRODUCT.brand}
                <Osset name="chevronRight" size={12} />
              </span>
              <span className="text-[13px] leading-[18px] text-oh-gray">브랜드</span>
            </span>
          </a>
          <button type="button" aria-label="브랜드 스크랩" className="flex h-7 w-6 items-center">
            <Osset name="bookmark" size={24} />
          </button>
        </div>

        <PurchasePanel purchase={purchase} variant="hero" />

        <a href="#" className="mt-[30px] block">
          <img src={ICONS.promoBanner} alt="프로모션 배너" className="h-[57px] w-[473px] rounded object-cover" />
        </a>
      </div>
    </section>
  )
}
