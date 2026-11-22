/** Indicador de carregamento circular. `label` é lido por leitores de tela (null = decorativo). */
export default function Spinner({ size = 24, label = 'Carregando…', className = '' }) {
  return (
    <span className={`spinner ${className}`.trim()} style={{ '--spinner-size': `${size}px` }} role={label ? 'status' : undefined}>
      {label && <span className="sr-only">{label}</span>}
    </span>
  )
}
