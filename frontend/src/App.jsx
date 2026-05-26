import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import CardWall from './pages/CardWall'
import CardDetail from './pages/CardDetail'
import SpecialDetail from './pages/SpecialDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import GameList from './pages/GameList'
import GameGuard from './components/GameGuard'
import { PUBLIC_GAMES } from './config/gameRegistry'
import { ensureDemoToken, getToken } from './api'

export default function App() {
  const loc = useLocation()
  const [authReady, setAuthReady] = useState(false)
  const [logged, setLogged] = useState(!!getToken())
  const onHome = loc.pathname === '/'

  useEffect(() => {
    ensureDemoToken()
      .then(() => setLogged(true))
      .catch(() => setLogged(!!getToken()))
      .finally(() => setAuthReady(true))
  }, [])

  if (loc.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    )
  }

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-tint">
        <div className="text-sm text-school/70">正在进入演示账号...</div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col bg-school-tint">
      {!onHome && (
        <header className="bg-school text-white px-4 py-2.5 sticky top-0 z-10 shadow-card">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo-zspt-white.png"
              alt="中山职业技术学院"
              className="h-7 w-auto object-contain"
            />
            <span className="text-sm font-bold border-l border-white/30 pl-3">
              我们的王牌
            </span>
          </Link>
        </header>
      )}

      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<CardWall />} />
          <Route path="/card/:key" element={<CardDetail />} />
          <Route path="/special/:type" element={<SpecialDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/games" element={<GameList />} />
          {PUBLIC_GAMES.map(({ gameId, route, component: GamePage }) => (
            <Route
              key={gameId}
              path={route}
              element={<GameGuard gameId={gameId}><GamePage /></GameGuard>}
            />
          ))}
          <Route path="*" element={<CardWall />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-school/15 flex text-xs text-center shadow-[0_-4px_16px_-8px_rgba(0,58,102,0.18)]">
        {[
          { to: '/', label: '牌墙', icon: '♠' },
          { to: '/games', label: '游戏', icon: '🎮' },
          { to: '/login', label: logged ? '我的' : '登录', icon: '◆' },
        ].map((tab) => {
          const active = tab.to === '/games'
            ? loc.pathname.startsWith('/game')
            : loc.pathname === tab.to
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex-1 py-2.5 ${
                active ? 'text-school font-semibold' : 'text-slate-400'
              }`}
            >
              <div className={`text-base ${active ? 'text-school' : ''}`}>{tab.icon}</div>
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
