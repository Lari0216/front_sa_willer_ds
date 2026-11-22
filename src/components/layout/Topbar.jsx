import { memo } from 'react'
import { useLocation } from 'react-router'
import Icon from '../ui/Icon'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../utils/format'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/transacoes': 'Transações',
}

const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

function Topbar({ onOpenMenu }) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <header className="topbar">
      <button type="button" className="icon-button topbar__menu" onClick={onOpenMenu} aria-label="Abrir menu">
        <Icon name="menu" size={22} />
      </button>
      <h1 className="topbar__title">{TITLES[pathname] ?? 'Gestão Financeira'}</h1>
      <div className="topbar__right">
        <span className="topbar__date">{today.format(new Date())}</span>
        <span className="avatar-initials avatar-initials--sm" title={user?.nome} aria-hidden="true">
          {getInitials(user?.nome)}
        </span>
      </div>
    </header>
  )
}

export default memo(Topbar)
