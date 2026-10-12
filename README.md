# 2 · 내 공간에 맞는지 확인하기 (오늘의집 가상배치 실험)

오늘의집 상품 상세(마켓비 FIHA 서랍장 4.1단)에서 "내 공간에 맞는지 확인하기"를 3D 팝업으로 여는 프로토타입입니다. 방 치수를 넣고 제품을 돌려 보며 끌어 놓으면 들어가는지 판정합니다.

## 실행

```bash
pnpm install
pnpm dev
```

## 구조

| 경로 | 내용 |
| --- | --- |
| `design/ohhouse.html` | 디자인 초안 (원본) |
| `src/App.tsx` | 상품 상세 페이지, 팝업 열기 |
| `src/components/page/` | 초안 HTML을 옮긴 페이지 구성 요소 |
| `src/components/fit/FitModal.tsx` | 내 공간 확인 팝업 (치수, 가구, 색상, 진단). 열 때만 불러온다 |
| `src/components/fit/Scene.tsx` | 3D 장면, 드래그, 카메라, 서랍 열림 영역, 여유 거리 표시 |
| `src/components/fit/RoomShell.tsx` | 바닥, 벽(카메라 쪽 벽은 흐리게), 창, 문 |
| `src/components/fit/Models.tsx` | 서랍장(서랍 열림 애니메이션), 책상, 의자, 침대 |
| `src/lib/fit.ts` | 배치 판정. React 없는 순수 함수, 단위 mm |
| `src/data/catalog.ts` | 상품 정보, 색상, 방 프리셋, 기본 가구 배치 |

## 판정 기준

| 항목 | 기준 |
| --- | --- |
| 서랍 앞 공간 | 35cm 미만이면 불가(서랍이 끝까지 안 열림), 60cm 미만이면 주의 |
| 책상 아래 | 제품 높이가 책상 아래 높이 이하면 들어감. 여유 2cm 미만이면 주의 |
| 옆 간격 | 0~2cm면 주의 (바퀴로 넣고 뺄 때 긁힘) |
| 공통 | 방 밖, 다른 가구와 겹침, 문 여닫는 공간, 창가 커튼 20cm |
