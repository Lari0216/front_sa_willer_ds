import { memo, useMemo } from 'react'
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartTooltip from './ChartTooltip'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../../utils/format'

/** Barras horizontais ordenadas: despesas por categoria (mais fácil de comparar que um gráfico de pizza). */
function CategoryChart({ data }) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.valor, 0), [data])

  const valueFormatter = (value) => `${formatCurrency(value)} (${formatPercent(total ? value / total : 0)})`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 88, left: 0, bottom: 0 }} barCategoryGap="22%">
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis type="category" dataKey="categoria" tick={AXIS_TICK} tickLine={false} axisLine={false} width={92} />
        <Tooltip cursor={{ fill: CHART_COLORS.cursor }} content={<ChartTooltip valueFormatter={valueFormatter} />} />
        <Bar dataKey="valor" name="Despesas" fill={CHART_COLORS.despesas} radius={[0, 4, 4, 0]} maxBarSize={20} animationDuration={700}>
          <LabelList dataKey="valor" position="right" formatter={formatCurrencyCompact} fill={CHART_COLORS.label} fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default memo(CategoryChart)
