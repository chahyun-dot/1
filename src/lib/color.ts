// hex 색을 흰색 쪽으로 t(0~1)만큼 섞는다. 이불 위의 베개처럼 같은 색의 밝은 면을 만들 때 쓴다.
export const lighten = (hex: string, t: number) => {
  const value = parseInt(hex.slice(1), 16)
  const mix = (shift: number) => Math.round(((value >> shift) & 255) + (255 - ((value >> shift) & 255)) * t)
  return `#${[16, 8, 0].map((shift) => mix(shift).toString(16).padStart(2, '0')).join('')}`
}
