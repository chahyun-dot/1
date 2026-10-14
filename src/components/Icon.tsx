type IconProps = {
  name: string
  className?: string
  filled?: boolean
  // 글꼴 CSS 의 기본 크기(24px)가 text-[..] 보다 우선해서, 작게 쓸 때는 px 값을 직접 넘긴다.
  size?: number
}

export default function Icon({ name, className = '', filled = false, size }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined leading-none ${className}`}
      style={filled || size ? { ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...(size ? { fontSize: size } : {}) } : undefined}
    >
      {name}
    </span>
  )
}
