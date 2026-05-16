// 统一 API 封装。开发期 /api 由 Vite 代理到 Flask:5000。
// 后端统一响应:{ code, message, data }。code!==0 视为业务错误。

const TOKEN_KEY = 'poker_access_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (json.code !== 0) {
    const err = new Error(json.message || '请求失败')
    err.code = json.code
    throw err
  }
  return json.data
}

export const api = {
  listCards: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v),
    ).toString()
    return request(`/cards${qs ? `?${qs}` : ''}`)
  },
  getCard: (key) => request(`/cards/${encodeURIComponent(key)}`),
  listSpecial: () => request('/special-cards'),
  sendCode: (phone) =>
    request('/auth/send-code', { method: 'POST', body: { phone } }),
  login: (phone, code) =>
    request('/auth/login', { method: 'POST', body: { phone, code } }),
  profile: () => request('/user/profile', { auth: true }),
  leaderboard: (game) =>
    request(`/leaderboard${game ? `?game=${game}` : ''}`),
}
