import { memo, useEffect } from 'react'
import { NavLink } from 'react-router'
import Icon from '../ui/Icon'
import Logo from '../ui/Logo'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getInitials } from '../../utils/format'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/transacoes', label: 'Transações', icon: 'list' },
]

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const toast = useToast()

  // Fecha o menu (no celular) com a tecla Esc.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleLogout = () => {
    logout()
    toast.info('Você saiu do sistema.', { title: 'Até logo!' })
  }

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Menu principal">
        <div className="sidebar__header">
          <Logo />
          <button type="button" className="icon-button sidebar__close" onClick={onClose} aria-label="Fechar menu">
            <Icon name="x" />
          </button>
        </div>

        <nav className="sidebar__nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="sidebar__link" onClick={onClose}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="avatar-initials" aria-hidden="true">
              {getInitials(user?.nome)}
            </span>
            <div className="sidebar__user-info">
              <strong>{user?.nome}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="sidebar__link sidebar__logout" onClick={handleLogout}>
            <Icon name="logout" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default memo(Sidebar)
