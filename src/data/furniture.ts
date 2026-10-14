import raw from '@/data/archisketch-furniture.json'
import type { ItemModel } from '@/lib/types'

// Archisketch 에서 내보낸 가구 목록(docs/archisketch-furniture-items.md 와 같은 내용).
// 이미지는 componentId 로 짝지어 public/archisketch/{componentId}.png 에 받아 두었다.
export type Furniture = {
  id: string
  name: string
  brand: string | null
  quantity: number
  price: number
  size: { w: number; d: number; h: number }
  placed: boolean
  image: string
}

// 원본 데이터에 치수가 없는(전부 0) 가구는 모양으로 추정한 치수를 쓴다. 단위 mm.
const ESTIMATED_SIZE: Record<string, { w: number; d: number; h: number }> = {
  YjCJHDA8B714D95FB9D45DD: { w: 120, d: 480, h: 400 }, // 싱글 모니터암(클램프 폭, 팔 뻗은 길이, 기둥+팔 높이)
}

export const FURNITURE: Furniture[] = raw.furnitureItems.map((item) => ({
  id: item.componentId,
  name: item.name,
  brand: item.brand,
  quantity: item.quantity,
  price: item.retailPrice.value,
  size: item.dimensionMm.width > 0 ? { w: item.dimensionMm.width, d: item.dimensionMm.depth, h: item.dimensionMm.height } : (ESTIMATED_SIZE[item.componentId] ?? { w: 0, d: 0, h: 0 }),
  placed: item.roomId !== '',
  image: `/archisketch/${item.componentId}.png`,
}))

// 데모 배치에서 뺀 가구. 데모의 "전체 가구" 목록에서도 보이지 않게 한다(가구 목록 `#/furniture` 와 모델 미리보기는 그대로).
// 아르덴 미러는 배치에 하나가 남아 있어서 여기에 넣지 않았다.
const DEMO_EXCLUDED = new Set([
  'XtdxyE493CC22D0979C4F07', // DSTL Diffuser + Sticks
  'YV_XVxZ6AA659D9487F417E', // chardonnay wine
  'YV_XVxa64C03905B0F34865', // 2 wine glasses
  'Ylybxgt16DA8B0918B94B21', // PARENTESI
  'YgDgtY8090165E920A148CE', // Audiorama 4000
  'Xr78id08D1C38D7AD0D4D47', // LED 면조명
  'Xr1ry-I72F798A8F6CB4CAD', // ODDRUN
])
export const DEMO_FURNITURE = FURNITURE.filter((f) => !DEMO_EXCLUDED.has(f.id))

export const FURNITURE_PROJECT = raw.projectName

export type FurnitureCategory = '가구' | '소품' | '벽·천장'

// 데이터에 분류가 없어서 직접 나눴다. 벽에 걸거나 천장·창문·문에 붙는 것은 벽·천장, 옷과 작은 물건은 소품이다.
const WALL_OR_CEILING = new Set([
  'X8kL5fT81A10556FC5447E5', // Illusion 01 (액자)
  'XW_VtxtA8DF6CDA88104092', // Ideal living (액자)
  'ZLDAeRK53BFEDFD0CF2475A', // 아르덴 미러
  'YneAfk7A250635ACE594C54', // perforated board
  'ZGXmJUk293C2AE613ED4B4B', // 삼성 QLED 벽걸이
  'YPGPhJp77841A682B5A4CD2', // Front door
  'E976B33E1388415C', // JELD WEN Windows
  'E1632324621148B0', // 우드 블라인드
  'Xr78id08D1C38D7AD0D4D47', // LED 면조명
])
const CLOTHES = new Set(['YV8EVEF2D36EE1DB1D44CAB', 'XX-zmmq45F1867DE7EE462B', 'ZFFQHal586565A1F38B473C'])

export const hasSize = (f: Furniture) => f.size.w > 0 && f.size.d > 0 && f.size.h > 0

export const categoryOf = (f: Furniture): FurnitureCategory => {
  if (WALL_OR_CEILING.has(f.id)) return '벽·천장'
  if (CLOTHES.has(f.id) || Math.max(f.size.w, f.size.d, f.size.h) < 600) return '소품'
  return '가구'
}

// 이미지를 보고 코드로 모양을 만든 가구. 여기에 없는 가구는 치수 그대로의 상자(box)로 보인다.
// elevation 은 벽에 거는 높이(mm). 없으면 바닥에 놓인다.
export const MODEL_BY_FURNITURE: Record<string, { model: ItemModel; elevation?: number }> = {
  YSEBSV826EADFB11D0F4FDD: { model: 'roundtable' }, // W1000 원형테이블
  Xs_Qb6C3D61BBB72B9B4159: { model: 'bedset' }, // D2178B 슈퍼싱글 침대(블랙) + Villette Blue 침구(위에 덮임)
  'ZHCng6-9DA238A1CE5340E1': { model: 'steelshelf' }, // H1740 5단 철제선반장
  YneAfk7A250635ACE594C54: { model: 'pegboard', elevation: 1100 }, // perforated board
  ZLDAeRK53BFEDFD0CF2475A: { model: 'mirror', elevation: 900 }, // 아르덴 미러
  E1632324621148B0: { model: 'blind', elevation: 240 }, // PREMIUM 우드 블라인드(2281mm, 천장 쪽에 맞춤)
  YBp1W4_021584BC9C234BDF: { model: 'fksofa' }, // FK6720 2인 소파(블랙)
  '83470177e6504b21bad9d2d15b6d5fba': { model: 'meshchair' }, // 데스커 GX_HDA 의자
  XNpyDGd4339E9DBCEE941AC: { model: 'diningchair' }, // Archisketch Dining Chair6
  YSZphlN2272C00BB9264030: { model: 'motiondesk' }, // W1600*D800 모션데스크
  ZCREWuP85D472F7745C4005: { model: 'chromecabinet' }, // SIMPLIE 수납장 BC264
  YHx4J5H2C427AA8FBFD482A: { model: 'corerack' }, // 코어렉(CORE RACK)
  YV_XVxTA1102E846ACA437E: { model: 'aralia' }, // Aralia Large
  Yq8D3hC589DB8DF6B7D4EC5: { model: 'tolomeo' }, // Tolomeo Mega Floor Lamp
  YSCLdDz3A9D4CDED05E451C: { model: 'drawerunit' }, // W400 3단 서랍
  ZGXmJUk293C2AE613ED4B4B: { model: 'walltv', elevation: 900 }, // 삼성 QLED 벽걸이 TV
  'XnPfj-S5D34B27A4E7B4B99': { model: 'stringpocket', elevation: 1000 }, // 스트링 포켓 (월넛/블랙)
  Ydpb3l75AC40FF808E14852: { model: 'bedding' }, // Villette Blue Bedding Set SS
  X8kL5fT81A10556FC5447E5: { model: 'picframe', elevation: 1300 }, // Illusion 01 IE - Writer Choi Yun-jeong (
  Yew1htX9938663D6F624933: { model: 'kidlamp', elevation: 1700 }, // UFO KID LAMP
  YqRULWb0F39B81582104692: { model: 'laptop' }, // [Sample] Pro 13-inch
  XRxqWHD79D04BB434D74AF9: { model: 'geneva' }, // [샘플] Geneva Model L (Black)
  XwSAxFf68C8240186EB4765: { model: 'clock' }, // Chronotime table clock
  YV_XVxZ6AA659D9487F417E: { model: 'winebottle' }, // chardonnay wine
  YV_XVxa64C03905B0F34865: { model: 'wineglasses' }, // 2 wine glasses
  Xs_QLXX29615894078C4CDF: { model: 'turntable' }, // 가방형 LP턴테이블 (블랙)
  YN8fSMr84BEC99AE48C4A26: { model: 'recordstack' }, // LP_3
  YeNvIsREA05481C46254539: { model: 'tissuecase' }, // Checkerboard tissue case
  XtdxyE493CC22D0979C4F07: { model: 'diffuser' }, // DSTL Diffuser + Sticks
  Xhjjsyp24F553380D414A9A: { model: 'bookrow' }, // Books 10 Set
  YVMPHUe388DE520FF74407B: { model: 'bookrow' }, // Book 2 set
  YgjU_Ah72C5B21C5B7F4F47: { model: 'ovaltray' }, // Oval round tray silver beads transparent
  XV5vpP7A568816FF2C2432F: { model: 'bird' }, // Eames House Bird (Black)
  XW_VtxtA8DF6CDA88104092: { model: 'poster', elevation: 1000 }, // Ideal living(Black Aluminum)
  YSBhD9T1E65915F80104295: { model: 'wallhanger' }, // (벽고정)W800 철제행거
  YV8EVEF2D36EE1DB1D44CAB: { model: 'shirt' }, // Dress Shirt
  'XX-zmmq45F1867DE7EE462B': { model: 'folded' }, // Clothes 2
  ZFFQHal586565A1F38B473C: { model: 'shoes' }, // shoes 01
  Ylybxgt16DA8B0918B94B21: { model: 'parentesi' }, // PARENTESI
  X5S4t1X5DE143AD22764FF9: { model: 'tweedrug' }, // LOOM+ Tweed Rug (round 1000mm, border ty
  'X-bB_LP883ADBC85E374EBB': { model: 'slidingcab' }, // CABINET WITH SLIDING DOORS W78 D30 BLACK
  YgDgtY8090165E920A148CE: { model: 'audiorama' }, // Audiorama 4000(Black)
  ZZHrOv2AC2EF05FF43243FB: { model: 'beatlight' }, // Beat Table Light (Black)
  YneAfk909E36FF912414229: { model: 'keyboard' }, // keyboard
  'YneAfk-85AC7705BADE4E4A': { model: 'mouse' }, // mouse
  'Ymz-AKZAAF5DF9BAB3E47A8': { model: 'fileholder' }, // NIMM File Holder
  Xo35PnA02CC15F5E5C44324: { model: 'openbook' }, // Open book (not for sale)
  YVMPHUZ0DEE6D5660DB48B2: { model: 'espresso' }, // espresso cup set
  YVMPHUe2B4ECE07C08E426B: { model: 'bookrow' }, // Book 12set
  'X-w77FkE525CF8C677A46B0': { model: 'unionbook' }, // Union #12-copied
  Y3Jvd_BD5EF2B210F564BF1: { model: 'bookdeco' }, // book deco
  'Ymz-AKVBAE7A1C5651944C3': { model: 'steelbox' }, // steel storage box
  Ym4zsLYED3C0331F08148F5: { model: 'supplies' }, // office supplies desk supplies
  '7564995DC96E40A3': { model: 'blackvase' }, // Black vase
  YdE3dZD86B1AD39B3C1443A: { model: 'bluevase' }, // 26 CM_blue
  Xr78id08D1C38D7AD0D4D47: { model: 'ledpanel', elevation: 2580 }, // LED 뉴플랜 면조명 방등 50W (주광색)
  Xw0ZynH039E7EE04F954257: { model: 'incense' }, // CALDERA incense holder
  XtdxyE4131F59D7EE0040B4: { model: 'dstl' }, // 4 Scents X Mini Room Spray
  YV_XVxW9536C02931594E10: { model: 'diptyque' }, // Diptyque
  'Xr1ry-I72F798A8F6CB4CAD': { model: 'oddrun' }, // ODDRUN (dark golden brown)
  XjOO_Xy13478D0D91CD493D: { model: 'cushion' }, // 프리미엄 리넨 쿠션 30cm x 50cm (카멜)
  YSJfCSW3C8249DE736F456A: { model: 'pcholder' }, // PC 홀더
  YneAflHA33DBE2534ED4DC7: { model: 'desktoppc' }, // desktop computer
  YvLiCvk04866276686B40C7: { model: 'dhurrie' }, // Erba Dhurrie Rug
  YPGPhJp77841A682B5A4CD2: { model: 'frontdoor' }, // Front door (1000)
  E976B33E1388415C: { model: 'window', elevation: 900 }, // JELD WEN Windows
  YjCJHDA8B714D95FB9D45DD: { model: 'monitorarm', elevation: 720 }, // 싱글 모니터암(책상 위 높이 720mm 에 얹음, 치수는 추정)
}

// 한 덩어리로 놓이는 가구. 키 가구를 고르면 값 가구의 크기·이미지·3D 모델로 놓인다(침구는 침대 위에 덮인 채 침대와 하나).
export const BUNDLE_OF: Record<string, string> = {
  Ydpb3l75AC40FF808E14852: 'Xs_Qb6C3D61BBB72B9B4159', // Villette Blue 침구 → D2178B 침대
}

// 침대와 합쳐진 침구를 가리키는 가구 id.
export const BUNDLED_INTO_BED = new Set(Object.keys(BUNDLE_OF))
export const BED_SET_SUFFIX = ' + 침구'
