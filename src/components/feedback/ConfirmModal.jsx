import { useState } from 'react'
import Modal from './Modal'
import Button from '../ui/Button'

/** Pede confirmação antes de uma ação destrutiva. `onConfirm` pode ser assíncrono (mostra loading). */
export default function ConfirmModal({ open, title, children, confirmLabel = 'Confirmar', onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)

  const confirmar = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      icon="trash"
      tone="danger"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading} data-autofocus>
            Cancelar
          </Button>
          <Button variant="danger" icon="trash" onClick={confirmar} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
