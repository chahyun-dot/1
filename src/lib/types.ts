export type Rot = 0 | 1 | 2 | 3

export type ItemKind = 'product' | 'furniture' | 'rug'

export type PropModel = 'stringpocket' | 'bedding' | 'picframe' | 'poster' | 'kidlamp' | 'laptop' | 'geneva' | 'clock' | 'winebottle' | 'wineglasses' | 'turntable' | 'recordstack' | 'tissuecase' | 'diffuser' | 'bookrow' | 'ovaltray' | 'bird' | 'wallhanger' | 'shirt' | 'folded' | 'shoes' | 'parentesi' | 'tweedrug' | 'slidingcab' | 'audiorama' | 'beatlight' | 'keyboard' | 'mouse' | 'fileholder' | 'openbook' | 'espresso' | 'unionbook' | 'bookdeco' | 'steelbox' | 'supplies' | 'blackvase' | 'bluevase' | 'ledpanel' | 'incense' | 'dstl' | 'diptyque' | 'oddrun' | 'cushion' | 'pcholder' | 'desktoppc' | 'dhurrie' | 'frontdoor' | 'window' | 'monitorarm'

export type ItemModel = PropModel | 'cabinet' | 'desk' | 'chair' | 'bed' | 'rug' | 'roundrug' | 'shelf' | 'sofa' | 'table' | 'plant' | 'box' | 'roundtable' | 'bedframe' | 'bedset' | 'steelshelf' | 'pegboard' | 'mirror' | 'blind' | 'fksofa' | 'meshchair' | 'diningchair' | 'motiondesk' | 'chromecabinet' | 'corerack' | 'aralia' | 'drawerunit' | 'walltv'

export type Item = {
  id: string
  name: string
  kind: ItemKind
  model: ItemModel
  w: number
  d: number
  h: number
  x: number
  z: number
  rot: Rot
  color: string
  underClearance?: number
  legGap?: number
  // 서랍장 바퀴 높이(mm). 0이면 바퀴 없이 바닥에 놓인다.
  caster?: number
  // 데모 페이지에서 고른 가구의 미리보기 이미지 주소.
  image?: string
  // 바닥에서 띄워 건 높이(mm). 벽에 거는 거울·액자·블라인드용이며, 없으면 바닥에 놓인다.
  elevation?: number
  // 90° 단위가 아닌 각도(도). 있으면 그림은 이 각도로 돌리고, 판정은 가장 가까운 rot 로 한다.
  yaw?: number
  // 사용자가 고른 색(hex). 색 옵션이 있는 가구 모델만 쓰고, 없으면 모델의 기본 색이다. tint2 는 보조 색(예: 스트링 포켓의 철선).
  tint?: string
  tint2?: string
  // 침대 프레임(헤드보드 포함) 색(hex). 없으면 검은색이다.
  frameTint?: string
}

export type Side = '-x' | '+x' | '-z' | '+z'

// 벽에 난 구멍. from~to 는 그 벽을 따라 잰 위치(mm), bottom~top 은 바닥에서의 높이(mm).
export type Opening = { side: Side; from: number; to: number; bottom: number; top: number }

export type Room = {
  w: number
  d: number
  h: number
  doorWidth: number
  // 있으면 기본 문·창 대신 이 구멍들로 방을 만든다(플래너 배치 같은 실제 방용).
  openings?: { door: Opening; windows: Opening[] }
}

// bottom 은 창 커튼 라인처럼 바닥에서 떠 있는 영역의 아래 높이(mm)다. 없으면 바닥부터다.
export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number; bottom?: number }

export type Dir = '+x' | '-x' | '+z' | '-z'

export type Level = 'ok' | 'warn' | 'bad'

export type Gap = {
  dir: Dir
  side: '앞' | '뒤' | '옆'
  distance: number
  target: string
  from: [number, number]
  to: [number, number]
  level: Level
}

export type Check = {
  level: Level
  title: string
  detail: string
}

export type FitResult = {
  verdict: Level
  checks: Check[]
  gaps: Gap[]
  under: string | null
}
