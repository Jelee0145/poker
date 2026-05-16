import { useEffect, useState } from 'react'
import { api } from '../api'
import PokerCard from '../components/PokerCard'

const SUITS = [
  { key: 'hearts', label: '红桃 ♥ 科技', color: 'text-hearts' },
  { key: 'spades', label: '黑桃 ♠ 电商', color: 'text-spades' },
  { key: 'clubs', label: '梅花 ♣ 餐饮', color: 'text-clubs' },
  { key: 'diamonds', label: '方块 ♦ 制造', color: 'text-diamonds' },
]

// 扑克牌墙:按花色分组展示 + 关键词搜索。访客可直接查看。
export default function CardWall() {
  const [cards, setCards] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load(keyword) {
    setLoading(true)
    api
      .listCards({ q: keyword })
      .then((d) => {
        setCards(d.items)
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load('')
  }, [])

  const grouped = SUITS.map((s) => ({
    ...s,
    items: cards.filter((c) => c.suit === s.key),
  }))

  return (
    <div className="p-4 max-w-screen-md mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          load(q)
        }}
        className="flex gap-2 mb-4"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索姓名 / 公司 / 项目"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">
          搜索
        </button>
      </form>

      {loading && <p className="text-center text-slate-400 py-8">加载中…</p>}
      {error && <p className="text-center text-hearts py-8">{error}</p>}

      {!loading &&
        !error &&
        grouped.map((g) => (
          <section key={g.key} className="mb-6">
            <h2 className={`font-bold mb-2 ${g.color}`}>
              {g.label}
              <span className="text-slate-400 text-xs ml-2">
                {g.items.length} 张
              </span>
            </h2>
            {g.items.length === 0 ? (
              <p className="text-xs text-slate-400">无匹配</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {g.items.map((c) => (
                  <PokerCard key={c.card_key} card={c} />
                ))}
              </div>
            )}
          </section>
        ))}
    </div>
  )
}
