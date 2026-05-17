import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'

// 手机号 + 验证码登录(新号自动注册)。验证码当前为后端桩,看日志。
export default function Login() {
  const nav = useNavigate()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [cd, setCd] = useState(0)
  const [msg, setMsg] = useState('')

  async function send() {
    setMsg('')
    try {
      await api.sendCode(phone)
      setMsg('验证码已发送(开发期看后端日志)')
      setCd(60)
      const t = setInterval(
        () => setCd((c) => (c <= 1 ? (clearInterval(t), 0) : c - 1)),
        1000,
      )
    } catch (e) {
      setMsg(e.message)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    try {
      const d = await api.login(phone, code)
      setToken(d.access_token)
      nav('/')
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="max-w-xs mx-auto p-6 mt-8">
      <div className="rounded-3xl bg-white shadow-card p-6">
        <div className="-mx-6 -mt-6 mb-5 px-6 py-4 bg-gradient-to-r from-school to-school-dark rounded-t-3xl">
          <img
            src="/logo-zspt-white.png"
            alt="中山职业技术学院"
            className="h-8 w-auto object-contain"
          />
        </div>
        <h1 className="text-lg font-extrabold text-school-deep">登录 / 注册</h1>
        <p className="text-xs text-slate-400 mb-5">手机号 + 验证码,新号自动注册</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="手机号"
            inputMode="numeric"
            className="w-full px-4 py-2.5 rounded-xl bg-school-light text-sm
                       outline-none focus:ring-2 focus:ring-school"
          />
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="验证码"
              inputMode="numeric"
              className="flex-1 px-4 py-2.5 rounded-xl bg-school-light text-sm
                         outline-none focus:ring-2 focus:ring-school"
            />
            <button
              type="button"
              disabled={cd > 0 || phone.length !== 11}
              onClick={send}
              className="px-4 py-2.5 text-sm rounded-xl font-medium
                         bg-school-light text-school-dark disabled:opacity-40"
            >
              {cd > 0 ? `${cd}s` : '获取'}
            </button>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-school text-white font-semibold hover:bg-school-dark transition">
            登录
          </button>
        </form>
        {msg && <p className="mt-3 text-xs text-slate-500">{msg}</p>}
      </div>
    </div>
  )
}
