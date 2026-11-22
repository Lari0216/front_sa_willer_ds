import { formatCurrency } from '../../utils/format'

/**
 * Tooltip customizado para os gráficos do Recharts.
 * `extraRows(payload)` permite acrescentar linhas calculadas (ex.: resultado do mês).
 */
export default function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter = formatCurrency, extraRows }) {
  if (!active || !payload?.length) return null

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{labelFormatter ? labelFormatter(label, payload) : label}</p>
      <ul>
        {payload.map((item) => (
          <li key={item.dataKey}>
            <span className="chart-tooltip__swatch" style={{ background: item.color ?? item.payload?.fill }} aria-hidden="true" />
            <span className="chart-tooltip__name">{item.name}</span>
            <span className="chart-tooltip__value">{valueFormatter(item.value, item)}</span>
          </li>
        ))}
        {extraRows?.(payload).map((row) => (
          <li key={row.label} className="chart-tooltip__extra">
            <span className="chart-tooltip__name">{row.label}</span>
            <span className="chart-tooltip__value">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
