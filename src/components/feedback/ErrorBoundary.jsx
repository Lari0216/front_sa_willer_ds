import { Component } from 'react'

/** Captura erros de renderização para a tela não ficar em branco. */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Ponto ideal para enviar o erro a um serviço de monitoramento (Sentry, etc.).
    console.error('Erro não tratado na interface:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="fatal-error" role="alert">
        <h1>Algo deu errado</h1>
        <p>Ocorreu um erro inesperado na interface. Recarregue a página para continuar.</p>
        <button type="button" className="btn btn--primary btn--md" onClick={() => window.location.reload()}>
          Recarregar página
        </button>
      </div>
    )
  }
}
