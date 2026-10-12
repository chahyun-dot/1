import InfoTable from '@/components/page/InfoTable'
import { DELIVERY_ROWS, REFUND_BLOCKED, REFUND_PERIOD, REFUND_ROWS, SELLER_ROWS } from '@/data/ohou'

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[18px] font-bold leading-6 text-oh-ink">{children}</h2>
}

function Small({ children }: { children: React.ReactNode }) {
  return <small className="text-[10.8333px] text-oh-gray"> {children}</small>
}

// 번호가 앞에 붙는 목록(원본은 굵은 숫자)
function NumberList({ children }: { children: React.ReactNode[] }) {
  return (
    <ol className="mt-[11px]">
      {children.map((child, index) => (
        <li key={index} className="relative pl-[14px] text-[13px] leading-[18px] text-oh-ink">
          <span className="absolute left-0 top-0 font-bold">{index + 1}</span>
          {child}
        </li>
      ))}
    </ol>
  )
}

export default function DeliverySection() {
  return (
    <div id="goods-detail-section-delivery" className="w-[692px]">
      <div className="mb-20">
        <Title>배송</Title>
        <div className="mt-7">
          <InfoTable rows={DELIVERY_ROWS} />
        </div>
      </div>

      <div className="mb-20">
        <Title>교환/환불</Title>
        <div className="mt-7">
          <InfoTable rows={REFUND_ROWS} />

          <div className="mt-10">
            <h3 className="text-[15px] font-bold leading-6 text-oh-ink">{REFUND_PERIOD.title}</h3>
            <span className="mt-2 block text-[12px] leading-[15px] text-oh-gray">{REFUND_PERIOD.note}</span>
            <NumberList>
              {REFUND_PERIOD.items.map((item) => (
                <span key={item.text}>
                  {item.text}
                  {item.br ? (
                    <>
                      <br />
                      {REFUND_PERIOD.tail}
                    </>
                  ) : null}
                  <Small>{item.small}</Small>
                </span>
              ))}
            </NumberList>
          </div>

          <div className="mt-[30px]">
            <h3 className="text-[15px] font-bold leading-6 text-oh-ink">{REFUND_BLOCKED.title}</h3>
            <span className="mt-2 block text-[12px] leading-[15px] text-oh-gray">{REFUND_BLOCKED.note}</span>
            <NumberList>
              {REFUND_BLOCKED.items.map((item) => (
                <span key={item.text}>
                  {item.text}
                  {item.small && <Small>{item.small}</Small>}
                </span>
              ))}
            </NumberList>
          </div>
        </div>
      </div>

      <div>
        <Title>판매자 정보</Title>
        <div className="mt-7">
          <InfoTable rows={SELLER_ROWS} />
        </div>
      </div>
    </div>
  )
}
