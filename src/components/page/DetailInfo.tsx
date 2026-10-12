import InfoTable from '@/components/page/InfoTable'
import { DETAIL_IMAGES, DETAIL_NOTICES, SPEC_ROWS } from '@/data/ohou'

export default function DetailInfo() {
  return (
    <section id="goods-detail-section-information" className="mb-20 w-[692px]">
      <header className="flex h-7 items-center">
        <h2 className="text-[18px] font-bold leading-6 text-oh-ink">상품정보</h2>
      </header>

      <div className="mt-5">
        <div className="flex flex-col gap-2">
          {DETAIL_NOTICES.map((notice) => (
            <img key={notice.src} src={notice.src} alt={notice.alt} width={notice.w} height={notice.h} loading="lazy" className="block h-auto w-full" />
          ))}
        </div>

        <div>
          {DETAIL_IMAGES.map((image) => (
            <img key={image.src} src={image.src} alt="" width={image.w} height={image.h} loading="lazy" className="block h-auto max-w-full" />
          ))}
        </div>

        <div className="mt-[41px]">
          <InfoTable rows={SPEC_ROWS} />
        </div>
      </div>
    </section>
  )
}
