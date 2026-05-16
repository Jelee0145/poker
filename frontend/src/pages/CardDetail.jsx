import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

const SUIT_SYMBOL = { hearts: '♥', spades: '♠', clubs: '♣', diamonds: '♦' }

function Field({ label, value }) {
  if (!value) return null
  return (
    <div className="flex py-2 border-b border-slate-100 text-sm">
      <span className="w-24 text-slate-400 shrink-0">{label}</span>
      <span className="flex-1">{value}</span>
    </div>
  )
}

// 校友档案详情页。访客可完整查看。
export default function CardDetail() {
  const { key } = useParams()
  const [card, setCard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getCard(key)
      .then(setCard)
      .catch((e) => setError(e.message))
  }, [key])

  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-hearts">{error}</p>
        <Link to="/" className="text-slate-500 text-sm underline mt-4 inline-block">
          返回牌墙
        </Link>
      </div>
    )
  if (!card) return <p className="p-8 text-center text-slate-400">加载中…</p>

  return (
    <div className="p-4 max-w-screen-sm mx-auto">
      <Link to="/" className="text-slate-500 text-sm">‹ 返回牌墙</Link>
      <div className="mt-3 bg-white rounded-2xl shadow p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400">
            {card.alumni_name?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{card.alumni_name}</h1>
            <p className="text-sm text-slate-500">
              {card.position} · {card.company_name}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {SUIT_SYMBOL[card.suit]} {card.rank} · {card.industry}
            </p>
          </div>
        </div>

        {card.business_desc && (
          <p className="mt-4 text-sm bg-slate-50 rounded-lg p-3 text-slate-600">
            {card.business_desc}
          </p>
        )}

        <div className="mt-4">
          <Field label="毕业年份" value={card.graduation_year} />
          <Field label="学院" value={card.college} />
          <Field label="专业" value={card.major} />
          <Field label="公司地址" value={card.company_address} />
          <Field label="创立年份" value={card.founded_year} />
          <Field label="团队规模" value={card.team_size} />
          <Field label="联系电话" value={card.contact_phone} />
          <Field label="微信" value={card.wechat} />
          <Field label="邮箱" value={card.email} />
          <Field label="个人感言" value={card.alumni_quote} />
        </div>
      </div>
    </div>
  )
}
