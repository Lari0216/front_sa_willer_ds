import { memo } from 'react'
import Icon from '../ui/Icon'
import Skeleton from '../feedback/Skeleton'
import { formatPercent } from '../../utils/format'

/**
 * Cartão de indicador (KPI).
 * delta: variação em fração (0.12 = +12%) em relação ao período anterior.
 * upIsGood: define se subir é bom (receitas) ou ruim (despesas) — controla a cor da variação.
 */
function KpiCard({ label, value, icon, tone = 'blue', delta = null, deltaLabel = 'vs. período anterior', upIsGood = true, hint, loading }) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta)
  const up = hasDelta && delta >= 0
  const good = hasDelta && (up === upIsGood || delta === 0)

  return (
    <article className="card kpi-card">
      <div className="kpi-card__top">
        <h3 className="kpi-card__label">{label}</h3>
        <span className={`kpi-card__icon kpi-card__icon--${tone}`} aria-hidden="true">
          <Icon name={icon} size={20} />
        </span>
      </div>

      {loading ? (
        <>
          <Skeleton width="70%" height={30} />
          <Skeleton width="50%" height={14} />
        </>
      ) : (
        <>
          <p className="kpi-card__value">{value}</p>
          {hasDelta ? (
            <p className={`kpi-card__delta ${good ? 'is-good' : 'is-bad'}`}>
              <Icon name={up ? 'trendingUp' : 'trendingDown'} size={16} />
              <strong>
                {up ? '+' : '−'}
                {formatPercent(Math.abs(delta))}
              </strong>
              <span>{deltaLabel}</span>
            </p>
          ) : (
            hint && <p className="kpi-card__hint">{hint}</p>
          )}
        </>
      )}
    </article>
  )
}

export default memo(KpiCard)
