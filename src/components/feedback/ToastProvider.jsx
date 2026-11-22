import { memo, useCallback, useMemo, useState } from 'react'
import { ToastContext } from '../../context/contexts'
import Icon from '../ui/Icon'

const MAX_VISIBLE = 4
const ICONS = { success: 'checkCircle', error: 'alertCircle', warning: 'alertTriangle', info: 'info' }
const DEFAULT_TITLES = { success: 'Sucesso', error: 'Erro', warning: 'Atenção', info: 'Informação' }

let nextId = 0

/**
 * Fornece `useToast()` para toda a aplicação.
 * O valor do contexto é estável (useMemo), então quem só dispara toasts não re-renderiza
 * quando a lista de toasts muda — apenas o <ToastViewport> é atualizado.
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const api = useMemo(() => {
    const show = (type, message, { title, duration } = {}) => {
      nextId += 1
      const toast = {
        id: nextId,
        type,
        message,
        title: title ?? DEFAULT_TITLES[type],
        duration: duration ?? (type === 'error' ? 6500 : 4000),
      }
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), toast])
      return toast.id
    }
    return {
      show,
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      warning: (message, options) => show('warning', message, options),
      info: (message, options) => show('info', message, options),
      dismiss,
    }
  }, [dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <section className="toast-viewport" aria-label="Notificações">
      {/* Regiões "live" sempre montadas para que leitores de tela anunciem novas mensagens. */}
      <div role="status" aria-live="polite" className="toast-stack">
        {toasts.filter((t) => t.type !== 'error').map((t) => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
      <div role="alert" aria-live="assertive" className="toast-stack">
        {toasts.filter((t) => t.type === 'error').map((t) => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
    </section>
  )
}

// O tempo de exibição é controlado pela animação CSS da barra de progresso:
// ao passar o mouse (ou focar) ela pausa, e quando termina o toast é removido.
const ToastItem = memo(function ToastItem({ toast, onDismiss }) {
  return (
    <div className={`toast toast--${toast.type}`} style={{ '--toast-duration': `${toast.duration}ms` }}>
      <span className="toast__icon">
        <Icon name={ICONS[toast.type]} size={20} />
      </span>
      <div className="toast__body">
        <p className="toast__title">{toast.title}</p>
        <p className="toast__message">{toast.message}</p>
      </div>
      <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Fechar notificação">
        <Icon name="x" size={16} />
      </button>
      <span className="toast__progress" onAnimationEnd={() => onDismiss(toast.id)} aria-hidden="true" />
    </div>
  )
})
