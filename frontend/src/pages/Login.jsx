import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ensureDemoToken, getToken, setToken } from '../api'

export default function Login() {
  const nav = useNavigate()
  const [profile, setProfile] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ensureDemoToken()
      .then(() => api.profile())
      .then((data) => setProfile(data))
      .catch((err) => setMsg(err.message || '演示账号初始化失败'))
  }, [])

  async function refreshDemoToken() {
    setMsg('')
    setToken('')
    try {
      await ensureDemoToken()
      const data = await api.profile()
      setProfile(data)
      setMsg('演示账号令牌已刷新')
    } catch (err) {
      setMsg(err.message || '刷新失败')
    }
  }

  function logoutDemo() {
    setToken('')
    setProfile(null)
    setMsg('已清除本地令牌，刷新页面后会自动重新进入演示账号')
  }

  return (
    <div className="max-w-sm mx-auto p-6 mt-8">
      <div className="rounded-3xl bg-white shadow-card p-6">
        <div className="-mx-6 -mt-6 mb-5 px-6 py-4 bg-gradient-to-r from-school to-school-dark rounded-t-3xl">
          <img
            src="/logo-zspt-white.png"
            alt="中山职业技术学院"
            className="h-8 w-auto object-contain"
          />
        </div>

        <h1 className="text-lg font-extrabold text-school-deep">演示账号</h1>
        <p className="text-sm text-slate-500 mt-2">
          当前分支已临时移除短信登录。页面进入时会自动申请演示令牌。
        </p>

        <div className="mt-5 rounded-2xl bg-school-light/70 p-4 space-y-2 text-sm text-slate-600">
          <div>
            <span className="font-semibold text-school-deep">本地令牌：</span>
            {getToken() ? '已存在' : '未写入'}
          </div>
          <div>
            <span className="font-semibold text-school-deep">手机号：</span>
            {profile?.phone || '加载中'}
          </div>
          <div>
            <span className="font-semibold text-school-deep">昵称：</span>
            {profile?.nickname || 'Railway Demo'}
          </div>
          <div>
            <span className="font-semibold text-school-deep">积分：</span>
            {profile?.points ?? '--'}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => nav('/games')}
            className="flex-1 py-2.5 rounded-xl bg-school text-white font-semibold hover:bg-school-dark transition"
          >
            去游戏页
          </button>
          <button
            onClick={refreshDemoToken}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
          >
            刷新令牌
          </button>
        </div>

        <button
          onClick={logoutDemo}
          className="mt-3 w-full py-2.5 rounded-xl bg-slate-50 text-slate-500 font-medium hover:bg-slate-100 transition"
        >
          清除本地令牌
        </button>

        {msg && <p className="mt-3 text-xs text-slate-500">{msg}</p>}
      </div>
    </div>
  )
}
