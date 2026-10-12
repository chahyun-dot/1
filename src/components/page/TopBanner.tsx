import { useState } from 'react'
import Osset from '@/components/page/Osset'
import { TOP_BANNER } from '@/data/ohou'

export default function TopBanner() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className="relative h-[50px] bg-[#1496f4]">
      <a
        href={TOP_BANNER.href}
        aria-label="PC 최상단 배너"
        className="absolute left-1/2 top-0 h-[50px] w-[1036px] max-w-full -translate-x-1/2 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${TOP_BANNER.image})` }}
      />
      <button
        type="button"
        aria-label="배너 닫기"
        onClick={() => setOpen(false)}
        className="absolute right-2 top-0 flex h-12 w-12 items-center justify-center text-white"
      >
        <Osset name="x" size={24} />
      </button>
    </div>
  )
}
