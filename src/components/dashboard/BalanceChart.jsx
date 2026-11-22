import { memo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartTooltip from './ChartTooltip'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'
import { formatCurrencyCompact, formatMonthLong, formatMonthShort } from '../../utils/format'

const yDomain = [(dataMin) => Math.min(0, dataMin), 'auto']

/** Linha com área: saldo acumulado ao fim de cada mês. */
function BalanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
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
        <YAxis tickFormatter={formatCurrencyCompact} tick={AXIS_TICK} tickLine={false} axisLine={false} width={76} domain={yDomain} />
        <Tooltip
          cursor={{ stroke: CHART_COLORS.axis, strokeWidth: 1 }}
          content={<ChartTooltip labelFormatter={formatMonthLong} />}
        />
        <Area
          type="monotone"
          dataKey="saldo"
          name="Saldo"
          stroke={CHART_COLORS.saldo}
          strokeWidth={2}
          fill={CHART_COLORS.saldo}
          fillOpacity={0.1}
          animationDuration={800}
          dot={{ r: 4, fill: CHART_COLORS.saldo, stroke: CHART_COLORS.surface, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: CHART_COLORS.saldo, stroke: CHART_COLORS.surface, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default memo(BalanceChart)
