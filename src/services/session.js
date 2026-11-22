// Persistência da sessão no localStorage (mesmas chaves usadas no login original).

const TOKEN_KEY = 'token'
const REFRESH_KEY = 'refreshToken'
const USER_KEY = 'usuario'

function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function getToken() {
  return safeGet(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = safeGet(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession({ accessToken, refreshToken, usuario }) {
  try {
    localStorage.setItem(TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  } catch {
    // Navegação privada ou armazenamento bloqueado: a sessão dura só enquanto a aba estiver aberta.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}
