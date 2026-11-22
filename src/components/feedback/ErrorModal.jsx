import Modal from './Modal'
import Button from '../ui/Button'

/** Modal de erro com opção de tentar novamente (usado quando uma requisição falha). */
export default function ErrorModal({ open, error, title = 'Não foi possível carregar os dados', onRetry, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon="alertTriangle"
      tone="danger"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          {onRetry && (
            <Button
              icon="refresh"
              onClick={() => {
                onClose?.()
                onRetry()
              }}
              data-autofocus
            >
              Tentar novamente
            </Button>
          )}
        </>
      }
    >
      <p>{error?.message ?? 'Ocorreu um erro inesperado.'}</p>
      {error?.status ? <p className="modal__meta">Código do erro: {error.status}</p> : null}
    </Modal>
  )
}
