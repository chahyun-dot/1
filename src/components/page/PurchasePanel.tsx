import Osset from '@/components/page/Osset'
import type { Purchase } from '@/components/page/usePurchase'
import { ADDONS, COLORS, type ColorId } from '@/data/catalog'
import { ASSEMBLY, ICONS } from '@/data/ohou'

const won = (value: number) => value.toLocaleString()

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative h-10">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded border border-oh-line bg-white pl-[13px] pr-[37px] text-[14px] text-oh-ink outline-none focus:border-oh-blue"
      >
        {children}
      </select>
      <Osset name="triangleDown" size={24} className="pointer-events-none absolute right-[13px] top-2 text-oh-dark" />
    </div>
  )
}

function Stepper({ qty, onChange }: { qty: number; onChange: (delta: number) => void }) {
  return (
    <div className="flex h-8 items-center justify-between gap-1 rounded border border-oh-line bg-white px-2 py-1">
      <button type="button" aria-label="수량 줄이기" onClick={() => onChange(-1)} className="flex h-4 w-4 items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10" stroke="#141414" strokeWidth="1.2" strokeLinecap="round" /></svg>
      </button>
      <span className="min-w-[8px] px-[6px] text-center text-[14px] leading-[18px]">{qty}</span>
      <button type="button" aria-label="수량 늘리기" onClick={() => onChange(1)} className="flex h-4 w-4 items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3v10" stroke="#141414" strokeWidth="1.2" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}

function OptionCard({ label, qty, price, onQty, onRemove }: { label: string; qty: number; price: number; onQty: (delta: number) => void; onRemove: () => void }) {
  return (
    <li className="rounded bg-oh-bg p-3">
      <div className="flex items-start justify-between">
        <span className="text-[14px] leading-[18px]">{label}</span>
        <button type="button" aria-label="옵션 삭제" onClick={onRemove} className="flex h-[19px] w-3 items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="#8c8c8c" strokeWidth="1.2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="mt-[22px] flex items-center justify-between">
        <Stepper qty={qty} onChange={onQty} />
        <span className="text-[16px] font-semibold leading-5">{won(price * qty)}원</span>
      </div>
    </li>
  )
}

export default function PurchasePanel({ purchase, variant }: { purchase: Purchase; variant: 'hero' | 'sticky' }) {
  const hero = variant === 'hero'
  const addon = ADDONS[0]
  const hasOptions = purchase.options.length > 0 || purchase.addonQty > 0

  return (
    <div className={hero ? 'flex flex-col' : 'flex h-full flex-col'}>
      <div className={hero ? 'flex flex-col' : 'flex min-h-0 flex-1 flex-col'}>
      <div className="flex flex-col gap-3 pb-3">
        <Select label="색상" value="" onChange={(id) => id && purchase.addColor(id as ColorId)}>
          <option value="">색상</option>
          {COLORS.map((color) => (
            <option key={color.id} value={color.id}>
              {color.label} ({won(color.price)}원)
            </option>
          ))}
        </Select>
        <Select label="추가상품 (선택)" value="" onChange={(id) => id && purchase.addAddon()}>
          <option value="">추가상품 (선택)</option>
          <option value={addon.id}>
            {addon.label} ({won(addon.price)}원)
          </option>
        </Select>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={purchase.assembly}
          onChange={(event) => purchase.setAssembly(event.target.checked)}
          className="oh-check mt-0 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded border border-oh-line bg-white"
        />
        <span className="block">
          <p className="text-[16px] font-bold leading-5">
            {ASSEMBLY.title} <span className="font-normal text-oh-gray">{ASSEMBLY.price}</span>
          </p>
          <p className="text-[13px] leading-[18px] text-oh-gray">{ASSEMBLY.note}</p>
        </span>
      </label>

      {hasOptions && (
        <ul className={`mt-5 flex flex-col gap-2 ${hero ? '' : 'min-h-0 flex-1 overflow-y-auto'}`}>
          {purchase.options.map((option) => {
            const color = COLORS.find((c) => c.id === option.id)!
            return (
              <OptionCard
                key={option.id}
                label={color.label}
                qty={option.qty}
                price={color.price}
                onQty={(delta) => purchase.changeQty(option.id, delta)}
                onRemove={() => purchase.removeColor(option.id)}
              />
            )
          })}
          {purchase.addonQty > 0 && (
            <OptionCard label={addon.label} qty={purchase.addonQty} price={addon.price} onQty={purchase.changeAddonQty} onRemove={purchase.removeAddon} />
          )}
        </ul>
      )}

      </div>

      <div className={`${hero ? 'mt-5' : ''} ${hasOptions ? 'border-t border-oh-line2 pt-5' : ''}`}>
        <div className="flex h-7 items-center justify-between">
          <span className="text-[14px] font-bold leading-5">주문금액</span>
          <span className="text-[20px] font-bold leading-7">{won(purchase.total)}원</span>
        </div>

        <button
          type="button"
          className="mt-5 flex h-11 w-full items-center justify-between rounded-lg border border-oh-line bg-white px-4 text-[14px]"
        >
          <span className="leading-5">받지 않은 쿠폰이 더 있어요</span>
          <span className="flex items-center gap-[2px] font-bold text-oh-red">
            쿠폰 받기
            <Osset name="download" size={12} />
          </span>
        </button>

        <div className="mt-2 flex h-[54px] items-center justify-between rounded bg-oh-bg px-4 py-[10px]">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[13px] font-medium leading-[18px] text-oh-gray">패키지 담기시, 장바구니에 함께 담기</span>
            <a href="#" className="text-[11px] leading-[14px] text-oh-blue">로그인하고 사용하기</a>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={purchase.pack}
            aria-label="패키지 담기시 장바구니에 함께 담기"
            onClick={() => purchase.setPack(!purchase.pack)}
            className={`relative h-6 w-[42px] shrink-0 rounded-[25px] transition-colors ${purchase.pack ? 'bg-oh-blue' : 'bg-[#c2c8cc]'}`}
          >
            <span className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow transition-all ${purchase.pack ? 'left-[20px]' : 'left-[2px]'}`} />
          </button>
        </div>

        {hero ? (
          <div className="mt-5 flex gap-2">
            <button type="button" className="flex h-12 flex-1 items-center justify-center gap-1 rounded-lg border border-oh-line bg-white text-[16px] font-medium">
              <img src={ICONS.percentCube} alt="" className="h-6 w-6" />
              패키지 담기
            </button>
            <button type="button" className="h-12 flex-1 rounded-lg border border-oh-blue bg-white text-[16px] font-medium text-oh-blue">
              장바구니
            </button>
            <button type="button" className="h-12 flex-1 rounded-lg border border-transparent bg-oh-blue text-[16px] font-medium text-white">
              바로구매
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="mt-5 flex h-11 w-full items-center justify-center gap-1 rounded-lg border border-oh-line bg-white text-[15px] font-medium"
            >
              <img src={ICONS.percentCube} alt="" className="h-7 w-7" />
              패키지 담기
            </button>
            <div className="mt-2 flex gap-2">
              <button type="button" aria-label="스크랩" className="flex h-12 w-[55px] items-center justify-center rounded-lg border border-oh-line bg-white">
                <Osset name="bookmark" size={22} />
              </button>
              <button type="button" className="h-12 flex-1 rounded-lg border border-oh-blue bg-white text-[16px] font-medium text-oh-blue">
                장바구니
              </button>
              <button type="button" className="h-12 flex-1 rounded-lg border border-transparent bg-oh-blue text-[16px] font-medium text-white">
                바로구매
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
