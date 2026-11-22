import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import ErrorBoundary from './components/feedback/ErrorBoundary'
import ToastProvider from './components/feedback/ToastProvider'
import PageLoader from './components/feedback/PageLoader'
import AuthProvider from './context/AuthProvider'
import AppLayout from './components/layout/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute'

// Code splitting: cada página vira um arquivo JS separado, baixado só quando acessada.
// O Recharts (pesado) fica fora do bundle inicial e só carrega ao abrir o dashboard.
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TransacoesPage = lazy(() => import('./pages/TransacoesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/transacoes" element={<TransacoesPage />} />
                </Route>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
