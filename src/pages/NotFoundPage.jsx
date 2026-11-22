import { Link } from 'react-router'
import EmptyState from '../components/feedback/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <EmptyState
        icon="alertCircle"
        title="Página não encontrada"
        description="O endereço acessado não existe ou foi removido."
        action={
          <Link to="/dashboard" className="btn btn--primary btn--md">
            Ir para o dashboard
          </Link>
        }
      />
    </div>
  )
}
