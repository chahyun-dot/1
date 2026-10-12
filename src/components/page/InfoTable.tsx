// 상품정보 · 배송 · 교환/환불 · 판매자 정보에서 쓰는 두 칸짜리 표.
export default function InfoTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-oh-line">
            <th className="w-[139px] px-[6px] py-3 text-left align-middle font-normal leading-[18px] text-oh-gray">{label}</th>
            <td className="px-[6px] py-3 align-middle leading-[18px] text-oh-ink">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
