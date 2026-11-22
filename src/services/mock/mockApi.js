// API simulada: permite desenvolver e publicar o front sem o back-end.
// Ativada com VITE_USE_MOCK=true.
//
// - Só entra quem está cadastrado (e-mail + senha conferidos).
// - A conta de demonstração (contaDemo.js) já vem cadastrada e com ~2 anos de transações de exemplo.
// - Quem se cadastra começa com a conta zerada.
// - Cada usuário tem a própria lista de transações, salva no localStorage do navegador.
//
// Dica: adicione ?simularErro na URL da página para forçar falha nas requisições
// e ver os modais de erro funcionando.

import { ApiError } from '../http'
import { getStoredUser } from '../session'
import { toISODate, monthKey } from '../../utils/format'
import { CONTA_DEMO } from './contaDemo'

const MESES_EXEMPLO = 24

// ---------- utilitários ----------

function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function delay(signal, min = 300, max = 700) {
  const ms = min + Math.random() * (max - min)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Requisição cancelada', 'AbortError'))
      },
      { once: true },
    )
  })
}

function shouldFail() {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('simularErro')
}

async function simulate(signal, producer) {
  await delay(signal)
  if (shouldFail()) {
    throw new ApiError('O servidor retornou um erro ao carregar os dados (simulado).', { status: 500 })
  }
  return producer()
}

const round = (v) => Math.round(v * 100) / 100

const novoId = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

// ---------- "banco de dados" por usuário (localStorage) ----------

const memoria = new Map() // usado se o localStorage estiver bloqueado

const mesmoEmail = (a = '', b = '') => a.trim().toLowerCase() === b.trim().toLowerCase()
const emailAtual = () => getStoredUser()?.email || 'anonimo'
const chaveTransacoes = (email) => `mock:dados:${email.trim().toLowerCase()}`

function lerChave(chave) {
  try {
    const salvo = localStorage.getItem(chave)
    return salvo === null ? null : JSON.parse(salvo)
  } catch {
    return memoria.has(chave) ? memoria.get(chave) : null
  }
}

function gravarChave(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    memoria.set(chave, valor)
  }
}

function lerTransacoes(email = emailAtual()) {
  const salvo = lerChave(chaveTransacoes(email))
  if (salvo) return salvo
  // Primeiro acesso da conta de demonstração: cria os dados de exemplo (depois disso, o que ela alterar fica salvo).
  if (mesmoEmail(email, CONTA_DEMO.email)) {
    const exemplo = gerarExemplo()
    salvarTransacoes(exemplo, email)
    return exemplo
  }
  return []
}

function salvarTransacoes(lista, email = emailAtual()) {
  gravarChave(chaveTransacoes(email), lista)
}

// Mais recentes primeiro; no mesmo dia, a última cadastrada aparece antes.
const ordenar = (lista) => [...lista].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : (b.criadoEm ?? 0) - (a.criadoEm ?? 0)))

// ---------- dados de exemplo ----------

const DESCRICOES = {
  Alimentação: ['Supermercado', 'Padaria', 'Restaurante', 'iFood', 'Feira'],
  Transporte: ['Combustível', 'Uber', 'Estacionamento', 'Manutenção do carro', 'Passagem de ônibus'],
  Saúde: ['Farmácia', 'Consulta médica', 'Exames laboratoriais', 'Plano odontológico'],
  Lazer: ['Cinema', 'Streaming', 'Viagem de fim de semana', 'Show', 'Livraria'],
  Contas: ['Conta de luz', 'Conta de água', 'Internet', 'Celular'],
}

function gerarExemplo() {
  const random = mulberry32(20251)
  const pick = (list) => list[Math.floor(random() * list.length)]
  const money = (min, max) => round(min + random() * (max - min))
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const lista = []
  let seq = 0

  const add = (date, tipo, categoria, descricao, valor) => {
    if (date > hoje) return
    const diasAtras = (hoje - date) / 86400000
    seq += 1
    lista.push({
      id: `ex-${seq}`,
      data: toISODate(date),
      descricao,
      categoria,
      tipo,
      valor,
      status: diasAtras <= 20 && random() < 0.18 ? 'pendente' : 'concluida',
      criadoEm: seq,
    })
  }

  for (let offset = MESES_EXEMPLO - 1; offset >= 0; offset -= 1) {
    const base = new Date(hoje.getFullYear(), hoje.getMonth() - offset, 1)
    const y = base.getFullYear()
    const m = base.getMonth()
    const dia = (d) => new Date(y, m, d)
    const diasNoMes = new Date(y, m + 1, 0).getDate()
    const diaAleatorio = () => dia(1 + Math.floor(random() * diasNoMes))

    // Receitas
    add(dia(5), 'receita', 'Salário', 'Salário mensal', 7800)
    if (random() < 0.65) add(diaAleatorio(), 'receita', 'Freelance', 'Projeto freelance', money(700, 2600))
    add(dia(15), 'receita', 'Investimentos', 'Rendimento CDB', money(120, 420))
    if (random() < 0.25) add(diaAleatorio(), 'receita', 'Outros', 'Reembolso', money(50, 350))
    if (m === 11) add(dia(20), 'receita', 'Salário', '13º salário', 7800)

    // Despesas fixas
    add(dia(10), 'despesa', 'Moradia', 'Aluguel', 1950)
    add(dia(10), 'despesa', 'Moradia', 'Condomínio', 480)
    add(dia(8), 'despesa', 'Educação', 'Curso de inglês', 420)
    DESCRICOES.Contas.forEach((descricao) => add(diaAleatorio(), 'despesa', 'Contas', descricao, money(60, 260)))

    // Despesas variáveis
    const qtdAlimentacao = 8 + Math.floor(random() * 6)
    for (let i = 0; i < qtdAlimentacao; i += 1) add(diaAleatorio(), 'despesa', 'Alimentação', pick(DESCRICOES.Alimentação), money(25, 420))
    const qtdTransporte = 4 + Math.floor(random() * 4)
    for (let i = 0; i < qtdTransporte; i += 1) add(diaAleatorio(), 'despesa', 'Transporte', pick(DESCRICOES.Transporte), money(18, 280))
    const qtdLazer = 2 + Math.floor(random() * 4)
    for (let i = 0; i < qtdLazer; i += 1) add(diaAleatorio(), 'despesa', 'Lazer', pick(DESCRICOES.Lazer), money(30, 650))
    if (random() < 0.6) add(diaAleatorio(), 'despesa', 'Saúde', pick(DESCRICOES.Saúde), money(40, 520))
  }

  return ordenar(lista)
}

// ---------- agregações do dashboard ----------

const PERIODOS = { '3m': 3, '6m': 6, '12m': 12 }

function buildDashboard(periodo, transacoes) {
  const meses = PERIODOS[periodo] ?? 6
  const hoje = new Date()

  const chaveMes = (offset) => monthKey(new Date(hoje.getFullYear(), hoje.getMonth() - offset, 1))
  const mesesPeriodo = Array.from({ length: meses }, (_, i) => chaveMes(meses - 1 - i))
  const mesesAnteriores = new Set(Array.from({ length: meses }, (_, i) => chaveMes(meses * 2 - 1 - i)))
  const noPeriodo = new Set(mesesPeriodo)

  const porMes = new Map(mesesPeriodo.map((mes) => [mes, { receitas: 0, despesas: 0 }]))
  const categorias = new Map()
  let receitas = 0
  let despesas = 0
  let receitasAnterior = 0
  let despesasAnterior = 0
  let saldoAtual = 0
  const variacaoPorMes = new Map()

  for (const t of transacoes) {
    const mes = t.data.slice(0, 7)
    const sinal = t.tipo === 'receita' ? 1 : -1
    saldoAtual += sinal * t.valor
    variacaoPorMes.set(mes, (variacaoPorMes.get(mes) ?? 0) + sinal * t.valor)

    if (noPeriodo.has(mes)) {
      const linha = porMes.get(mes)
      if (t.tipo === 'receita') {
        linha.receitas += t.valor
        receitas += t.valor
      } else {
        linha.despesas += t.valor
        despesas += t.valor
        categorias.set(t.categoria, (categorias.get(t.categoria) ?? 0) + t.valor)
      }
    } else if (mesesAnteriores.has(mes)) {
      if (t.tipo === 'receita') receitasAnterior += t.valor
      else despesasAnterior += t.valor
    }
  }

  // Saldo acumulado no fim de cada mês do período (considera tudo que veio antes).
  const primeiroMes = mesesPeriodo[0]
  let acumulado = 0
  for (const [mes, variacao] of variacaoPorMes) if (mes < primeiroMes) acumulado += variacao

  const mensal = mesesPeriodo.map((mes) => {
    acumulado += variacaoPorMes.get(mes) ?? 0
    const linha = porMes.get(mes)
    return { mes, receitas: round(linha.receitas), despesas: round(linha.despesas), saldo: round(acumulado) }
  })

  return {
    periodo,
    resumo: {
      saldoAtual: round(saldoAtual),
      receitas: round(receitas),
      despesas: round(despesas),
      receitasAnterior: round(receitasAnterior),
      despesasAnterior: round(despesasAnterior),
    },
    mensal,
    categorias: [...categorias.entries()]
      .map(([categoria, valor]) => ({ categoria, valor: round(valor) }))
      .sort((a, b) => b.valor - a.valor),
  }
}

// ---------- contas (usuários cadastrados) ----------
// Atenção: guardar senha no navegador só é aceitável aqui porque é uma SIMULAÇÃO.
// No back-end real a senha fica no servidor, criptografada (hash).

const CONTAS_KEY = 'mock:contas'

const contasCadastradas = () => lerChave(CONTAS_KEY) ?? []
const todasAsContas = () => [CONTA_DEMO, ...contasCadastradas()]
const buscarConta = (email) => todasAsContas().find((conta) => mesmoEmail(conta.email, email))

function campos({ descricao, valor, tipo, categoria, data, status }) {
  return { descricao, valor: round(Number(valor)), tipo, categoria, data, status }
}

// ---------- endpoints simulados ----------

export const mockApi = {
  async login({ email, senha }) {
    await delay()
    const conta = buscarConta(email)
    if (!conta || conta.senha !== senha) throw new ApiError('E-mail ou senha inválidos.', { status: 401 })
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      usuario: { nome: conta.nome, email: conta.email },
    }
  },

  async cadastrar({ nome, email, senha }) {
    await delay()
    if (buscarConta(email)) throw new ApiError('Este e-mail já está cadastrado.', { status: 409 })
    const nova = { nome: nome.trim(), email: email.trim().toLowerCase(), senha }
    gravarChave(CONTAS_KEY, [...contasCadastradas(), nova])
    salvarTransacoes([], nova.email) // conta nova começa zerada
    return { nome: nova.nome, email: nova.email }
  },

  getDashboard({ periodo }, { signal } = {}) {
    return simulate(signal, () => buildDashboard(periodo, lerTransacoes()))
  },

  getTransacoes({ signal } = {}) {
    return simulate(signal, () => ordenar(lerTransacoes()))
  },

  async criarTransacao(dados) {
    await delay()
    const nova = { id: novoId(), ...campos(dados), criadoEm: Date.now() }
    salvarTransacoes([nova, ...lerTransacoes()])
    return nova
  },

  async atualizarTransacao(id, dados) {
    await delay()
    const lista = lerTransacoes()
    const indice = lista.findIndex((t) => String(t.id) === String(id))
    if (indice === -1) throw new ApiError('Transação não encontrada.', { status: 404 })
    const atualizada = { ...lista[indice], ...campos(dados) }
    lista[indice] = atualizada
    salvarTransacoes(lista)
    return atualizada
  },

  async excluirTransacao(id) {
    await delay()
    salvarTransacoes(lerTransacoes().filter((t) => String(t.id) !== String(id)))
  },
}
