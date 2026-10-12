import { Suspense, lazy, useState } from 'react'
import ProductHero, { Breadcrumb } from '@/components/page/ProductHero'
import PurchasePanel from '@/components/page/PurchasePanel'
import SiteHeader, { useHeaderVisible } from '@/components/page/SiteHeader'
import StickyTabs, { SECTIONS, TAB_HEIGHT, TAB_TOP_HIDDEN, TAB_TOP_WITH_HEADER, useActiveSection } from '@/components/page/StickyTabs'
import TopBanner from '@/components/page/TopBanner'
import TopButton from '@/components/page/TopButton'
import { usePurchase } from '@/components/page/usePurchase'
import type { ColorId } from '@/data/catalog'

const FitModal = lazy(() => import('@/components/fit/FitModal'))

function ModalLoading() {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
      <div className="flex items-center gap-2 rounded-xl bg-surface-base px-5 py-4 text-[14px] font-semibold text-text-primary shadow-xl">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
        3D 공간을 준비하고 있어요
      </div>
    </div>
  )
}

export default function App() {
  const [colorId, setColorId] = useState<ColorId>('white')
  const [fitOpen, setFitOpen] = useState(false)
  const purchase = usePurchase(setColorId)
  const headerVisible = useHeaderVisible()
  const tabTop = headerVisible ? TAB_TOP_WITH_HEADER : TAB_TOP_HIDDEN
  const active = useActiveSection(tabTop + TAB_HEIGHT + 20)
  const openFit = () => setFitOpen(true)

  return (
    <>
      <div className="ohou bg-white">
        <TopBanner />
        <SiteHeader fixedVisible={headerVisible} />
        <main>
          <div className="mx-auto w-full max-w-[1256px] px-[60px]">
            <Breadcrumb />
            <ProductHero purchase={purchase} onOpenFit={openFit} />
          </div>

          <StickyTabs top={tabTop} active={active} />

          <div className="mx-auto flex w-full max-w-[1256px] px-[60px]">
            <div className="w-[757px] shrink-0 pr-[65px] pt-[80px]">
              {/* 다음 단계에서 각 영역(스타일링샷, 상품정보, 리뷰 …)으로 채운다. */}
              {SECTIONS.map((section) => (
                <div key={section.id} id={section.id} className="mb-[80px] h-[700px] rounded-lg border border-dashed border-oh-line text-center text-[14px] leading-[700px] text-oh-gray">
                  {section.label}
                </div>
              ))}
            </div>
            <div className="w-[379px] shrink-0">
              <div className="sticky" style={{ top: tabTop + TAB_HEIGHT }}>
                <div className="w-[300px] pb-5 pl-[18px] pt-5">
                  <PurchasePanel purchase={purchase} variant="sticky" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <TopButton />
      {fitOpen && (
        <Suspense fallback={<ModalLoading />}>
          <FitModal colorId={colorId} onColor={setColorId} onClose={() => setFitOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
