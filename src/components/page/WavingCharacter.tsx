import character from '@/assets/oh-character-new.webp'

// 한 장짜리 이미지라서 두 팔(왼팔은 NEW 팻말째, 오른팔은 가리키는 손째)만 잘라 겹쳐 두고 각각 어깨를 축으로 흔든다.
// 팔이 빠진 자리(몸통 일부)는 같은 색의 파란 조각으로 메운다. 팻말에 가려 있던 머리 왼쪽 모서리는 둥근 곡선으로 그려 넣는다.
// 좌표는 원본 1254×1254 기준 비율이다.
const ARM_LEFT = 'polygon(0.00% 0.00%, 39.87% 0.00%, 39.87% 32.70%, 36.84% 35.09%, 36.44% 39.87%, 34.45% 45.61%, 31.50% 49.20%, 27.51% 52.39%, 27.27% 55.82%, 27.27% 64.19%, 0.00% 64.19%)'
const ARM_RIGHT = 'polygon(79.74% 43.06%, 100.00% 43.06%, 100.00% 73.76%, 76.40% 73.76%, 76.40% 70.33%, 77.03% 62.20%, 78.55% 61.00%, 79.74% 59.01%)'
const BASE = 'polygon(39.87% 0.00%, 79.74% 0.00%, 79.74% 59.01%, 78.55% 61.00%, 77.03% 62.20%, 76.40% 70.33%, 76.40% 73.76%, 100.00% 73.76%, 100.00% 100.00%, 0.00% 100.00%, 0.00% 64.19%, 27.27% 64.19%, 27.27% 55.82%, 27.51% 52.39%, 31.50% 49.20%, 34.45% 45.61%, 36.44% 39.87%, 36.84% 35.09%, 39.87% 32.70%)'
const PATCH_LEFT = 'polygon(37.48% 35.09%, 35.33% 36.52%, 33.17% 38.60%, 31.18% 41.07%, 29.27% 43.86%, 27.67% 46.89%, 26.48% 50.00%, 25.68% 53.03%, 25.36% 55.82%, 25.28% 65.39%, 28.87% 65.39%, 28.87% 53.03%, 33.49% 49.84%, 37.48% 43.46%, 39.87% 37.48%)'
const PATCH_RIGHT = 'polygon(74.96% 61.56%, 77.83% 61.56%, 77.35% 66.19%, 76.40% 70.49%, 74.96% 70.49%)'

const FILL = '#3cacfc'

export default function WavingCharacter({ size }: { size: number }) {
  const layer = 'absolute inset-0 h-full w-full select-none object-contain'
  return (
    <div className="pointer-events-none shrink-0 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]" style={{ width: size, height: size }} aria-hidden="true">
      <div className="oh-hop relative h-full w-full">
        <div className="absolute inset-0" style={{ clipPath: PATCH_LEFT, backgroundColor: FILL }} />
        <div className="absolute inset-0" style={{ clipPath: PATCH_RIGHT, backgroundColor: FILL }} />
        <img src={character} alt="" draggable={false} className={layer} style={{ clipPath: BASE }} />
        <img src={character} alt="" draggable={false} className={`${layer} oh-wave-left`} style={{ clipPath: ARM_LEFT, transformOrigin: '26.3% 57.4%' }} />
        <img src={character} alt="" draggable={false} className={`${layer} oh-wave-right`} style={{ clipPath: ARM_RIGHT, transformOrigin: '77.2% 65.4%' }} />
      </div>
    </div>
  )
}
