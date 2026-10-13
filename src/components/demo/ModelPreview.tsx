import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import ItemModel from '@/components/fit/Models'
import { FURNITURE, MODEL_BY_FURNITURE } from '@/data/furniture'
import type { Item } from '@/lib/types'

// 코드로 만든 가구 3D 모델을 하나씩 돌려 보는 미리보기. 이미지(왼쪽 위)와 3D 를 나란히 비교할 수 있다.
const MODELED = FURNITURE.filter((f) => MODEL_BY_FURNITURE[f.id])

const toItem = (index: number): Item => {
  const f = MODELED[index]
  const spec = MODEL_BY_FURNITURE[f.id]
  return { id: f.id, name: f.name, kind: 'furniture', model: spec.model, w: f.size.w, d: f.size.d, h: f.size.h, x: 0, z: 0, rot: 0, color: '#9aa6b2', elevation: 0 }
}

export default function ModelPreview() {
  const [index, setIndex] = useState(0)
  const furniture = MODELED[index]
  const item = useMemo(() => toItem(index), [index])
  const span = Math.max(item.w, item.d, item.h) / 1000
  const hung = (MODEL_BY_FURNITURE[furniture.id].elevation ?? 0) > 0

  return (
    <div className="flex h-screen flex-col bg-surface-base text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default px-5">
        <h1 className="text-[17px] font-bold">3D 모델 미리보기 <span className="text-primary-container">{MODELED.length}</span></h1>
        <a href="#/demo" className="text-[14px] font-medium text-primary-container">데모로 돌아가기</a>
      </header>
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 bg-[#e9ebee]">
          <Canvas shadows camera={{ fov: 30, near: 0.05, far: 100, position: [span * 1.7, span * 1.1 + 0.4, span * 1.9] }} key={furniture.id}>
            <hemisphereLight args={['#ffffff', '#9aa0a8', 1.3]} />
            <directionalLight position={[2.5, 5, 3.5]} intensity={1.7} castShadow shadow-mapSize={[2048, 2048]} />
            <Grid args={[8, 8]} cellSize={0.1} sectionSize={1} cellColor="#cfd3d9" sectionColor="#aeb4bd" fadeDistance={10} infiniteGrid />
            <group position={[0, hung ? 0.3 : 0, 0]}>
              <ItemModel item={item} />
            </group>
            <OrbitControls makeDefault target={[0, (item.h / 1000) / 2 + (hung ? 0.3 : 0), 0]} enableDamping />
          </Canvas>
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-inverse-surface/85 px-4 py-1.5 text-[12px] text-inverse-on-surface">끌어서 돌리고, 휠로 확대해 보세요</p>
        </div>
        <aside className="flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-border-default">
          <section className="border-b border-border-subtle px-5 py-4">
            <div className="flex h-56 items-center justify-center rounded-lg bg-surface-subtle">
              <img src={furniture.image} alt={furniture.name} className="h-full w-full object-contain" />
            </div>
            <p className="mt-3 text-[11px] font-bold text-primary-container">원본 이미지</p>
            <h2 className="text-[15px] font-bold leading-snug">{furniture.name}</h2>
            <p className="mt-0.5 text-[12px] text-text-secondary">
              W{furniture.size.w} × D{furniture.size.d} × H{furniture.size.h}mm{hung ? ` · 벽에 ${MODEL_BY_FURNITURE[furniture.id].elevation}mm 높이로 걸림` : ''}
            </p>
          </section>
          <ul className="space-y-1.5 px-5 py-4">
            {MODELED.map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left ${i === index ? 'border-primary-container bg-brand-sky-light' : 'border-border-default'}`}
                >
                  <img src={f.image} alt="" className="h-10 w-10 shrink-0 rounded-md bg-surface-subtle object-contain" />
                  <span className="min-w-0 truncate text-[13px] font-semibold">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
