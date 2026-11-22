// Formatadores criados uma única vez (Intl é caro para instanciar a cada render).

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const currencyCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })
const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' })
const monthLong = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

export const formatCurrency = (value) => currency.format(value ?? 0)

/** R$ 12,3 mil — usado em eixos de gráfico e valores muito grandes. */
export const formatCurrencyCompact = (value) => (Math.abs(value) < 10000 ? currency.format(Math.round(value)).replace(/,00$/, '') : currencyCompact.format(value))

export const formatPercent = (value) => percent.format(value ?? 0)

/** Converte 'AAAA-MM-DD' em Date local (sem o deslocamento de fuso do `new Date(string)`). */
export function parseISODate(iso) {
  const [y, m, d = 1] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const monthKey = (date) => toISODate(date).slice(0, 7)

/** '2026-03-09' → '09/03/2026' */
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

/** '2026-03' → 'mar/26' */
export const formatMonthShort = (mes) => monthShort.format(parseISODate(mes)).replace('. de ', '/').replace(' de ', '/').replace('.', '')

/** '2026-03' → 'março de 2026' */
export const formatMonthLong = (mes) => monthLong.format(parseISODate(mes))

/** Variação percentual entre dois valores; null quando não há base de comparação. */
export function percentChange(current, previous) {
  if (!previous) return null
  return (current - previous) / Math.abs(previous)
}

/** 'Maria da Silva' → 'MS' */
export function getInitials(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  return (partes[0][0] + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase()
}

/**
 * Converte o valor digitado pelo usuário em número.
 * Aceita "1234,56", "1.234,56", "1234.56", "R$ 50" → 1234.56 / 1234.56 / 1234.56 / 50. Retorna NaN se inválido.
 */
export function parseValor(texto) {
  let limpo = String(texto ?? '').replace(/R\$|\s/g, '')
  if (!limpo) return NaN
  if (limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) limpo = limpo.replace(/\./g, '') // "1.234" = mil duzentos...
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return NaN
  return Number(limpo)
}

/** 1234.5 → "1234,50" (para preencher o campo de valor na edição) */
export const valorParaCampo = (valor) => Number(valor).toFixed(2).replace('.', ',')
