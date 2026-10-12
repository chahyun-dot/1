import { useEffect, useState } from 'react'
import Osset from '@/components/page/Osset'

export default function TopButton() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!show) return null
  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-[10px] right-5 z-[1101] p-[10px]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(63,71,77,0.25)]">
        <Osset name="arrowUp" size={24} color="#2F3438" />
      </span>
    </button>
  )
}
