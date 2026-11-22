import { USE_MOCK } from '../config'
import { request } from './http'
import { mockApi } from './mock/mockApi'

/**
 * Contrato da API:
 *   GET    /transacoes          → [{ id, data: 'AAAA-MM-DD', descricao, categoria, tipo: 'receita'|'despesa', valor, status: 'concluida'|'pendente' }]
 *                                 (também aceita { dados: [...] })
 *   POST   /transacoes          ← { descricao, valor, tipo, categoria, data, status }  → transação criada
 *   PUT    /transacoes/:id      ← { descricao, valor, tipo, categoria, data, status }  → transação atualizada
 *   DELETE /transacoes/:id      → 204
 *
 * Busca, filtros, ordenação e paginação são feitos no front (DataTable).
 */
function normalizeItem(t) {
  return {
    id: t.id,
    data: String(t.data).slice(0, 10),
    descricao: t.descricao ?? '',
    categoria: t.categoria ?? 'Outros',
    tipo: t.tipo === 'receita' ? 'receita' : 'despesa',
    valor: Math.abs(Number(t.valor) || 0),
    status: t.status === 'pendente' ? 'pendente' : 'concluida',
  }
}

function normalize(lista) {
  const itens = Array.isArray(lista) ? lista : (lista?.dados ?? [])
  return itens.map(normalizeItem)
}

/** Monta o corpo enviado ao back (só os campos do contrato). */
function toPayload({ descricao, valor, tipo, categoria, data, status }) {
  return { descricao: descricao.trim(), valor: Number(valor), tipo, categoria, data, status }
}

/** `limite` é opcional (o back pode ignorar); a lista sempre vem da mais recente para a mais antiga. */
export async function getTransacoes({ limite, signal } = {}) {
  const dados = USE_MOCK
    ? await mockApi.getTransacoes({ signal })
    : await request('/transacoes', { params: { limite }, signal })
  // sort estável: no mesmo dia mantém a ordem que veio do servidor
  const lista = normalize(dados).sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
  return limite ? lista.slice(0, limite) : lista
}

export async function criarTransacao(dados) {
  const payload = toPayload(dados)
  const criada = USE_MOCK ? await mockApi.criarTransacao(payload) : await request('/transacoes', { method: 'POST', body: payload })
  return criada ? normalizeItem({ ...payload, ...criada }) : null
}

export async function atualizarTransacao(id, dados) {
  const payload = toPayload(dados)
  const atualizada = USE_MOCK
    ? await mockApi.atualizarTransacao(id, payload)
    : await request(`/transacoes/${encodeURIComponent(id)}`, { method: 'PUT', body: payload })
  return normalizeItem({ id, ...payload, ...(atualizada ?? {}) })
}

export async function excluirTransacao(id) {
  if (USE_MOCK) await mockApi.excluirTransacao(id)
  else await request(`/transacoes/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
