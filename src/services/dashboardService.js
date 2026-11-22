import { USE_MOCK } from '../config'
import { request } from './http'
import { mockApi } from './mock/mockApi'

const toNumber = (value) => Number(value) || 0

/**
 * Garante o formato esperado pela UI mesmo que o back omita algum campo.
 *
 * Contrato — GET /dashboard?periodo=3m|6m|12m
 * {
 *   resumo:     { saldoAtual, receitas, despesas, receitasAnterior, despesasAnterior },
 *   mensal:     [{ mes: 'AAAA-MM', receitas, despesas, saldo }],
 *   categorias: [{ categoria, valor }]   // despesas por categoria no período
 * }
 */
function normalize(dados) {
  const resumo = dados?.resumo ?? {}
  return {
    resumo: {
      saldoAtual: toNumber(resumo.saldoAtual),
      receitas: toNumber(resumo.receitas),
      despesas: toNumber(resumo.despesas),
      receitasAnterior: toNumber(resumo.receitasAnterior),
      despesasAnterior: toNumber(resumo.despesasAnterior),
    },
    mensal: (dados?.mensal ?? []).map((m) => ({
      mes: String(m.mes).slice(0, 7),
      receitas: toNumber(m.receitas),
      despesas: toNumber(m.despesas),
      saldo: toNumber(m.saldo),
    })),
    categorias: (dados?.categorias ?? [])
      .map((c) => ({ categoria: c.categoria, valor: toNumber(c.valor) }))
      .sort((a, b) => b.valor - a.valor),
  }
}

export async function getDashboard({ periodo }, { signal } = {}) {
  const dados = USE_MOCK
    ? await mockApi.getDashboard({ periodo }, { signal })
    : await request('/dashboard', { params: { periodo }, signal })
  return normalize(dados)
}
