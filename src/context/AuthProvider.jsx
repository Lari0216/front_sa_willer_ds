import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './contexts'
import { login as loginRequest } from '../services/authService'
import { onUnauthorized } from '../services/http'
import { clearSession, getStoredUser, getToken, saveSession } from '../services/session'
import { useToast } from '../hooks/useToast'

function readInitialUser() {
  return getToken() ? getStoredUser() ?? { nome: 'Usuário', email: '' } : null
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readInitialUser)
  // 'logout' (saiu pelo botão) ou 'expirou' (401). Define se o próximo login volta para a página anterior.
  const [motivoSaida, setMotivoSaida] = useState(null)
  const toast = useToast()

  const login = useCallback(async (credenciais) => {
    const sessao = await loginRequest(credenciais)
    saveSession(sessao)
    setUser(sessao.usuario)
    setMotivoSaida(null)
    return sessao.usuario
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setMotivoSaida('logout')
  }, [])

  // Qualquer resposta 401 da API encerra a sessão; o <ProtectedRoute> redireciona para o login.
  useEffect(
    () =>
      onUnauthorized(() => {
        clearSession()
        setUser(null)
        setMotivoSaida('expirou')
        toast.warning('Sua sessão expirou. Faça login novamente.', { title: 'Sessão encerrada' })
      }),
    [toast],
  )

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), motivoSaida, login, logout }), [user, motivoSaida, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
