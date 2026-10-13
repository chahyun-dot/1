import { useMemo, useState } from 'react'
import { FURNITURE, FURNITURE_PROJECT, type Furniture } from '@/data/furniture'

type Filter = 'all' | 'placed' | 'unplaced'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'placed', label: '방에 배치' },
  { id: 'unplaced', label: '방 밖' },
]

const won = (value: number) => `${value.toLocaleString()}원`
const size = (f: Furniture) => (f.size.w + f.size.d + f.size.h === 0 ? '치수 정보 없음' : `W${f.size.w} × D${f.size.d} × H${f.size.h}mm`)

function Card({ item }: { item: Furniture }) {
  const [broken, setBroken] = useState(false)
  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-oh-line2 bg-white">
      <div className="relative aspect-square bg-oh-bg">
        {broken ? (
          <div className="flex h-full items-center justify-center text-[13px] text-oh-gray">이미지를 불러오지 못했어요</div>
        ) : (
          <img src={item.image} alt={item.name} loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-contain" />
        )}
        {item.quantity > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-oh-ink px-2 py-0.5 text-[12px] font-bold text-white">× {item.quantity}</span>
        )}
        {!item.placed && (
          <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-oh-gray shadow">방 밖</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[12px] leading-4 text-oh-gray">{item.brand ?? '브랜드 정보 없음'}</p>
        <p className="line-clamp-2 text-[14px] font-bold leading-5 text-oh-ink">{item.name}</p>
        <p className="mt-auto pt-1 text-[12px] leading-4 text-oh-gray">{size(item)}</p>
        <p className={`text-[14px] font-bold leading-5 ${item.price > 0 ? 'text-oh-ink' : 'text-oh-light'}`}>{item.price > 0 ? won(item.price) : '가격 정보 없음'}</p>
      </div>
    </li>
  )
}

export default function FurnitureCatalog() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FURNITURE.filter((f) => (filter === 'all' || (filter === 'placed') === f.placed) && (q === '' || `${f.name} ${f.brand ?? ''}`.toLowerCase().includes(q)))
  }, [query, filter])

  const totalQuantity = FURNITURE.reduce((sum, f) => sum + f.quantity, 0)
  const totalPrice = FURNITURE.reduce((sum, f) => sum + f.price * f.quantity, 0)
  const count = (f: Filter) => FURNITURE.filter((x) => f === 'all' || (f === 'placed') === x.placed).length

  return (
    <div className="ohou min-h-screen bg-white pb-16">
      <header className="border-b border-oh-line2">
        <div className="mx-auto flex max-w-[1256px] items-center justify-between px-[60px] py-5">
          <h1 className="text-[22px] font-bold text-oh-ink">가구 목록 <span className="text-oh-blue">{FURNITURE.length}</span></h1>
          <a href="#/" className="text-[14px] font-medium text-oh-blue">상품 페이지로 돌아가기</a>
        </div>
      </header>

      <main className="mx-auto max-w-[1256px] px-[60px]">
        <p className="mt-6 text-[14px] text-oh-gray">프로젝트 “{FURNITURE_PROJECT}”에서 내보낸 가구예요. 이미지는 componentId 로 짝지었어요.</p>

        <dl className="mt-4 grid grid-cols-3 gap-3">
          {[
            ['항목', `${FURNITURE.length}개`],
            ['총 수량', `${totalQuantity}개`],
            ['가격 합계(소비자가 × 수량)', won(totalPrice)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-oh-bg px-5 py-4">
              <dt className="text-[13px] text-oh-gray">{label}</dt>
              <dd className="mt-1 text-[20px] font-bold text-oh-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`h-9 cursor-pointer rounded-full border px-4 text-[14px] font-medium ${
                  filter === f.id ? 'border-oh-blue bg-oh-blue text-white' : 'border-oh-line bg-white text-oh-dark'
                }`}
              >
                {f.label} {count(f.id)}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름·브랜드 검색"
            className="h-9 w-[260px] rounded-full border border-oh-line bg-white px-4 text-[14px] outline-none focus:border-oh-blue"
          />
        </div>

        {shown.length === 0 ? (
          <p className="py-24 text-center text-[15px] text-oh-gray">조건에 맞는 가구가 없어요</p>
        ) : (
          <ul className="mt-5 grid grid-cols-4 gap-4">
            {shown.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
