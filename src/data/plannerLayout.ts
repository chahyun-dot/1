import { BED_SET_SUFFIX, FURNITURE, MODEL_BY_FURNITURE, categoryOf, type FurnitureCategory } from '@/data/furniture'
import type { Item, Rot, Room } from '@/lib/types'

// Archisketch 플래너 프로젝트의 3D 장면에서 읽은 배치(좌표 mm, 방 안쪽 왼쪽 위 모서리가 0,0).
// 방은 안쪽 4200×4200, 천장 2300. 문은 오른쪽 벽, 창은 왼쪽 벽과 아래(앞) 벽에 있다.
export const PLANNER_ROOM: Room = {
  w: 4200,
  d: 4200,
  h: 2300,
  doorWidth: 1000,
  openings: {
    door: { side: '+x', from: 2768, to: 3768, bottom: 0, top: 2300 },
    windows: [
      { side: '-x', from: 1100, to: 2008, bottom: 990, top: 2206 },
      { side: '-x', from: 2192, to: 3100, bottom: 990, top: 2206 },
      { side: '+z', from: 130, to: 1038, bottom: 990, top: 2206 },
      { side: '+z', from: 1222, to: 2130, bottom: 990, top: 2206 },
    ],
  },
}

// [가구 id, 가운데 x, 가운데 z, 각도(도), 가로, 깊이, 높이, 바닥에서 띄운 높이]
// 플래너의 Villette Blue 침구는 침대와 하나(`bedset` 모델)로 합쳐서 따로 두지 않는다.
type Row = [string, number, number, number, number, number, number, number]

const ROWS: Row[] = [
  ['Xs_Qb6C3D61BBB72B9B4159', 1145, 3600, 90, 1125, 2098, 1058, 0],  // D2178B. 뷰티레스트 스위트. 슈퍼싱글 침대 (
  ['YSEBSV826EADFB11D0F4FDD', 2698, 1639, -90, 1000, 1000, 739, 0],  // W1000 원형테이블
  ['YV_XVxTA1102E846ACA437E', 224, 2235, -90, 510, 517, 1500, 0],  // Aralia Large
  ['ZHCng6-9DA238A1CE5340E1', 1609, 190, 0, 800, 380, 1741, 0],  // H1740 5단 철제선반장(2단 도어)
  ['ZHCng6-9DA238A1CE5340E1', 2409, 190, 0, 800, 380, 1741, 0],  // H1740 5단 철제선반장(2단 도어)
  ['XnPfj-S5D34B27A4E7B4B99', 75, 567, 90, 600, 150, 500, 1058],  // 스트링 포켓 (월넛/블랙)
  ['X8kL5fT81A10556FC5447E5', 10, 3624, 90, 500, 20, 400, 1158],  // Illusion 01 IE - Writer Choi
  ['Yq8D3hC589DB8DF6B7D4EC5', 381, 519, 34, 361, 972, 2050, 0],  // Tolomeo Mega Floor Lamp
  ['Yew1htX9938663D6F624933', 4108, 2440, -90, 270, 183, 270, 1475],  // UFO KID LAMP
  ['YqRULWb0F39B81582104692', 376, 1043, 90, 312, 226, 222, 630],  // [Sample] Pro 13-inch
  ['XRxqWHD79D04BB434D74AF9', 989, 309, 0, 300, 286, 840, 0],  // [샘플] Geneva Model L (Black)
  ['XwSAxFf68C8240186EB4765', 64, 730, 90, 90, 103, 107, 1162],  // Chronotime table clock
  ['YneAfk7A250635ACE594C54', 625, 47, 0, 1000, 93, 491, 1056],  // perforated board
  ['Xs_QLXX29615894078C4CDF', 3665, 220, 0, 345, 419, 303, 698],  // 가방형 LP턴테이블 (블랙)
  ['YN8fSMr84BEC99AE48C4A26', 3988, 239, 0, 218, 302, 312, 700],  // LP_3
  ['YeNvIsREA05481C46254539', 3117, 239, 0, 238, 128, 212, 700],  // Checkerboard tissue case
  ['Xhjjsyp24F553380D414A9A', 3236, 232, 0, 385, 162, 250, 405],  // Books 10 Set
  ['YVMPHUe388DE520FF74407B', 3790, 230, 0, 574, 157, 250, 131],  // Book 2 set
  ['YgjU_Ah72C5B21C5B7F4F47', 3886, 223, 0, 300, 120, 142, 405],  // Oval round tray silver beads
  ['XV5vpP7A568816FF2C2432F', 3344, 232, 0, 168, 59, 200, 130],  // Eames House Bird (Black)
  ['XV5vpP7A568816FF2C2432F', 3142, 232, 180, 168, 59, 200, 130],  // Eames House Bird (Black)
  ['XW_VtxtA8DF6CDA88104092', 3224, 3, 0, 495, 10, 700, 999],  // Ideal living(Black Aluminum)
  ['YBp1W4_021584BC9C234BDF', 3678, 1402, -90, 1450, 810, 800, 0],  // FK6720 Sofa 2-seater (Black)
  ['ZLDAeRK53BFEDFD0CF2475A', 2977, 4185, 180, 395, 30, 590, 1048],  // 아르덴 미러_거울 (S)블랙
  ['X5S4t1X5DE143AD22764FF9', 2900, 3625, 0, 1000, 1000, 5, 0],  // LOOM+ Tweed Rug (round 1000m
  ['X-bB_LP883ADBC85E374EBB', 4050, 1029, -90, 780, 300, 420, 1382],  // CABINET WITH SLIDING DOORS W
  ['X-bB_LP883ADBC85E374EBB', 4050, 1775, -90, 780, 300, 420, 1382],  // CABINET WITH SLIDING DOORS W
  ['ZCREWuP85D472F7745C4005', 3734, 4000, 180, 800, 400, 820, 0],  // SIMPLIE 수납장 BC264 (블랙)
  ['E1632324621148B0', 585, 4155, 180, 920, 90, 1300, 990],  // PREMIUM 맞춤 우드 블라인드 에스프레소
  ['E1632324621148B0', 1676, 4155, 180, 920, 90, 1300, 990],  // PREMIUM 맞춤 우드 블라인드 에스프레소
  ['ZZHrOv2AC2EF05FF43243FB', 198, 2795, 90, 185, 300, 531, 564],  // Beat Table Light (Black)
  ['YneAfk909E36FF912414229', 697, 1422, 90, 445, 137, 39, 630],  // keyboard
  ['YneAfk-85AC7705BADE4E4A', 694, 1087, 90, 67, 112, 30, 630],  // mouse
  ['Ymz-AKZAAF5DF9BAB3E47A8', 240, 666, 90, 100, 250, 300, 630],  // NIMM File Holder
  ['Ymz-AKZAAF5DF9BAB3E47A8', 240, 566, 90, 100, 250, 300, 630],  // NIMM File Holder
  ['Xo35PnA02CC15F5E5C44324', 564, 1815, 135, 270, 180, 80, 630],  // Open book (not for sale)
  ['YVMPHUZ0DEE6D5660DB48B2', 697, 887, 0, 125, 145, 65, 630],  // espresso cup set
  ['YVMPHUe2B4ECE07C08E426B', 1469, 239, 0, 520, 170, 270, 720],  // Book 12set
  ['X-w77FkE525CF8C677A46B0', 2276, 218, 0, 200, 160, 241, 1062],  // Union #12-copied
  ['X-w77FkE525CF8C677A46B0', 2543, 218, 0, 200, 160, 241, 1062],  // Union #12-copied
  ['YVMPHUe2B4ECE07C08E426B', 2283, 237, 0, 520, 170, 270, 1402],  // Book 12set
  ['Y3Jvd_BD5EF2B210F564BF1', 2218, 218, 0, 320, 250, 290, 723],  // book deco
  ['Ymz-AKVBAE7A1C5651944C3', 2587, 190, 0, 277, 320, 232, 723],  // steel storage box
  ['Ym4zsLYED3C0331F08148F5', 1596, 218, 0, 550, 118, 195, 1060],  // office supplies desk supplie
  ['7564995DC96E40A3', 1722, 209, 0, 105, 105, 207, 1400],  // Black vase
  ['YdE3dZD86B1AD39B3C1443A', 1546, 209, 0, 220, 220, 212, 1400],  // 26 CM_blue
  ['Xw0ZynH039E7EE04F954257', 68, 597, 90, 110, 110, 145, 1160],  // CALDERA incense holder
  ['XtdxyE4131F59D7EE0040B4', 68, 717, 90, 173, 135, 46, 1460],  // 4 Scents X Mini Room Spray
  ['YV_XVxW9536C02931594E10', 64, 372, 90, 100, 50, 150, 1294],  // Diptyque
  ['YV_XVxW9536C02931594E10', 64, 492, 90, 100, 50, 150, 1290],  // Diptyque
  ['XtdxyE4131F59D7EE0040B4', 68, 516, 90, 173, 135, 46, 1460],  // 4 Scents X Mini Room Spray
  ['YSCLdDz3A9D4CDED05E451C', 299, 2795, 90, 424, 501, 595, 0],  // W400 3단 서랍 상단 수납형(잠금장치)
  ['XjOO_Xy13478D0D91CD493D', 3678, 1770, -90, 500, 207, 256, 352],  // 프리미엄 리넨 쿠션 30cm x 50cm (카멜)
  // 철제 행거와 걸린 옷·신발(플래너에서 한 묶음). 처음 읽을 때 묶음 안의 가구가 빠져 있어 따로 더했다.
  ['YSBhD9T1E65915F80104295', 2477, 3775, 90, 800, 320, 1737, 0],  // (벽고정)W800 철제행거
  ['YV8EVEF2D36EE1DB1D44CAB', 2559, 4032, 90, 134, 451, 964, 734],  // Dress Shirt
  ['YV8EVEF2D36EE1DB1D44CAB', 2553, 3949, 90, 134, 451, 964, 734],  // Dress Shirt
  ['YV8EVEF2D36EE1DB1D44CAB', 2545, 3851, 90, 134, 451, 964, 734],  // Dress Shirt
  ['XX-zmmq45F1867DE7EE462B', 2477, 3545, 90, 233, 319, 200, 360],  // Clothes 2
  ['XX-zmmq45F1867DE7EE462B', 2478, 3802, 90, 233, 319, 200, 360],  // Clothes 2
  ['ZFFQHal586565A1F38B473C', 2477, 4032, -90, 169, 228, 71, 50],  // shoes 01
  ['ZFFQHal586565A1F38B473C', 2477, 3851, -90, 169, 228, 71, 50],  // shoes 01
  ['YSZphlN2272C00BB9264030', 495, 1252, 90, 1600, 816, 630, 0],  // W1600*D800 모션데스크 프리미엄
  ['YHx4J5H2C427AA8FBFD482A', 3530, 237, 180, 1200, 345, 750, 0],  // 코어렉(CORE RACK) (Black)
  ['YvLiCvk04866276686B40C7', 2504, 1402, 0, 1494, 1697, 24, 0],  // Erba Dhurrie Rug
  ['XNpyDGd4339E9DBCEE941AC', 2292, 1058, 28, 444, 424, 851, 0],  // Archisketch Dining Chair6
  ['E1632324621148B0', 45, 1558, 90, 920, 90, 1300, 990],  // PREMIUM 맞춤 우드 블라인드 에스프레소
  ['E1632324621148B0', 45, 2640, 90, 920, 90, 1300, 990],  // PREMIUM 맞춤 우드 블라인드 에스프레소
  ['83470177e6504b21bad9d2d15b6d5fba', 1037, 1319, -90, 718, 681, 1156, 0],  // 데스커 GX_HDA(블랙프레임/4C6 메쉬/836 
  // 처음 읽을 때 빠졌던 책상 위 장비·TV·조명. 조명은 천장 바로 아래(2300-20)에 붙인다.
  ['YSJfCSW3C8249DE736F456A', 493, 731, 90, 165, 175, 385, 218],  // PC 홀더
  ['YneAflHA33DBE2534ED4DC7', 495, 731, 90, 127, 328, 322, 238],  // desktop computer
  ['YjCJHDA8B714D95FB9D45DD', 295, 1565, -90, 114, 521, 519, 595],  // 싱글 모니터암
  ['ZGXmJUk293C2AE613ED4B4B', 570, 1566, 90, 709, 29, 382, 854],  // 삼성 QLED TV
]

const COLOR: Record<FurnitureCategory, string> = { 가구: '#9aa6b2', 소품: '#d1b58a', '벽·천장': '#7fb0cf' }
const RUG_IDS = new Set(['X5S4t1X5DE143AD22764FF9', 'YvLiCvk04866276686B40C7'])

export const plannerItems = (): Item[] => {
  const count: Record<string, number> = {}
  return ROWS.map(([id, x, z, deg, w, d, h, elevation]) => {
    const furniture = FURNITURE.find((f) => f.id === id)!
    count[id] = (count[id] ?? 0) + 1
    const rot = ((Math.round(deg / 90) % 4) + 4) % 4
    const item: Item = {
      id: `${id}#${count[id]}`,
      name: MODEL_BY_FURNITURE[id]?.model === 'bedset' ? `${furniture.name}${BED_SET_SUFFIX}` : furniture.name,
      kind: RUG_IDS.has(id) ? 'rug' : 'furniture',
      model: MODEL_BY_FURNITURE[id]?.model ?? 'box',
      w,
      d,
      h,
      x,
      z,
      rot: rot as Rot,
      color: COLOR[categoryOf(furniture)],
      image: furniture.image,
    }
    if (elevation > 0) item.elevation = elevation
    if (deg % 90 !== 0) item.yaw = deg
    return item
  })
}
