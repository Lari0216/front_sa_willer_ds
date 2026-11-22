import Spinner from './Spinner'

/** Carregamento de tela inteira — usado como fallback do Suspense (troca de página). */
export default function PageLoader({ label = 'Carregando página…' }) {
  return (
    <div className="page-loader">
      <Spinner size={36} label={label} />
    </div>
  )
}
