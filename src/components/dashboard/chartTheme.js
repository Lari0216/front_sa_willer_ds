// Cores dos gráficos. Receitas e despesas usam os slots 1 e 2 de uma paleta categórica
// validada para daltonismo (azul/laranja) — a mesma cor segue a mesma entidade em todos os gráficos.
export const CHART_COLORS = {
  receitas: '#2a78d6',
  despesas: '#eb6834',
  saldo: '#2a78d6',
  grid: '#e6e9f0',
  axis: '#c9d1df',
  tick: '#6b7a99',
  label: '#4a5672',
  surface: '#ffffff',
  cursor: 'rgba(24, 95, 165, 0.06)',
}

export const AXIS_TICK = { fill: CHART_COLORS.tick, fontSize: 12 }
