import { Suspense, lazy, useEffect, useState } from 'react'
import AdCarousel from '@/components/page/AdCarousel'
import DeliverySection from '@/components/page/DeliverySection'
import DetailInfo from '@/components/page/DetailInfo'
import Qna from '@/components/page/Qna'
import Reviews from '@/components/page/Reviews'
import SiteFooter from '@/components/page/SiteFooter'
import ProductHero, { Breadcrumb } from '@/components/page/ProductHero'
import PurchasePanel from '@/components/page/PurchasePanel'
import SiteHeader, { useHeaderMode } from '@/components/page/SiteHeader'
import StickyTabs, { TAB_HEIGHT, TAB_TOP_HIDDEN, TAB_TOP_WITH_HEADER, useActiveSection } from '@/components/page/StickyTabs'
import StylingShots from '@/components/page/StylingShots'
import Suggestions from '@/components/page/Suggestions'
import TopBanner from '@/components/page/TopBanner'
import TopButton from '@/components/page/TopButton'
import { usePurchase } from '@/components/page/usePurchase'
import type { ColorId } from '@/data/catalog'

const FitModal = lazy(() => import('@/components/fit/FitModal'))
const FitStudio = lazy(() => import('@/components/fit/FitStudio'))
const FurnitureCatalog = lazy(() => import('@/components/page/FurnitureCatalog'))
const FitDemo = lazy(() => import('@/components/demo/FitDemo'))
const ModelPreview = lazy(() => import('@/components/demo/ModelPreview'))

// 주소 끝이 #/furniture 이면 가구 목록, #/demo 이면 데모 페이지, #/models 이면 3D 모델 미리보기를 상품 페이지 대신 보여 준다.
type Route = 'home' | 'furniture' | 'demo' | 'demo2' | 'desk' | 'models'

const ROUTES: Record<string, Route> = { '#/furniture': 'furniture', '#/demo': 'demo', '#/demo2': 'demo2', '#/desk': 'desk', '#/models': 'models' }

// 주소 뒤에 ?fit=old 를 붙이면 합치기 전 "내 공간에 맞는지 확인하기" 팝업을 연다.
const useOldFit = () => new URLSearchParams(window.location.search).get('fit') === 'old'

const routeOf = (): Route => ROUTES[window.location.hash] ?? 'home'

function useRoute() {
  const [route, setRoute] = useState<Route>(routeOf)
  useEffect(() => {
    const onHash = () => setRoute(routeOf())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

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
  const { mode: headerMode, pin: pinHeader } = useHeaderMode()
  const tabTop = headerMode === 'full' ? TAB_TOP_WITH_HEADER : TAB_TOP_HIDDEN
  const active = useActiveSection(0.25)
  const route = useRoute()
  const openFit = () => setFitOpen(true)

  const demo2 = route === 'demo2'
  // #/desk 는 상품 페이지 버튼과 같이 책상 상세부터 팝업을 연다.
  const direct = demo2 || route === 'desk'
  const fitShown = fitOpen || direct
  const closeFit = () => {
    setFitOpen(false)
    if (direct) window.location.hash = '#/'
  }

  if (route !== 'home' && !direct) {
    return (
      <Suspense fallback={<ModalLoading />}>
        {route === 'furniture' ? <FurnitureCatalog /> : route === 'models' ? <ModelPreview /> : <FitDemo />}
      </Suspense>
    )
  }

  return (
    <>
      <div className="ohou bg-white">
        <TopBanner />
        <SiteHeader mode={headerMode} />
        <main>
          <div className="mx-auto w-full max-w-[1256px] px-[60px]">
            <Breadcrumb />
            <ProductHero purchase={purchase} onOpenFit={openFit} />
          </div>

          <StickyTabs top={tabTop} active={active} onGo={pinHeader} />

          <div className="mx-auto flex w-full max-w-[1256px] px-[60px]">
            <div className="w-[757px] shrink-0 pr-[65px] pt-[80px]">
              <StylingShots />
              <AdCarousel />
              <DetailInfo />
              <Reviews />
              <Qna />
              <DeliverySection />
              <Suggestions />
            </div>
            <div className="w-[379px] shrink-0">
              {/* 화면 높이에서 위쪽 고정 영역을 뺀 만큼만 차지해서, 헤더가 보이면 옵션 영역이 그만큼 줄어든다. */}
              <div className="sticky" style={{ top: tabTop + TAB_HEIGHT, height: `calc(100vh - ${tabTop + TAB_HEIGHT}px)` }}>
                <div className="h-full w-[300px] pb-5 pl-[18px] pt-5">
                  <PurchasePanel purchase={purchase} variant="sticky" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
      <TopButton />
      {fitShown && (
        <Suspense fallback={<ModalLoading />}>
          {useOldFit() ? <FitModal colorId={colorId} onColor={setColorId} onClose={closeFit} /> : <FitStudio colorId={colorId} onColor={setColorId} onClose={closeFit} startInDetail={!demo2} />}
        </Suspense>
      )}
    </>
  )
}
