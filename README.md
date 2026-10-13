# fit-in-room · 오늘의집 상품 페이지 재현 + 3D 공간 확인

오늘의집 상품 페이지(마켓비 피하 서랍장 4.1단)를 재현하고, 대표 이미지의 "내 방에 맞을까? 가상배치" 버튼으로 3D "내 공간에 맞는지 확인하기" 팝업을 여는 프로토타입입니다.

- 배포: https://roomjirak.vercel.app (`main` 푸시 시 Vercel 자동 배포)
- **이어서 작업하려면 먼저 [docs/HANDOFF.md](docs/HANDOFF.md)를 읽으세요.** 현재 상태, 남은 문제, 검증 방법, 규칙이 정리돼 있습니다.

## 실행

```bash
pnpm install
pnpm dev          # pnpm이 없으면: npm install && npm run dev
pnpm build        # tsc -b && vite build
```

## 구조

| 경로 | 내용 |
| --- | --- |
| `src/App.tsx` | 페이지 조립, 3D 팝업 열기 |
| `src/components/page/` | 오늘의집 페이지 구성 요소 (헤더, 상품 영역, 구매 패널, 탭, 리뷰, 푸터 …) |
| `src/components/fit/` | 3D 팝업 (방, 가구, 판정, 책상 상세 뷰) |
| `src/data/ohou.ts` | 페이지 문구·이미지 주소·리뷰·문의 |
| `src/data/catalog.ts` | 상품, 색상, 방·가구 기본값 |
| `src/lib/fit.ts` | 배치 판정 (순수 함수, 단위 mm) |
| `design/ohhouse.html` | 초기 디자인 초안 (참고용) |
