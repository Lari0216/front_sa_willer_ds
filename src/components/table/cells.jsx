import Icon from '../ui/Icon'
import { formatCurrency } from '../../utils/format'
import { STATUS_LABEL, TIPO_LABEL } from '../../utils/categorias'

/** Valor com sinal: receitas em verde (+), despesas em vermelho (−). O sinal garante leitura sem depender da cor. */
export function Amount({ value, tipo }) {
  const negative = tipo === 'despesa'
  return (
    <span className={`amount ${negative ? 'amount--negative' : 'amount--positive'}`}>
      {negative ? '− ' : '+ '}
      {formatCurrency(value)}
    </span>
  )
}

export function TipoBadge({ tipo }) {
  return (
    <span className={`badge badge--${tipo}`}>
      <Icon name={tipo === 'receita' ? 'arrowUp' : 'arrowDown'} size={13} strokeWidth={2.2} />
      {TIPO_LABEL[tipo]}
    </span>
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`status status--${status}`}>
      <Icon name={status === 'pendente' ? 'clock' : 'checkCircle'} size={15} />
      {STATUS_LABEL[status]}
    </span>
  )
}
