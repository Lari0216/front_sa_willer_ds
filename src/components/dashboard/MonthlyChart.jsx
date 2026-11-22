import { memo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartTooltip from './ChartTooltip'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'
import { formatCurrency, formatCurrencyCompact, formatMonthLong, formatMonthShort } from '../../utils/format'

const resultadoDoMes = (payload) => {
  const { receitas = 0, despesas = 0 } = payload[0]?.payload ?? {}
  return [{ label: 'Resultado', value: formatCurrency(receitas - despesas) }]
}

/** Colunas agrupadas: receitas x despesas por mês. */
function MonthlyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={2} barCategoryGap="24%">
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="mes"
          tickFormatter={formatMonthShort}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.axis }}
          interval="preserveStartEnd"
          minTickGap={10}
        />
        <YAxis tickFormatter={formatCurrencyCompact} tick={AXIS_TICK} tickLine={false} axisLine={false} width={76} />
        <Tooltip
          cursor={{ fill: CHART_COLORS.cursor }}
          content={<ChartTooltip labelFormatter={formatMonthLong} extraRows={resultadoDoMes} />}
        />
        <Bar dataKey="receitas" name="Receitas" fill={CHART_COLORS.receitas} radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={700} />
        <Bar dataKey="despesas" name="Despesas" fill={CHART_COLORS.despesas} radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={700} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// memo: só redesenha quando `data` muda (troca de período), não a cada render da página.
export default memo(MonthlyChart)
