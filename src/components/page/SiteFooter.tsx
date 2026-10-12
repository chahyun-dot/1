import Osset from '@/components/page/Osset'
import { FOOTER } from '@/data/ohou'

const INFO = [
  [{ text: '(주)버킷플레이스' }],
  [{ text: '대표이사 이승재' }],
  [{ text: '서울 서초구 서초대로74길 4 삼성생명서초타워 25층, 27층' }],
  [{ text: 'contact@bucketplace.net' }],
  [{ text: '사업자등록번호 119-86-91245' }, { text: '사업자정보확인', bold: true }],
  [{ text: '통신판매업신고번호 제2018-서울서초-0580호' }],
]

const SOCIALS = [
  {
    href: 'https://www.youtube.com/channel/UCBKtitA1RwY7F32rCniV1dA',
    label: '유튜브',
    body: (
      <>
        <path fill="white" d="M18.7086 8.63031C18.5472 8.02758 18.0736 7.55392 17.4709 7.39258C16.3783 7.09985 12.0002 7.09985 12.0002 7.09985C12.0002 7.09985 7.62199 7.09985 6.53062 7.39258C5.92789 7.55392 5.45423 8.02758 5.29289 8.63031C5.00016 9.72168 5.00016 12.0001 5.00016 12.0001C5.00016 12.0001 5.00016 14.2785 5.29289 15.3699C5.45423 15.9726 5.92789 16.4462 6.53062 16.6076C7.62199 16.9003 12.0002 16.9003 12.0002 16.9003C12.0002 16.9003 16.3783 16.9003 17.4697 16.6076C18.0724 16.4462 18.5461 15.9726 18.7074 15.3699C19.0002 14.2785 19.0002 12.0001 19.0002 12.0001C19.0002 12.0001 19.0002 9.72168 18.7074 8.63031H18.7086Z" />
        <path fill="currentColor" d="M10.6013 14.0994L14.2396 11.9997L10.6013 9.8999V14.0994Z" />
      </>
    ),
  },
  {
    href: 'https://www.instagram.com/todayhouse',
    label: '인스타그램',
    body: (
      <path
        fill="white"
        d="M9.10061 5.04896C8.3558 5.0841 7.84718 5.20296 7.40253 5.37768C6.94235 5.55702 6.5523 5.79768 6.16422 6.18717C5.77614 6.57665 5.53715 6.96698 5.35907 7.42786C5.18673 7.87349 5.06997 8.38253 5.03707 9.12776C5.00417 9.87299 4.99689 10.1125 5.00053 12.0135C5.00417 13.9144 5.01257 14.1527 5.04869 14.8995C5.08425 15.6441 5.20269 16.1526 5.37741 16.5974C5.55703 17.0576 5.79742 17.4475 6.18704 17.8357C6.57666 18.2239 6.96671 18.4624 7.42871 18.6407C7.87392 18.8128 8.3831 18.9301 9.12819 18.9627C9.87328 18.9953 10.1131 19.0029 12.0135 18.9993C13.9139 18.9956 14.1531 18.9872 14.8997 18.9518C15.6464 18.9164 16.1522 18.7971 16.5971 18.6232C17.0573 18.4432 17.4475 18.2032 17.8354 17.8134C18.2234 17.4237 18.4622 17.0331 18.6402 16.5719C18.8126 16.1267 18.9298 15.6175 18.9622 14.873C18.9948 14.1258 19.0025 13.8872 18.9988 11.9866C18.9952 10.0859 18.9867 9.84765 18.9513 9.10116C18.9158 8.35467 18.7972 7.84773 18.6227 7.40266C18.4428 6.94248 18.2027 6.55285 17.8132 6.16435C17.4237 5.77584 17.0328 5.53714 16.5718 5.35962C16.1263 5.18728 15.6174 5.06982 14.8723 5.03762C14.1272 5.00542 13.8874 4.99716 11.9863 5.0008C10.0852 5.00444 9.84724 5.01256 9.10061 5.04896ZM9.18237 17.7034C8.49986 17.6737 8.12928 17.5603 7.88232 17.4654C7.55527 17.3394 7.32231 17.1871 7.07619 16.9433C6.83007 16.6996 6.67886 16.4658 6.55118 16.1394C6.45528 15.8925 6.33978 15.5223 6.30786 14.8398C6.27314 14.1021 6.26586 13.8807 6.2618 12.0118C6.25774 10.1429 6.26488 9.92171 6.29722 9.18376C6.32634 8.50181 6.44044 8.13081 6.53522 7.88399C6.66122 7.55652 6.81299 7.32398 7.05729 7.078C7.30159 6.83201 7.53469 6.68053 7.86132 6.55285C8.108 6.45653 8.47816 6.34201 9.16039 6.30953C9.89862 6.27453 10.1198 6.26753 11.9884 6.26347C13.857 6.25941 14.0788 6.26641 14.8173 6.29889C15.4992 6.32857 15.8704 6.44155 16.1169 6.53689C16.4441 6.66289 16.6769 6.81423 16.9229 7.05896C17.1689 7.30368 17.3205 7.53594 17.4482 7.86327C17.5447 8.10925 17.6592 8.47927 17.6914 9.16192C17.7265 9.90015 17.7345 10.1215 17.7379 11.9899C17.7412 13.8584 17.7346 14.0803 17.7023 14.818C17.6725 15.5005 17.5594 15.8712 17.4643 16.1184C17.3383 16.4454 17.1864 16.6785 16.9419 16.9243C16.6975 17.1701 16.4647 17.3216 16.1379 17.4493C15.8915 17.5455 15.5209 17.6603 14.8393 17.6928C14.101 17.7275 13.8798 17.7348 12.0105 17.7388C10.1412 17.7429 9.92074 17.7353 9.18251 17.7034M14.889 8.25877C14.8898 8.72273 15.2664 9.09822 15.7304 9.09738C16.1943 9.09654 16.5698 8.71993 16.569 8.25597C16.5681 7.792 16.1915 7.41652 15.7276 7.41736C15.7276 7.41736 15.7274 7.41736 15.7273 7.41736C15.2635 7.41834 14.8881 7.79494 14.889 8.25877ZM8.4055 12.007C8.40942 13.9922 10.0217 15.5979 12.0065 15.5941C13.9913 15.5904 15.5981 13.9782 15.5943 11.993C15.5905 10.0078 13.9778 8.40171 11.9928 8.40563C10.0077 8.40955 8.40172 10.0221 8.4055 12.007ZM9.66635 12.0045C9.66383 10.7158 10.7064 9.669 11.9951 9.66648C13.2839 9.66396 14.3306 10.7066 14.3332 11.9953C14.3357 13.284 13.2931 14.3308 12.0044 14.3333C10.7158 14.336 9.66901 13.2936 9.66635 12.0051V12.0045Z"
      />
    ),
  },
  {
    href: 'https://www.facebook.com/interiortoday',
    label: '페이스북',
    body: (
      <path
        fill="white"
        d="M16.2818 15.1797L16.7695 12H13.7188V9.93664C13.7188 9.06674 14.145 8.21875 15.5114 8.21875H16.8984V5.51172C16.8984 5.51172 15.6397 5.29688 14.4361 5.29688C11.9235 5.29688 10.2812 6.81969 10.2812 9.57656V12H7.48828V15.1797H10.2812V22.8664C10.8413 22.9542 11.4152 23 12 23C12.5848 23 13.1587 22.9542 13.7188 22.8664V15.1797H16.2818Z"
      />
    ),
  },
  {
    href: 'https://naver.me/51ckkDZh',
    label: '네이버 블로그',
    body: (
      <>
        <path fill="white" d="M7.96631 5.76685H16.033V13.8335H7.96631V5.76685ZM12.5913 8.24889V9.81433L11.4126 8.24889H10.1381V11.3515H11.4082V9.78601L12.5872 11.3515H13.8612V8.24889H12.5913Z" />
        <path fill="white" d="M7.96631 14.454H16.033L14.5204 16.3156H9.47869L7.96631 14.454Z" />
        <path fill="white" d="M9.98281 16.9361H14.0161L11.9993 19.4181L9.98281 16.9361Z" />
      </>
    ),
  },
]

export default function SiteFooter() {
  return (
    <footer className="bg-oh-foot py-10">
      <div className="mx-auto grid w-full max-w-[1256px] grid-cols-[256px_1px_256px_1px_526px] gap-x-6 px-[60px]">
        <div>
          <a href="#" className="flex h-6 w-fit items-center gap-[2px] text-[18px] font-bold leading-6 text-oh-dark">
            고객센터
            <Osset name="chevronRight" size={12} />
          </a>
          <div className="mt-3 flex flex-col gap-2">
            {FOOTER.support.map((item) => (
              <a
                key={item.title}
                href="#"
                className="flex items-center justify-between gap-2 rounded-xl border border-oh-line2 bg-white py-3 pl-5 pr-4"
              >
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[14px] font-semibold leading-[18px] text-oh-dark">{item.title}</span>
                  <span className="whitespace-pre-line text-[12px] leading-4 text-oh-foot-ink">{item.sub}</span>
                </span>
                <Osset name="chevronRight" size={16} className="shrink-0 text-oh-dark" />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-oh-line2" />

        <div className="grid auto-cols-[124px] grid-flow-col grid-rows-6 gap-x-2 gap-y-5">
          {FOOTER.links.map(([label, bold]) => (
            <a key={label} href="#" className={`text-[12px] leading-4 text-oh-dark ${bold ? 'font-bold' : ''}`}>
              {label}
            </a>
          ))}
        </div>

        <div className="bg-oh-line2" />

        <div className="flex flex-col gap-3">
          <div className="-mx-[9px] flex w-[535px] flex-wrap text-[12px] leading-5 text-oh-foot-ink">
            {INFO.map((parts, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="px-1">|</span>}
                <span>
                  {parts.map((part) =>
                    part.bold ? (
                      <a key={part.text} href="#" className="ml-[2px] font-bold">
                        {part.text}
                      </a>
                    ) : (
                      <span key={part.text}>{part.text}</span>
                    ),
                  )}
                </span>
                {index === 0 && <span className="w-[11px]" />}
              </div>
            ))}
          </div>

          <div className="text-[10px] leading-[14px] text-oh-foot-ink">
            고객님이 현금결제한 금액에 대해 우리은행과 채무지급보증 계약을 체결하여 안전거래를 보장하고 있습니다.{' '}
            <a href="#" className="font-bold">
              서비스가입사실확인
            </a>
          </div>

          <div className="grid grid-cols-[167.77px_116px_116px] gap-[6px]">
            <div className="flex h-10 items-center justify-center gap-[6px] border border-black/[0.08] px-[6px]">
              <img src={FOOTER.marks[0]} alt="isms 인증 마크" className="h-8 w-8" />
              <div className="text-[10px] leading-[14px] text-oh-foot-ink">
                오늘의집 서비스 운영
                <br />
                2024. 09. 08 ~ 2027. 09. 07
              </div>
            </div>
            <div className="flex h-10 items-center justify-center gap-[6px] border border-black/[0.08] px-[6px]">
              <img src={FOOTER.marks[1]} alt="iso27001 인증 마크" className="h-8 w-8" />
            </div>
            <div className="flex h-10 items-center justify-center gap-[6px] border border-black/[0.08] px-[6px]">
              <a href="#" className="h-9 w-8">
                <img src={FOOTER.marks[2]} alt="pcr 인증 마크" className="h-8 w-8" />
              </a>
            </div>
          </div>

          <div className="text-[10px] leading-[14px] text-oh-foot-ink">{FOOTER.disclaimer}</div>

          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="h-6 w-6 text-oh-foot-ink">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" fill="currentColor" />
                  {social.body}
                </svg>
              </a>
            ))}
          </div>

          <p className="text-[10px] leading-[14px] text-oh-foot-ink">Copyright 2014. bucketplace, Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
