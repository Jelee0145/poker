import { Link } from 'react-router-dom'

// 王牌(大王=学校 / 小王=学院)。紧凑横向卡:左徽标 + 右文字。
// 王牌没有点数,不显示 K/J,只标「大王 / 小王」。
export default function SpecialCard({ card }) {
  const isKing = card.type === 'king'

  return (
    <Link
      to={`/special/${card.type}`}
      className="group relative flex items-center gap-3 rounded-xl overflow-hidden
                 px-3 py-3 text-white ring-1 ring-[#E8B33A]/60 shadow-card
                 bg-gradient-to-br from-school-deep via-school to-school-dark
                 hover:-translate-y-0.5 transition-all duration-200"
    >
      <span className="pointer-events-none absolute -right-3 -bottom-3 text-[64px]
                       leading-none text-[#E8B33A]/10 select-none">♛</span>

      {/* 徽标 */}
      <div className="shrink-0 w-12 h-12 rounded-full bg-white/10 ring-1 ring-[#E8B33A]/50
                      flex items-center justify-center overflow-hidden">
        {isKing ? (
          <img
            src="/logo-zspt-white.png"
            alt={card.title}
            className="w-9 h-9 object-contain"
          />
        ) : (
          <span className="text-xl font-bold">{card.title?.[0]}</span>
        )}
      </div>

      {/* 文字 */}
      <div className="min-w-0 flex-1 relative">
        <span className="inline-block text-[10px] tracking-[0.2em] text-[#E8B33A] font-semibold">
          {card.subtitle /* 大王 / 小王 */}
        </span>
        <p className="text-sm font-bold leading-tight truncate">{card.title}</p>
      </div>

      <span className="relative text-[#E8B33A] text-lg shrink-0">♛</span>
    </Link>
  )
}
