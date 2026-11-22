import { useEffect, useId, useRef } from 'react'
import Icon from '../ui/Icon'

/**
 * Modal acessível baseado no elemento nativo <dialog>:
 * prende o foco dentro dele, fecha com Esc e com clique no fundo escurecido,
 * e devolve o foco ao elemento que o abriu.
 */
export default function Modal({ open, onClose, title, icon, tone = 'default', children, footer, size = 'sm' }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Foca a ação principal marcada com data-autofocus (senão o navegador foca o primeiro botão).
      dialog.querySelector('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  const handleCancel = (event) => {
    event.preventDefault() // Esc: deixa o React controlar o estado `open`
    onClose?.()
  }

  const handleClick = (event) => {
    if (event.target === dialogRef.current) onClose?.() // clique no backdrop
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size} modal--${tone}`}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      {open && (
        <div className="modal__content">
          <header className="modal__header">
            {icon && (
              <span className="modal__icon">
                <Icon name={icon} size={22} />
              </span>
            )}
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
              <Icon name="x" size={18} />
            </button>
          </header>
          <div className="modal__body">{children}</div>
          {footer && <footer className="modal__footer">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
