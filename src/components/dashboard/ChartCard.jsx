import { useState } from 'react'
import Icon from '../ui/Icon'
import Skeleton from '../feedback/Skeleton'
import EmptyState from '../feedback/EmptyState'
import DataTable from '../table/DataTable'

/**
 * Moldura padrão dos gráficos: título, legenda, alternância gráfico ⇄ tabela (acessibilidade),
 * skeleton de carregamento e estado vazio.
 */
export default function ChartCard({ title, subtitle, legend, loading, isEmpty, height = 280, table, className = '', children }) {
  const [showTable, setShowTable] = useState(false)

  let content
  if (loading) content = <Skeleton height={height} radius={10} />
  else if (isEmpty) content = <EmptyState icon="chart" title="Sem dados para o período" description="Tente selecionar outro período." />
  else if (showTable && table) content = <DataTable columns={table.columns} data={table.data} rowKey={table.rowKey} caption={title} paginated={false} compact />
  else content = <div style={{ height }}>{children}</div>

  return (
    <section className={`card chart-card ${className}`.trim()} aria-label={title}>
      <header className="chart-card__header">
        <div>
          <h2 className="card__title">{title}</h2>
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
        {table && !loading && !isEmpty && (
          <button
            type="button"
            className="chip-button"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
          >
            <Icon name={showTable ? 'chart' : 'table'} size={15} />
            {showTable ? 'Ver gráfico' : 'Ver tabela'}
          </button>
        )}
      </header>

      {legend && !showTable && !loading && !isEmpty && (
        <ul className="chart-legend">
          {legend.map((item) => (
            <li key={item.label}>
              <span className="chart-legend__swatch" style={{ background: item.color }} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      )}

      {content}
    </section>
  )
}
