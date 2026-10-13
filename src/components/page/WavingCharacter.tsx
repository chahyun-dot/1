import character from '@/assets/oh-character-new.webp'

// 한 장짜리 이미지라서 NEW 팻말을 든 왼팔 부분만 잘라 겹쳐 두고, 그 층만 어깨를 축으로 흔든다.
// 팔이 빠진 자리(몸통 일부)는 같은 색의 파란 조각으로 메운다. 좌표는 원본 1254×1254 기준 비율이다.
const MOVING = 'polygon(0.00% 0.00%, 39.87% 0.00%, 39.87% 33.89%, 36.84% 35.09%, 36.44% 39.87%, 34.45% 45.61%, 31.50% 49.20%, 27.51% 52.39%, 27.27% 55.82%, 27.27% 64.19%, 0.00% 64.19%)'
const BASE = 'polygon(39.87% 0.00%, 100.00% 0.00%, 100.00% 100.00%, 0.00% 100.00%, 0.00% 64.19%, 27.27% 64.19%, 27.27% 55.82%, 27.51% 52.39%, 31.50% 49.20%, 34.45% 45.61%, 36.44% 39.87%, 36.84% 35.09%, 39.87% 33.89%)'
const PATCH = 'polygon(39.87% 33.89%, 37.48% 34.29%, 25.68% 51.83%, 25.20% 55.82%, 25.20% 65.39%, 28.87% 65.39%, 28.87% 53.03%, 33.49% 49.84%, 37.48% 43.46%, 39.87% 33.89%)'

export default function WavingCharacter({ size }: { size: number }) {
  const layer = 'absolute inset-0 h-full w-full select-none object-contain'
  return (
    <div className="pointer-events-none relative shrink-0 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]" style={{ width: size, height: size }} aria-hidden="true">
      <div className="absolute inset-0 bg-[#3cacfc]" style={{ clipPath: PATCH }} />
      <img src={character} alt="" draggable={false} className={layer} style={{ clipPath: BASE }} />
      <img src={character} alt="" draggable={false} className={`${layer} oh-wave`} style={{ clipPath: MOVING, transformOrigin: '26.3% 57.4%' }} />
    </div>
  )
}
