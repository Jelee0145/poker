import { Routes, Route, Link, useLocation } from 'react-router-dom'
import CardWall from './pages/CardWall'
import CardDetail from './pages/CardDetail'
import Login from './pages/Login'
import { getToken } from './api'

// 移动端优先外壳:顶部标题 + 路由出口 + 底部导航。
export default function App() {
  const loc = useLocation()
  const logged = !!getToken()

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-10 shadow">
        <Link to="/">
          <h1 className="text-lg font-bold">我们的王牌</h1>
          <p className="text-[11px] text-slate-300">中山职业技术学院 · 创业校友扑克</p>
        </Link>
      </header>

      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<CardWall />} />
          <Route path="/card/:key" element={<CardDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<CardWall />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex text-xs text-center">
        {[
          { to: '/', label: '牌墙' },
          { to: '/login', label: logged ? '已登录' : '登录' },
        ].map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`flex-1 py-3 ${
              loc.pathname === t.to ? 'text-slate-900 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
