import { Suspense, useCallback, useState } from 'react'
import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PageLoader from '../feedback/PageLoader'
import { USE_MOCK } from '../../config'

/** Estrutura das páginas logadas: menu lateral + barra superior + conteúdo. */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className="app-shell__main">
        <Topbar onOpenMenu={openMenu} />
        {USE_MOCK && (
          <p className="mock-banner" role="note">
            Modo demonstração: os dados exibidos são simulados (VITE_USE_MOCK=true).
          </p>
        )}
        <main className="app-content" id="conteudo">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
