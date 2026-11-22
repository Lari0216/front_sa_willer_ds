import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

/**
 * Só renderiza o conteúdo se houver usuário logado; senão manda para /login.
 * Guarda a página de origem (para voltar após o login), exceto quando a pessoa saiu pelo botão "Sair" —
 * nesse caso o próximo login, que pode ser de outra pessoa, começa no dashboard.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, motivoSaida } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={motivoSaida === 'logout' ? null : { from: location.pathname }} />
  }
  return children
}

/** Rotas públicas (login): quem já está logado volta para a página de origem (ou o dashboard). */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Navigate to={location.state?.from ?? '/dashboard'} replace /> : children
}
