# 작업 인수인계 · 프로젝트 2 (오늘의집 "내 공간에 맞는지 확인하기" 3D 프로토타입)

다른 AI/개발자가 이어서 작업할 수 있도록 지금까지 한 일, 구조, 규칙, 남은 일을 정리한 문서입니다.

## 1. 목적

오늘의집 상품 상세 페이지(마켓비 FIHA 서랍장 4.1단)에서 **"이 제품이 우리 집 이 자리에 들어갈까?"** 를 3D로 돌려 보며 확인하는 기능을 실험한다.

- 사용자가 준 디자인 초안 `design/ohhouse.html`(원본, 수정하지 않음)을 React로 옮겼다.
- 초안의 큰 "내 공간에 맞는지 확인하기" 섹션은 **팝업(모달)** 으로 바꿨다.
- 팝업 안에서 방 전체 3D 배치 → 책상 클릭 시 **책상 & 서랍장 상세 360° 뷰**로 들어가 간격(mm)을 보고 치수를 직접 입력한다.

별도 프로젝트 1(`/Users/t2025-m0079/prj/1`, "믿고맡김")과는 관계없는 독립 실험이다.

## 2. 실행

```bash
cd /Users/t2025-m0079/prj/2
pnpm install
pnpm dev      # 지금까지 http://localhost:5180 에서 띄워 왔음
pnpm build    # tsc -b && vite build. 커밋 전 반드시 통과 확인
```

## 3. 기술 스택

- Vite 8, React 19, TypeScript(strict, `noUnusedLocals`)
- Tailwind CSS v4 (`@tailwindcss/vite`, 토큰은 `src/index.css`의 `@theme`)
- three 0.186, @react-three/fiber 9, @react-three/drei 10 (`OrbitControls`, `Html`, `Line`, `Grid`, `ContactShadows`, `RoundedBox`)
- 패키지 매니저 pnpm (strict). `three-stdlib` 타입을 직접 import하지 말 것 → 필요하면 최소 타입으로 캐스팅

## 4. 코드 규칙

- 작은따옴표, 세미콜론 없음, 2칸 들여쓰기, `@/` = `src/`
- 컴포넌트는 `export default function`, 스타일은 Tailwind 클래스만, 색은 `@theme` 토큰 사용
- UI 문구는 한국어 해요체. 근거 없는 수치(예: "적합도 96점")나 하지 않는 기능(사진 인식 등)을 꾸며 쓰지 않는다
- 주석은 코드로 드러나지 않는 제약만
- 로직 단위는 **mm**, 3D 장면 단위는 **m** (`M = 1000`으로 나눔)

## 5. 커밋 이력

| 커밋 | 내용 |
| --- | --- |
| `9edd62f` | 3D 방 배치 프로토타입 (방, 가구, 드래그, 판정) |
| `84bc274` | 오늘의집 상품 페이지 디자인 적용 + 3D 확인 팝업화 |
| `ae8d885` | 책상 클릭 → 360° 상세 뷰, 간격 치수선 |
| `c5f00e9` | 서랍장 기본 위치를 책상 아래로, 상세 뷰에서 책상·서랍장 치수 입력 |

## 6. 파일 구조

| 경로 | 역할 |
| --- | --- |
| `design/ohhouse.html` | 사용자가 붙여 넣은 디자인 초안 원본 (참고용) |
| `index.html` | 타이틀, Noto Sans KR, Material Symbols 폰트 |
| `src/index.css` | `@theme` 색 토큰 (primary #006780, primary-container #35c5f0, status-* 등) |
| `src/App.tsx` | 상품 상세 페이지. 색상/추가상품/조립 상태, 팝업 열기, `FitModal`은 `React.lazy`로 지연 로딩 |
| `src/components/Icon.tsx` | Material Symbols 아이콘 (`filled` 옵션) |
| `src/components/page/*` | 초안 HTML을 옮긴 페이지 조각: `SiteHeader`, `ProductHero`, `FitBadge`, `SpaceFitSection`, `StylingShots`, `DetailSection`, `BottomBar`, `SiteFooter` |
| `src/components/fit/FitModal.tsx` | 팝업 본체. 방 뷰 ↔ 상세 뷰 전환, 오른쪽 STEP 패널, 진단 |
| `src/components/fit/Scene.tsx` | 방 전체 3D: 카메라, 드래그, 서랍 열림 영역, 여유 거리선. 책상을 "클릭"(5px 미만 이동)하면 `onOpenDetail` |
| `src/components/fit/DetailScene.tsx` | 책상 & 서랍장 상세 3D. 책상 기준 좌표, 360° 회전, 치수선(`Dim`) |
| `src/components/fit/RoomShell.tsx` | 바닥, 벽(카메라 쪽 벽은 흐리게), 문/문 열림 반경, 창/커튼 영역 |
| `src/components/fit/Models.tsx` | 서랍장(서랍 열림 애니메이션), T자 다리 책상(상판 아래 판 포함), 의자, 침대, 러그 |
| `src/lib/types.ts` | `Item`, `Room`, `FitResult`, `Gap`, `Check`, `Level` 등 |
| `src/lib/room.ts` | 벽 두께, 문/창 위치, 좌표 변환 `toWorld`/`fromWorld` |
| `src/lib/fit.ts` | 배치 판정 순수 함수 `evaluate()`, `clampToRoom`, `backToWall`, 상수 |
| `src/lib/desk.ts` | 책상 기준 좌표 변환, 다리 위치, 책상 대비 측정, 책상 아래/옆 배치 |
| `src/data/catalog.ts` | 상품 정보·이미지·색상·추가상품, 방 프리셋, 기본 가구, 기본 제품 위치 |

## 7. 화면 흐름

1. **상품 상세 페이지** (`App.tsx`)
   - 팝업 진입점 6곳: 갤러리 pill, 티저 배너, 섹션 카드(`SpaceFitSection`, `id="space-matching-section"` 유지), "내 공간 매칭" 탭, 우측 주문 카드, 하단 바
   - 팝업에서 "확인 완료"를 누르면 결과 요약(`FitSummary`)이 상단 상품 영역과 `SpaceFitSection` 카드에 표시된다
2. **팝업 – 방 뷰** (`FitModal` + `Scene`)
   - 왼쪽: 3D 방. 가구/제품 드래그(10mm 스냅), 빈 곳 드래그로 시점 회전, 휠 확대
   - 상단 바: [책상 자세히 보기] [위에서 보기/3D로 보기] [초기화]
   - 하단 툴바: [90° 회전 (R)] [벽에 붙이기] [서랍 열어보기]
   - 오른쪽: STEP1 내 공간 치수(프리셋, 방 가로/세로/천장/문 폭, 참고 사진) → STEP2 함께 둔 가구(책상/의자/침대 토글) → STEP3 색상 → 공간 적합도 진단
3. **팝업 – 상세 뷰** (`FitModal` + `DetailScene`)
   - 진입: 방 뷰에서 책상 클릭, 상단 [책상 자세히 보기], STEP1의 [책상·서랍장 치수 자세히 입력하기]
   - 나가기: 상단 [← 방 전체] 또는 `Esc` (상세 뷰에서는 Esc가 팝업을 닫지 않고 방 뷰로 돌아감)
   - 360° 회전(위아래 0~π 전체), 자동 회전 토글, 서랍장 드래그 이동
   - 하단 툴바: [360° 자동 회전] [간격 표시] [서랍 열어보기] [아래 왼쪽] [아래 오른쪽] [책상 옆]
   - 오른쪽 STEP1이 **"내 책상 치수"** 로 바뀜 (아래 9절)

## 8. 좌표와 데이터 모델

- 방: x = 0..room.w (왼쪽 벽에 문, 오른쪽 벽에 창), z = 0..room.d (z=0이 책상 벽)
- `Item.rot`: 0~3 (90° 단위). 앞쪽 방향 `['+z','+x','-z','-x'][rot]`
- `Item` 주요 필드: `w, d, h, x, z, rot, model('cabinet'|'desk'|'chair'|'bed'|'rug'), kind('product'|'furniture'|'rug')`
  - 책상 전용: `underClearance`(상판 아래 높이, 없으면 `h - DESK_TOP`), `legGap`(다리 받침 안쪽 사이 거리, 없으면 `w - 2*LEG_INSET - FOOT_W`)
- 책상 기준 좌표(`desk.ts`): 책상 중심이 원점, 책상 앞쪽이 +z. `toDeskLocal` / `fromDeskLocal`
- 기본값 (`catalog.ts`)
  - 제품: W280 × D410 × H690mm (바퀴 포함)
  - 책상: 1200 × 600 × 740mm, 상판 25mm, 상판 아래 715mm, 다리 안쪽 930mm, 흰 상판 + 회색 T자 다리
  - 방 프리셋: 침실 · 책상 아래(3000×3300), 원룸(2800×3600), 좁은 서재(2600×2800). 천장 2300
  - 제품 기본 위치: **모든 프리셋에서 책상 아래 오른쪽 다리 안쪽** (다리·뒤 간격 30mm)

## 9. 상세 뷰 치수 입력 (최근 작업)

`FitModal.tsx`의 `NumberField`(범위 밖이면 빨간 테두리 + 범위 안내, 범위 안일 때만 반영)로 입력한다.

| 입력 | 범위 | 연동 |
| --- | --- | --- |
| 책상 가로 | 600 ~ 방 가로 | 다리 안쪽 폭도 같은 양만큼 변경 (최대 `w - 2*FOOT_W`) |
| 책상 깊이 | 400 ~ 1200 | |
| 책상 높이 | 500 ~ 1200 | 상판 아래 높이도 같은 양만큼 이동 |
| 상판 아래 높이 | 300 ~ 높이-25 | 상판보다 낮으면 3D에 서랍/프레임 판(apron) 표시 |
| 다리 안쪽 폭 | 300 ~ `w - 2*FOOT_W` | 3D 다리 위치 이동 |
| 서랍장: 왼쪽/오른쪽 다리 쪽 | 토글 | |
| 서랍장: 다리와 간격 | 0 ~ 다리 안쪽 폭 - 제품 폭 | |
| 서랍장: 뒤(벽 쪽) 간격 | 0 ~ 책상 깊이 - 제품 깊이 | |

- 책상 치수를 바꾸면 `updateDesk()`가 서랍장의 다리 쪽·다리 간격·뒤 간격(`underOffsets()`)을 유지한 채 다시 배치한다
- 서랍장이 책상 밖이면 간격 입력 대신 [책상 아래로 넣기] 버튼
- 상세 3D 치수선 라벨은 **mm** 단위 (방 뷰/진단 패널은 `cm()`로 cm 표기)
  - 항상: 책상 높이, 상판 아래 높이, 다리 안쪽 폭, 서랍장 가로/깊이/높이
  - 책상 아래일 때: 위 여유, 왼쪽/오른쪽 다리까지, 상판 앞 끝까지, 뒤
  - 책상 옆일 때: 책상과 옆 간격, 상판보다 얼마나 낮은지
  - 색: 초록(여유 충분), 주황(20mm 미만), 빨강(걸림/음수)

## 10. 판정 기준 (`src/lib/fit.ts` `evaluate()`)

| 항목 | 기준 |
| --- | --- |
| 방 밖 / 천장보다 높음 | 불가 |
| 다른 가구와 겹침 (러그 제외) | 불가. 단 책상처럼 `underClearance`가 있고 제품 높이 이하면 "아래에 들어감" |
| 책상 아래 위 여유 | 20mm 미만이면 주의 |
| 책상 다리와 겹침 | 불가 ("다리에 걸려요") |
| 서랍 앞 공간 | 350mm 미만 불가(끝까지 안 열림), 600mm 미만 주의 |
| 옆 간격 | 0~20mm 주의 |
| 문 열림 반경 | 침범 시 불가 |
| 창가 커튼 영역 200mm | 주의 |

## 11. 알려진 사항

- 개발 모드 콘솔의 drei `Html` + StrictMode "synchronously unmount a root" 경고는 개발 환경에서만 나오며 무해
- `FitModal` 청크가 약 1MB (three 포함). 지연 로딩으로 페이지 첫 로드(약 270KB)에는 영향 없음
- 사진 업로드는 참고용으로만 옆에 띄움. 사진 인식/자동 치수 추출은 없음
- 지금까지 AI는 `pnpm build` 통과까지만 확인했고, 브라우저에서 보이는 모습은 직접 확인하지 못함 → 이어받으면 화면부터 점검 권장
- 이 저장소에서 셸로 `git mv`/`git rm` 하는 것은 자동 검토에 막힌 적이 있음 → 파일 이동/삭제는 편집 도구로 처리

## 12. 다음에 할 만한 일 (아직 안 함)

- 상세 뷰 치수 입력값을 방 프리셋/로컬 저장에 남기기 (지금은 팝업을 닫으면 초기화)
- 의자 등 다른 가구도 상세 뷰 지원, 책상 외 가구(침대 협탁 등) 기준 상세 뷰
- 모바일 레이아웃 (현재 팝업은 데스크톱 기준, 오른쪽 패널 380px 고정)
- 판정 로직 단위 테스트 (`fit.ts`, `desk.ts`는 순수 함수라 테스트하기 쉬움)
- `README.md`의 판정 기준·구조 표를 이 문서 내용으로 최신화
