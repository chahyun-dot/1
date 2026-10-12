// 오늘의집 상품 페이지(store.ohou.se/goods/307306)에 표시되는 내용. 텍스트·이미지 주소는 원본 그대로 둔다.

const IMG = 'https://image.ohousecdn.com/i/bucketplace-v2-development/'
const PRS = 'https://prs.ohousecdn.com/apne2/'

export const TOP_BANNER = {
  href: 'https://store.ohou.se/exhibitions/10162',
  image: 'https://prs.ohouse.com/apne2/commerce/uploads/store/banners/store_top_banners/v1-454626313498688.png',
}

export const GNB = ['집구경', '쇼핑', '인테리어/생활'] as const
export type GnbLabel = (typeof GNB)[number]

export const GNB_MENUS: Record<Exclude<GnbLabel, '쇼핑'>, { label: string; href: string }[]> = {
  집구경: [
    { label: '홈', href: 'https://ohou.se/' },
    { label: '추천', href: 'https://contents.ohou.se/topics/recommend' },
    { label: '집들이', href: 'https://contents.ohou.se/projects' },
    { label: '집사진', href: 'https://ohou.se/contents/card_collections' },
    { label: '커뮤니티', href: 'https://contents.ohou.se/community' },
    { label: '3D인테리어', href: 'https://ohou.se/interior3ds' },
  ],
  '인테리어/생활': [
    { label: '홈', href: 'https://ohou.se/experts' },
    { label: '전체시공', href: 'https://o2o.ohou.se/remodeling/home/discovery' },
    { label: '부분시공', href: 'https://o2o.ohou.se/remodeling/part' },
    { label: '아파트시공사례', href: 'https://ohou.se/experts/town' },
    { label: '이사', href: 'https://ohou.se/experts/moving' },
    { label: '제품설치', href: 'https://o2o.ohou.se/repair' },
    { label: '시공자재랭킹', href: 'https://o2o.ohou.se/remodeling/goods/ranks' },
  ],
}

export const CATEGORY_NAV = ['쇼핑홈', '카테고리', '베스트', '오늘의딜', '단독상품', '식탁위예술', '오마트', '원하는날도착', '오!쇼룸', '기획전']

const CATEGORY_IMG = 'https://prs.ohouse.com/apne2/commerce/uploads/category/store_hamburger_categories/'

export const STORE_CATEGORIES = [
  ['가구', 10000000, 'v1-484634278838272'],
  ['가전·디지털', 14000000, 'v1-484634298495104'],
  ['패브릭', 18000000, 'v1-484634315501568'],
  ['주방용품', 16000000, 'v1-484634333909120'],
  ['식품', 31000000, 'v1-484634353033280'],
  ['데코·식물', 11000000, 'v1-484634373091328'],
  ['조명', 28000000, 'v1-485389660414080'],
  ['수납·정리', 13000000, 'v1-484634412826752'],
  ['생활용품', 12000000, 'v1-484634428547136'],
  ['생필품', 23000000, 'v1-484634451369984'],
  ['유아·아동', 27000000, 'v1-484634472935424'],
  ['반려동물', 15000000, 'v1-485353010577408'],
  ['캠핑·레저', 32000000, 'v1-484634521288768'],
  ['공구·DIY', 19000000, 'v1-484634541781120'],
  ['인테리어시공', 17000000, 'v1-484634560954368'],
  ['렌탈·구독', 26000000, 'v1-484634580844544'],
  ['장보기', 33000000, 'v1-484634600026240'],
].map(([label, id, file]) => ({
  label: label as string,
  href: `https://ohou.se/store/category?affect_type=StoreHamburger&category_id=${id}`,
  image: `${CATEGORY_IMG}${file}.png?w=1280`,
}))

const ASSET = 'https://asset.ohousecdn.com/static/'

export const WRITE_MENU = [
  { title: '사진/동영상', desc: '우리 집의 공간과 나의 일상을 기록해보세요.', icon: `${ASSET}AssetPhotoSmallGenuineBlue/photo-small-genuine-blue.svg` },
  { title: '커뮤니티', desc: '쇼핑 고민부터 일상 이야기까지 함께 나눠보세요.', icon: `${ASSET}AssetPencilLineSmallCoralRed/pencil-line-small-coral-red.svg` },
  { title: '집들이', desc: '집에 관한 이야기를 글로 작성해보세요.', icon: `${ASSET}AssetMagnifyingGlassHouseSmallGenuineBlue/magnifying-glass-house-small-genuine-blue.svg` },
  { title: '노하우', desc: '다양한 인테리어 노하우를 공유해주세요.', icon: `${ASSET}AssetEllipsisBubbleSmallJadeGreen/ellipsis-bubble-small-jade-green.svg` },
  { title: '리뷰', desc: '상품 리뷰를 작성하고 포인트도 받아보세요.', icon: `${ASSET}AssetStarSmallMangoOrange/star-small-mango-orange.svg` },
  { title: '인테리어시공 리뷰', desc: '시공 리뷰를 작성하고 포인트도 받아보세요.', icon: `${ASSET}AssetStarHouseSmallDarkBlue/star-house-small-dark-blue.svg` },
]

export const HOT_KEYWORDS: { rank: number; text: string; isNew?: boolean; up?: boolean }[] = [
  { rank: 1, text: '땡스소윤', isNew: true },
  { rank: 2, text: '약정리함', isNew: true },
  { rank: 3, text: '반타원테이블', up: true },
  { rank: 4, text: '바이너리샵', up: true },
  { rank: 5, text: '다이슨 거치대', isNew: true },
  { rank: 6, text: '템바보드수납장', isNew: true },
  { rank: 7, text: '잭슨카멜레온', isNew: true },
  { rank: 8, text: '트롤리이동식', isNew: true },
  { rank: 9, text: '무선 청소기', isNew: true },
  { rank: 10, text: '침대 틈새 선반', isNew: true },
]

export const BREADCRUMB = ['가구', '서랍·수납장', '서랍장']

export const GALLERY = [
  `${PRS}commerce/shop-images/471941/v1-552257305858112.jpg`,
  `${IMG}uploads/openapi/471941/1779088283698.jpg`,
  `${IMG}uploads/openapi/471941/1779088284102.jpg`,
  `${IMG}uploads/openapi/471941/1779088284475.jpg`,
  `${IMG}uploads/openapi/471941/1779088284860.jpg`,
  `${IMG}uploads/openapi/471941/1779088285352.jpg`,
  `${IMG}uploads/openapi/471941/1779088285775.jpg`,
  `${IMG}uploads/openapi/471941/1779088286180.jpg`,
]

export const galleryUrl = (src: string, size: number) => `${src}?w=${size}&h=${size}&c=c`

export const ICONS = {
  logo: 'https://asset.ohousecdn.com/static/AssetOhouseHorizontal/ohouse-horizontal.svg',
  packagePromo: `${PRS}any/glinda/v1-434788675715200.svg?w=72&h=72&c=c`,
  brandLogo: `${PRS}commerce/uploads/brands/brand_images/v1-358769371959360.svg?w=72&h=72&c=c`,
  percentCube: 'https://asset.ohousecdn.com/static/AssetPercentCubeSmallCandyPink/percent-cube-small-candy-pink.svg',
  promoBanner: `${PRS}any/uploads/store-feed/pdp-promotion-banner/v1-552329413042176.png?w=960`,
  couponBadge: `${IMG}static/productions/goods-coupon-badge.png?w=72&h=32`,
  cardBadge: `${IMG}static/productions/card-promotion-badge.png?w=72&h=32`,
  avatar: `${IMG}uploads/default_images/avatar.png?w=144&h=144&c=c`,
  sparkles: 'https://asset.ohousecdn.com/static/AssetSparklesSmall/sparkles-small.svg',
}

export const BENEFITS = {
  point: { amount: '54P', note: 'WELCOME 0.1% 적립' },
  pay: '최대 8% 결제할인 (토스)',
  installment: '월 8,984원 (6개월) 무이자할부',
}

export const DELIVERY = {
  fee: '무료배송',
  method: '일반택배',
  notes: ['제주도/도서산간 지역 배송 불가', '설치비 별도 (설치 환경·옵션에 따라 다름)'],
  arrive: '10/16(금)',
}

export const ASSEMBLY = {
  title: '조립/설치신청',
  price: '(개당 조립/설치비 29,000원)',
  note: '서울/인근 경기지역/충청도 일부지역에 한함',
}

export const STYLING_SHOTS = [
  { user: 'ynnmi', src: 'https://image.ohousecdn.com/video-service-prd-s3-bucket-thumbnail/6148146626e55c13ef856ad7/6148146626e55c13ef856ad7.0000001.jpg?w=960&h=960&', video: '00:05' },
  { user: '도_윤수', src: `${IMG}uploads/cards/snapshots/160018575362994985.jpeg?w=960&h=960&c=c` },
  { user: '910201', src: `${IMG}uploads/cards/snapshots/161630668153817608.jpeg?w=960&h=960&c=c` },
  { user: '제이영페이지', src: `${IMG}uploads/cards/projects/163419341451482005.jpg?w=960&h=960&c=c` },
  { user: 'sala_meigo', src: `${IMG}uploads/cards/snapshots/161309056210457531.jpeg?w=960&h=960&c=c` },
  { user: 'nxxgxxl', src: `${IMG}uploads/cards/snapshots/161570673193521281.jpeg?w=960&h=960&c=c` },
  { user: 'traveler_zip', src: `${IMG}uploads/cards/snapshots/164238752260665880.jpeg?w=960&h=960&c=c` },
  { user: 'Tuvvys.room', src: `${PRS}content/community/v1-445190078320768.jpg?w=960&h=960&c=c` },
]

export type ProductCard = {
  id: string
  brand: string
  name: string
  discount: number
  price: string
  rating: string
  reviews: string
  image: string
  badgeImage?: string
  todayShip?: string
  specialPrice?: boolean
  ohouDelivery?: boolean
  tags: string[]
  coupon?: string
  pay?: string
}

const th = (path: string) => `${path}?w=360&q=50`
const MKB = (id: string) => th(`${IMG}uploads/openapi/471941/${id}.jpg`)

export const AD_PRODUCTS: ProductCard[] = [
  { id: '307308', brand: '마켓비', name: '피하 서랍장 2.2단', discount: 16, price: '56,600', rating: '4.5', reviews: '5,184', image: MKB('1779088287766'), tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '307305', brand: '마켓비', name: '피하 서랍장 5단', discount: 16, price: '58,900', rating: '4.5', reviews: '9,820', image: MKB('1779088274622'), tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '307300', brand: '마켓비', name: '피하 서랍장 6단', discount: 16, price: '58,300', rating: '4.5', reviews: '3,015', image: MKB('1779088270153'), todayShip: '평일 13:00까지 결제시', tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '1095901', brand: '마켓비', name: '피하 낮은서랍장 2.1단', discount: 16, price: '45,300', rating: '4.6', reviews: '1,014', image: MKB('1779088315549'), tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '2129851', brand: '마켓비', name: '피하 높은6단 선반서랍장', discount: 16, price: '91,900', rating: '4.5', reviews: '132', image: MKB('1779088305946'), tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '1952828', brand: '마켓비', name: '피하 낮은서랍장 4단', discount: 16, price: '47,600', rating: '4.7', reviews: '423', image: MKB('1779088310768'), tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '3124062', brand: '에이비퍼니쳐', name: '피트 미드센츄리 빈티지 캐비넷 서랍장 수납장 2단 3단 4단 5단 9colors', discount: 56, price: '39,900', rating: '4.8', reviews: '4,718', image: th(`${PRS}any/uploads/productions/v1-544856417648704.jpg`), badgeImage: `${IMG}uploads/admins/thumbnail_badges/177140383483572726.png?w=144`, tags: ['배송비 별도'], coupon: '최대 10% 쿠폰', pay: '최대 3% 결제할인' },
  { id: '4165306', brand: '송목가구', name: 'LPM 마일드 5단 서랍장 400 500 600 900', discount: 41, price: '69,900', rating: '4', reviews: '2', image: th(`${PRS}any/uploads/productions/v1-525011857391680.jpg`), tags: ['배송비 별도'] },
  { id: '3549948', brand: '레이아웃 스튜디오', name: '레이어 미드센츄리 모듈 철제 선반 수납장 서랍형 400/600/800/1000/1200', discount: 50, price: '78,000', rating: '4.8', reviews: '4,126', image: th(`${PRS}any/uploads/productions/v1-528877480714368.jpg`), tags: ['배송비 별도'], coupon: '최대 8% 쿠폰', pay: '최대 3% 결제할인' },
  { id: '199116', brand: '아이엘컴퍼니', name: '철제 4/5/6단 이동식 서랍장 5colors', discount: 39, price: '41,900', rating: '4.6', reviews: '1,250', image: th(`${PRS}any/uploads/productions/v1-266744630407232.png`), tags: ['배송비 별도'] },
  { id: '3781507', brand: '아이엔지홈', name: '카비 3단 와이드 서랍장 다용도 수납장 블랙', discount: 40, price: '299,000', rating: '4.9', reviews: '124', image: th(`${IMG}uploads/openapi/3886323/1760507832412.jpg`), tags: ['배송비 별도'] },
  { id: '3415601', brand: '에이비퍼니쳐', name: '더블 피트 미드센츄리 빈티지 캐비넷 수납장 서랍장 2단/3단/4단/5단 9colors', discount: 43, price: '99,900', rating: '4.8', reviews: '696', image: th(`${PRS}any/uploads/productions/v1-419878641643648.jpg`), tags: ['배송비 별도'], coupon: '최대 10% 쿠폰', pay: '최대 3% 결제할인' },
  { id: '307307', brand: '마켓비', name: '피하 서랍장 0.3단', discount: 16, price: '56,600', rating: '4.5', reviews: '1,249', image: MKB('1779088297158'), todayShip: '평일 13:00까지 결제시', tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '950641', brand: '마켓비', name: 'MKB 서랍장 2.2단', discount: 16, price: '65,900', rating: '4.2', reviews: '17', image: th(`${PRS}any/uploads/productions/v1-226703077331008.jpg`), todayShip: '평일 13:00까지 결제시', tags: ['무료배송', '설치비 별도'], coupon: '최대 18% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '3071589', brand: '마켓비', name: '심플리 이동식 서랍장 1칸 BC605', discount: 16, price: '134,000', rating: '5', reviews: '6', image: th(`${PRS}any/uploads/productions/v1-335979607007232.jpg`), todayShip: '평일 12:00까지 결제시', tags: ['무료배송', '설치비 별도'], coupon: '최대 16% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '4217685', brand: '골든스트릿', name: '모듈 맥시멈 E0 미드센츄리 1200 속깊은1 / 2 / 3 / 4단 와이드 대형 빅서랍장', discount: 28, price: '99,000', rating: '5', reviews: '26', image: th(`${PRS}any/uploads/productions/v1-546376035967104.jpg`), tags: ['배송비 별도'], coupon: '최대 5천원 쿠폰' },
  { id: '3594562', brand: '베스트리빙', name: 'LG정품 원료 인증! 모토 레트로 빈티지 캐비닛 서랍장 수납장 더블 2단/3단/4단', discount: 56, price: '99,900', rating: '4.8', reviews: '545', image: th(`${PRS}any/uploads/productions/v1-393408639967296.jpg`), tags: ['배송비 별도'], coupon: '최대 15% 쿠폰', pay: '최대 3% 결제할인' },
  { id: '4088851', brand: '해피리빙', name: '로아 고급도장 400 속깊은 3단/4단/5단 틈새 서랍장', discount: 43, price: '159,000', rating: '4.4', reviews: '16', image: th(`${PRS}any/uploads/productions/v1-505171292856384.jpg`), tags: ['배송비 별도'], coupon: '최대 5천원 쿠폰' },
  { id: '1270375', brand: '힘찬리빙', name: '루크 400 4단 서랍장', discount: 37, price: '53,800', rating: '4.5', reviews: '252', image: th(`${IMG}uploads/productions/164853059947963268.jpg`), tags: ['배송비 별도'], coupon: '최대 3% 쿠폰' },
  { id: '950643', brand: '마켓비', name: 'MKB 서랍장 6단', discount: 16, price: '65,900', rating: '4.8', reviews: '14', image: th(`${PRS}any/uploads/productions/v1-226704773075072.jpg`), todayShip: '평일 12:00까지 결제시', tags: ['무료배송', '설치비 별도'], coupon: '최대 18% 쿠폰', pay: '최대 8% 결제할인' },
]

export const SUGGESTED_PRODUCTS: ProductCard[] = [
  { id: '1096010', brand: '오늘의집 layer', name: 'basic / 바른 3단 와이드 서랍장, 400/800/1200/2000', discount: 40, price: '89,900', rating: '4.7', reviews: '7,980', image: th(`${PRS}any/uploads/productions/v1-532850625695808.jpg`), badgeImage: `${IMG}uploads/admins/thumbnail_badges/177158985348246766.png?w=144`, specialPrice: true, ohouDelivery: true, tags: ['무료배송'], coupon: '최대 7% 쿠폰' },
  { id: '2541179', brand: '유에라가구', name: '캐슬 하이그로시 1200 와이드 수납 4단 서랍장 E0', discount: 18, price: '179,000', rating: '4.8', reviews: '1,073', image: th(`${PRS}any/uploads/productions/v1-198448279363712.jpg`), tags: ['배송비 별도'] },
  { id: '13097', brand: '마켓비', name: 'MKB 캐비넷 모던세로중 2문 수납장 8001015', discount: 16, price: '149,000', rating: '4.5', reviews: '1,799', image: th(`${PRS}any/uploads/productions/v1-227836073648128.jpg`), tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '13150', brand: '마켓비', name: 'OLLSON 책상', discount: 16, price: '52,000', rating: '4.5', reviews: '8,910', image: th(`${PRS}any/uploads/productions/v1-234398668505152.jpg`), tags: ['무료배송', '설치비 별도'], coupon: '최대 12% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '1743887', brand: '플랜데코', name: '베토화이트 협탁 침대 옆 4단 서랍장', discount: 50, price: '59,000', rating: '4.6', reviews: '123', image: th(`${IMG}uploads/openapi/5861129/1670826657461.jpg`), tags: ['배송비 별도'], coupon: '최대 11% 쿠폰' },
  { id: '2399631', brand: '스칸디무드', name: '클레르 미드센츄리 3단 와이드 서랍장 1800', discount: 65, price: '379,000', rating: '4.7', reviews: '498', image: th(`${IMG}uploads/productions/169761698170872457.jpg`), tags: ['배송비 별도'], coupon: '최대 5% 쿠폰', pay: '최대 3% 결제할인' },
  { id: '1719053', brand: '이케아', name: 'LENNART 렌나르트 서랍유닛/철제서랍/3단 서랍(1+1)', discount: 18, price: '65,000', rating: '4.3', reviews: '21', image: th(`${IMG}uploads/productions/166960398032777145.jpg`), todayShip: '평일 14시까지 결제시', tags: ['배송비 별도'] },
  { id: '922183', brand: '마켓비', name: '빙그리 회전서랍 트롤리 5단', discount: 19, price: '75,900', rating: '4.6', reviews: '1,053', image: th(`${PRS}any/uploads/productions/v1-234563529420864.jpg`), todayShip: '평일 15시까지 결제시', tags: ['무료배송'], coupon: '최대 18% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '2602319', brand: '인터데코', name: '철제서랍장 케비넷서랍 (4단) MK20889', discount: 30, price: '74,900', rating: '4', reviews: '1', image: th(`${IMG}uploads/openapi/4455875/1707801189265.jpg`), tags: ['무료배송'], coupon: '최대 3% 쿠폰' },
  { id: '502181', brand: '유에라가구', name: '캐슬 하이그로시 1200 와이드 수납 3단 서랍장 E0', discount: 22, price: '139,000', rating: '4.8', reviews: '3,088', image: th(`${IMG}uploads/productions/168311773682588925.jpg`), tags: ['배송비 별도'], coupon: '최대 11% 쿠폰' },
  { id: '588786', brand: '마켓비', name: 'OFFICY 서랍장 5단', discount: 16, price: '57,600', rating: '4.6', reviews: '45', image: th(`${PRS}any/uploads/productions/v1-226676890128448.jpg`), todayShip: '평일 13시까지 결제시', tags: ['무료배송', '설치비 별도'], coupon: '최대 12% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '460765', brand: '포더홈', name: '[오늘의집 단독] 플레인 E0 높은 수납장 1200 4colors', discount: 55, price: '119,900', rating: '4.6', reviews: '4,995', image: th(`${IMG}uploads/productions/167714298395978035.jpg`), badgeImage: `${IMG}uploads/admins/thumbnail_badges/177180627449616636.png?w=144`, specialPrice: true, tags: ['배송비 별도'], coupon: '최대 15% 쿠폰', pay: '최대 5% 결제할인' },
  { id: '2038327', brand: '마켓비', name: '피하 서랍 2단', discount: 16, price: '44,600', rating: '4.3', reviews: '74', image: MKB('1779088301610'), todayShip: '평일 13시까지 결제시', tags: ['무료배송', '설치비 별도'], coupon: '최대 14% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '409599', brand: '가구느낌', name: '철제3단서랍장 수납장', discount: 28, price: '35,900', rating: '4.5', reviews: '861', image: th(`${IMG}uploads/productions/159479013632430049.jpg`), tags: ['배송비 별도'] },
  { id: '10914', brand: '마켓비', name: '브루그 스탠드행거 KS1002/LDR', discount: 16, price: '17,900', rating: '4.6', reviews: '15,134', image: th(`${PRS}any/uploads/productions/v1-226725038256192.jpg`), tags: ['무료배송', '설치비 별도'], coupon: '최대 12% 쿠폰', pay: '최대 8% 결제할인' },
  { id: '2397719', brand: '유에라가구', name: '캐슬 800 하이그로시 4단 서랍장 E0', discount: 18, price: '129,000', rating: '4.8', reviews: '661', image: th(`${IMG}uploads/productions/169579074771488812.jpg`), tags: ['배송비 별도'] },
]

export const DETAIL_NOTICES = [
  { alt: '판매자 공지 1', src: `${PRS}commerce/uploads/admins/productions/notice/v1-355512656412736.png?w=1440`, w: 692, h: 301 },
  { alt: '판매자 공지 2', src: `${PRS}any/uploads/seller/notice_images/v1-488188987387968.jpg?w=1440`, w: 692, h: 304 },
]

// 상세 이미지: 원본 페이지에서 표시되는 크기(가로 x 세로)를 미리 적어 두어, 불러오는 동안 레이아웃이 흔들리지 않게 한다.
export const DETAIL_IMAGES = [
  { src: 'https://marketb.kr/web/product/steel_top_img.jpg', w: 692, h: 316 },
  { src: 'https://marketb.kr/web/product/fiha_4_all.jpg', w: 692, h: 14801 },
  { src: 'https://marketb.kr/web/product/fiha_4_all_02.jpg', w: 692, h: 11633 },
  { src: 'https://marketb.kr/web/product/fiha_41_info.jpg', w: 650, h: 1644 },
  { src: 'https://marketb.kr/web/product/fiha_tip.jpg', w: 692, h: 3697 },
  { src: 'https://marketb.kr/web/product/fiha_dishome.jpg', w: 692, h: 1661 },
  { src: 'https://marketb.openhost.cafe24.com/web/img/20121212_customer_foot_01.jpg', w: 692, h: 4353 },
]

export const SPEC_ROWS: [string, string][] = [
  ['품명', '마켓비 FIHA 서랍장 4.1단'],
  ['KC 인증정보', '해당사항 없음'],
  ['색상', '상세페이지 참고'],
  ['구성품', '상세페이지 참고'],
  ['주요 소재', '상세페이지 참고'],
  ['제조자, 수입품의 경우 수입자를 함께 표기', '상세페이지 참고'],
  ['제조국', '상세페이지 참고'],
  ['크기', '상세페이지 참고'],
  ['재공급(리퍼브) 가구의 경우 재공급 사유 및 하자 부위에 관한 정보', '해당사항 없음'],
  ['배송ㆍ설치비용', '도서산간비별도, DIY제품, 교환반품시 왕복배송비 개당 부과 (단, 상품 하자로 인한 반품/교환 시 제외)'],
  ['품질보증기준', '관련법 및 소비자 분쟁 해결 규정에 따름'],
  ['A/S 책임자와 전화번호', '마켓비 031-943-8307'],
]

export const REVIEW_STATS = {
  average: '4.5',
  total: '15,236',
  bars: [
    { score: 5, count: '10,609', width: 125 },
    { score: 4, count: '3,551', width: 42 },
    { score: 3, count: '798', width: 9 },
    { score: 2, count: '124', width: 1 },
    { score: 1, count: '154', width: 2 },
  ],
}

export const REVIEW_KEYWORDS = [
  { label: '조립', count: '999+' },
  { label: '디자인', count: '999+' },
  { label: '수납력', count: '939' },
  { label: '가성비', count: '613' },
  { label: '내구성', count: '577' },
  { label: '사이즈', count: '317' },
  { label: '색깔', count: '260' },
  { label: '작동감', count: '91' },
]

export type Review = {
  user: string
  avatar: string
  rating: number
  date: string
  option: string
  image: string
  text: string
  helpful?: number
}

const PROFILE = `${IMG}uploads/users/profile_images/`

export const REVIEWS: Review[] = [
  {
    user: '=>',
    avatar: ICONS.avatar,
    rating: 4,
    date: '2026.08.21',
    option: '화이트 2981.3310',
    image: `${PRS}content/community/v1-535287634321408.jpg?w=288&h=288&c=c`,
    helpful: 12,
    text: `⭐️구매후 조립하시기전에 꼭보시길 바랍니다!!⭐️

일단 첫 조립시작하시면 칸마다 레일같은 부위를 끼우게되는데 이때 그냥 잘 안끼워지네 하고 막 대충 끼워넣지마시고 꼭 끝까지 다 끼워 들어갔는지 확인하세요!! 저 두번째 사진처럼 저정도 틈이라도 있으면 나중에 완성했을때 서랍장이 좀 삐뚤빼뚤해보여요 ㅜ 저도 첨에 조립 다하고 너무 엉성하고 삐뚤해서 자세히보니까 서랍장 두칸정도가 레일이 완벽하게 안 끼워져서 그렇더라고요 그래서 서랍빼고 다시 끼우느라 고생했습니다ㅜㅜ 나중에 다시 끼울려면 힘들어요..!!

처음 끼워지는 조립 홈?에 작은 쪽도 완전히 끼워서 조립하시면 첫번째사진처럼 나름 정렬되어보입니다 완벽하게 90도로 끼울수록 좀더 정렬되는거같아요 그럼 꼭 이쁘게 완성하시길…

그외에 좀 자잘한 흠집이나 철판 꾸겨짐이 있어서 별하나뺐습니다! 나머지는 다 만족스러워요`,
  },
  {
    user: 'chanm222',
    avatar: ICONS.avatar,
    rating: 5,
    date: '2026.09.16',
    option: '화이트',
    image: `${PRS}content/uploads/cards/snapshots/v1-544474395131968.webp?w=288&h=288&c=c`,
    helpful: 2,
    text: '방에 수납할 공간이 하나도 없어서 주문했어요ㅎ 책상 앞에 두고 쓰고 있는데 완전 만족! 좀 조잡해보이면 어쩌지 했는데 조립하고 보니까 괜찮네요.',
  },
  {
    user: '로즈쉽',
    avatar: `${PROFILE}1731924047_naver_3129c9dfad815ce2b5fdca52b2081d9388194206dd3d809cf86b36dde05c5e73.jpg?w=144&h=144&c=c`,
    rating: 5,
    date: '2026.10.12',
    option: '옐로우 3002.7435',
    image: `${PRS}content/community/v1-553499576737856.jpg?w=288&h=288&c=c`,
    text: `핑크랑 옐로우 사서 서랍교체해봤어요
철판이다보니 좀 시끄럽긴하네요
배송은 핑크가 먼저오고 옐로우가 하루 늦게 왔는데 옐로우 상태가 훨씬 좋아요. 핑크는 재고로 쌓여있다 온거마냥 찌그러지고 먼지도 많은데 옐로우는 깔끔하게 왔어요. 아예 제조 공장이 다른건지 모르겠지만 배송출발지가 다르네요. 그래서 옐로우가 더 비싼가,,

조립하느라 손이 좀 아프긴했지만 어렵진 않아요. 후기에 바퀴조립 힘들다고 되어있길래 전동드릴 샀는데 전 걍 큰드라이버로 하니까 잘 들어가더라구요`,
  },
  {
    user: '로즈쉽',
    avatar: `${PROFILE}1731924047_naver_3129c9dfad815ce2b5fdca52b2081d9388194206dd3d809cf86b36dde05c5e73.jpg?w=144&h=144&c=c`,
    rating: 4,
    date: '2026.10.12',
    option: '핑크 6562.0674',
    image: `${PRS}content/community/v1-553500642885632.jpg?w=288&h=288&c=c`,
    text: `핑크랑 옐로우 사서 서랍교체해봤어요
철판이다보니 좀 시끄럽긴하네요
배송은 핑크가 먼저오고 옐로우가 하루 늦게 왔는데 옐로우 상태가 훨씬 좋아요. 핑크는 재고로 쌓여있다 온거마냥 찌그러지고 먼지가 많아요.(사진 상판 앞뒤 찌그러짐 참고)

조립하느라 손이 좀 아프긴했지만 어렵진 않아요. 후기에 바퀴조립 힘들다고 되어있길래 전동드릴 샀는데 전 걍 큰드라이버로 하니까 잘 들어가더라구요`,
  },
  {
    user: 'ehdgus603',
    avatar: `${PROFILE}160413083203348474.jpeg?w=144&h=144&c=c`,
    rating: 5,
    date: '2026.10.11',
    option: '화이트 2981.3310',
    image: `${PRS}content/community/v1-553461908881408.jpg?w=288&h=288&c=c`,
    text: '처음에 조립전에 너무 얇아서 이게 서랍장의 역할이 가능할까 의심스러웠고 심지어 얇을 철제를 접어서 사용하는것에 충격받았으나 아이들 물품 보관정도로 가벼운 물건 사용할거 같으면 충분하다는 느낌입니다. 사실 다른 제품을 원했지만 아이들이 이 디자인과 색상을 원해서 구매하게 되었습니다.',
  },
]

export type Qna = { tags: string; author: string; option?: string; question: string; answerDate: string; answer: string; asked: string }

export const QNAS: Qna[] = [
  {
    tags: '구매 | 배송 |',
    author: '이아**',
    asked: '2026년 10월 08일 17시 24분',
    option: '화이트 2981.3310',
    question: '언제쯤올까요?',
    answerDate: '2026년 10월 08일 17시 31분',
    answer: `배송 관련 추가 문의 사항은 아래 자사 배송 문의 게시판에 주문 내역과 문의 내용 기재 후 재 접수 안내 드립니다.
아래 URL 복사 후 주소창에 붙여 넣기 하셔도 됩니다.
불편 드려 죄송합니다.

* 마켓비 공식홈페이지 → 우측 상단 고객지원 클릭 → 배송문의 게시판
* 링크
https://marketb.kr/board/list.html?board_no=101&cafe_mkt=ue_sob`,
  },
  {
    tags: '비구매 | 상품 |',
    author: '데미*',
    asked: '2026년 10월 02일 10시 48분',
    option: '라이트그레이 2290.7930',
    question: '상단 네꼭지점 모서리가 어떤가요? 날카로운편인가요?',
    answerDate: '2026년 10월 02일 11시 58분',
    answer: '날카롭지는 않지만, 주의해 사용해주셔야합니다.',
  },
  {
    tags: '비구매 | 상품 |',
    author: 'hye***',
    asked: '2026년 09월 29일 08시 54분',
    question: `allson 책상하고 같이 구매 예정인데요
두 제품 모두 조립을 원하는데, 각각 비용 지불해야하나요?`,
    answerDate: '2026년 09월 29일 09시 23분',
    answer: '설치비는 각각 결제하셔야합니다.',
  },
  {
    tags: '비구매 | 상품 |',
    author: '이아**',
    asked: '2026년 09월 28일 22시 26분',
    option: '화이트 2981.3310',
    question: `2개조립서비스받고싶어요.
화성시입니다.
가격이어찌될지요?`,
    answerDate: '2026년 09월 29일 08시 40분',
    answer: '제품 상세페이지 하단 내 가격 안내되어 있으며, 각각 조립서비스 비용 추가 결제하셔야합니다.',
  },
  {
    tags: '비구매 | 상품 |',
    author: '_건**',
    asked: '2026년 09월 12일 16시 30분',
    option: '화이트 2981.3310',
    question: '손잡이 별도 구매 가능한가요?',
    answerDate: '2026년 09월 13일 15시 16분',
    answer: `안녕하세요 마켓비입니다.
요청 주신 4.1단 손잡이 5개(고정 나사 10개 포함) 부품은 기본 배송비(5,500원) 포함 13,750 원에 구매 가능하십니다.
아래 안내 드린 계좌로 입금하신 후 입금일자, 입금자분 성함, 수령처 정보(주소, 연락처, 수령자분 성함)와 현금 영수증 등록 가능한 자료를 신규 게시글로
남겨 주시면 담당 부서 전달해 부품 준비 후 발송 진행될 수 있도록 하겠습니다.
감사합니다.
* 우리1005-001-490651 / 마켓비 / 13,750원`,
  },
]

export const DELIVERY_ROWS: [string, string][] = [
  ['배송', '일반택배'],
  ['배송비', '무료배송'],
  ['배송불가 지역', '도서산간 지역 / 제주도'],
]

export const REFUND_ROWS: [string, string][] = [
  ['반품배송비', '5,000원 (최초 배송비가 무료인 경우 10,000원 부과)'],
  ['교환배송비', '10,000원'],
  ['보내실 곳', '(217) 경기 파주시 파주읍 정문로 726 (부곡리)  (주)마켓비'],
]

export const REFUND_PERIOD = {
  title: '반품/교환 사유에 따른 요청 가능 기간',
  note: '반품 시 먼저 판매자와 연락하셔서 반품사유, 택배사, 배송비, 반품지 주소 등을 협의하신 후 반품상품을 발송해 주시기 바랍니다.',
  items: [
    { text: '구매자 단순 변심은 상품 수령 후 7일 이내', small: '(구매자 반품배송비 부담)' },
    { text: '표시/광고와 상이, 계약내용과 다르게 이행된 경우 상품 수령 후 3개월 이내, 그 사실을 안 날 또는 알 수 있었던 날로부터 30일 이내.', small: '(판매자 반품배송비 부담)', br: true },
  ],
  tail: '둘 중 하나 경과 시 반품/교환 불가',
}

export const REFUND_BLOCKED = {
  title: '반품/교환 불가능 사유',
  note: '아래와 같은 경우 반품/교환이 불가능합니다.',
  items: [
    { text: '반품요청기간이 지난 경우' },
    { text: '구매자의 책임 있는 사유로 상품 등이 멸실 또는 훼손된 경우', small: '(단, 상품의 내용을 확인하기 위하여 포장 등을 훼손한 경우는 제외)' },
    { text: '포장을 개봉하였으나 포장이 훼손되어 상품가치가 현저히 상실된 경우', small: '(예: 식품, 화장품)' },
    { text: '구매자의 사용 또는 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우', small: '(라벨이 떨어진 의류 또는 태그가 떨어진 명품관 상품인 경우)' },
    { text: '시간의 경과에 의하여 재판매가 곤란할 정도로 상품 등의 가치가 현저히 감소한 경우', small: '(예: 식품, 화장품)' },
    { text: '고객주문 확인 후 상품제작에 들어가는 주문제작상품' },
    { text: '복제가 가능한 상품 등의 포장을 훼손한 경우', small: '(CD/DVD/GAME/도서의 경우 포장 개봉 시)' },
  ],
}

export const SELLER_ROWS: [string, string][] = [
  ['상호', '주식회사 마켓비'],
  ['대표자', '남지희'],
  ['사업장소재지', '경기 파주시 파주읍 정문로 726 마켓비'],
  ['고객센터 전화번호', '031-943-8307'],
  ['E-mail', 'marketb@naver.com'],
  ['사업자 등록번호', '141-81-15759'],
  ['통신판매업 신고번호', '2009-경기파주-1943'],
]

export const FOOTER = {
  support: [
    { title: '1:1 문의', sub: '24시간 접수 · 평일 09:00-18:00 답변' },
    { title: '채팅 상담', sub: '평일 09:00-18:00' },
    { title: '1670-0876', sub: '평일 09:00-18:00 · 일요일 : 휴무\n토·공휴일 : 원하는날도착 주문건 상담' },
  ],
  links: [
    ['회사소개', false],
    ['채용정보', false],
    ['이용약관', false],
    ['개인정보 처리방침', true],
    ['공지사항', false],
    ['권리보호센터', false],
    ['입점신청', false],
    ['제휴/광고 문의', false],
    ['시공파트너 안내', false],
    ['파트너 개인정보 처리방침', true],
    ['상품광고 소개', false],
  ] as [string, boolean][],
  marks: [
    'https://assets.ohou.se/design-system/8f5b2c2e98ea1196.png',
    'https://assets.ohou.se/design-system/d5fb816a58bb6a06.png',
    'https://assets.ohou.se/design-system/ad1cf869a6c58058.png',
  ],
  disclaimer:
    '(주)버킷플레이스는 통신판매중개자로 거래 당사자가 아니므로, 판매자가 등록한 상품정보 및 거래 등에 대해 책임을 지지 않습니다. 단, (주)버킷플레이스가 판매자로 등록 판매한 상품은 판매자로서 책임을 부담합니다.',
}
