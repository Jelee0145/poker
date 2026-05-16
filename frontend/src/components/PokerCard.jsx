import { Link } from 'react-router-dom'

const SUIT_SYMBOL = { hearts: '♥', spades: '♠', clubs: '♣', diamonds: '♦' }
const SUIT_COLOR = {
  hearts: 'text-hearts',
  spades: 'text-spades',
  clubs: 'text-clubs',
  diamonds: 'text-diamonds',
}

// 单张扑克牌卡片(列表用)。点击进详情。
export default function PokerCard({ card }) {
  const sym = SUIT_SYMBOL[card.suit] || '?'
  return (
    <Link
      to={`/card/${card.card_key}`}
      className="block bg-white rounded-xl shadow hover:shadow-lg transition p-3 active:scale-95"
    >
      <div className={`flex justify-between text-lg font-bold ${SUIT_COLOR[card.suit]}`}>
        <span>{card.rank}</span>
        <span>{sym}</span>
      </div>
      <div className="mt-2 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl">
          {card.alumni_name?.[0] || '?'}
        </div>
        <p className="mt-1 text-sm font-medium truncate">{card.alumni_name}</p>
        <p className="text-xs text-slate-500 truncate">{card.company_name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{card.industry}</p>
      </div>
    </Link>
  )
}
