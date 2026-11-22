import { useCallback, useMemo, useState } from 'react'
import DataTable from '../components/table/DataTable'
import { acoesColumn, transacaoColumns } from '../components/table/transacaoColumns'
import TransacaoFormModal from '../components/transacoes/TransacaoFormModal'
import ConfirmModal from '../components/feedback/ConfirmModal'
import SearchInput from '../components/filters/SearchInput'
import SelectFilter from '../components/filters/SelectFilter'
import DateRangeFilter from '../components/filters/DateRangeFilter'
import EmptyState from '../components/feedback/EmptyState'
import ErrorModal from '../components/feedback/ErrorModal'
import Button from '../components/ui/Button'
import { useApi } from '../hooks/useApi'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useToast } from '../hooks/useToast'
import { excluirTransacao, getTransacoes } from '../services/transacoesService'
import { STATUS_LABEL, TIPO_LABEL } from '../utils/categorias'
import { formatCurrency, formatDate, toISODate } from '../utils/format'
import { downloadCsv } from '../utils/csv'
import '../styles/transacoes.css'

const FILTROS_INICIAIS = { busca: '', tipo: '', categoria: '', status: '', inicio: '', fim: '' }
const SEM_DADOS = []

const OPCOES_TIPO = [
  { value: '', label: 'Todos' },
  { value: 'receita', label: 'Receitas' },
  { value: 'despesa', label: 'Despesas' },
]
const OPCOES_STATUS = [
  { value: '', label: 'Todos' },
  { value: 'concluida', label: 'Concluídas' },
  { value: 'pendente', label: 'Pendentes' },
]

const COLUNAS_CSV = [
  { header: 'Data', value: (t) => formatDate(t.data) },
  { header: 'Descrição', value: (t) => t.descricao },
  { header: 'Categoria', value: (t) => t.categoria },
  { header: 'Tipo', value: (t) => TIPO_LABEL[t.tipo] },
  { header: 'Status', value: (t) => STATUS_LABEL[t.status] },
  { header: 'Valor', value: (t) => (t.tipo === 'despesa' ? -t.valor : t.valor).toFixed(2).replace('.', ',') },
]

const collator = new Intl.Collator('pt-BR')

/** Remove acentos e caixa para a busca: "alimentacao" encontra "Alimentação". */
const normalizar = (texto) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export default function TransacoesPage() {
  const toast = useToast()
  const fetchTransacoes = useCallback((signal) => getTransacoes({ signal }), [])
  const { data, error, loading, reload } = useApi(fetchTransacoes)
  const [dismissedError, setDismissedError] = useState(null)

  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const { tipo, categoria, status, inicio, fim } = filtros
  // A busca só é aplicada 300 ms depois que o usuário para de digitar.
  const busca = useDebouncedValue(filtros.busca, 300)

  const setFiltro = useCallback((campo, valor) => setFiltros((atual) => ({ ...atual, [campo]: valor })), [])
  const handleBusca = useCallback((valor) => setFiltro('busca', valor), [setFiltro])
  const handleTipo = useCallback((valor) => setFiltros((atual) => ({ ...atual, tipo: valor, categoria: '' })), [])
  const handleCategoria = useCallback((valor) => setFiltro('categoria', valor), [setFiltro])
  const handleStatus = useCallback((valor) => setFiltro('status', valor), [setFiltro])
  const handlePeriodo = useCallback(({ start, end }) => setFiltros((atual) => ({ ...atual, inicio: start, fim: end })), [])

  // ----- cadastro, edição e exclusão -----
  const [formulario, setFormulario] = useState({ aberto: false, transacao: null })
  const [paraExcluir, setParaExcluir] = useState(null)

  const abrirNova = () => setFormulario({ aberto: true, transacao: null })
  const abrirEdicao = useCallback((transacao) => setFormulario({ aberto: true, transacao }), [])
  const fecharFormulario = useCallback(() => setFormulario({ aberto: false, transacao: null }), [])
  const pedirExclusao = useCallback((transacao) => setParaExcluir(transacao), [])

  // Colunas memoizadas: os callbacks são estáveis, então a referência só é criada uma vez.
  const colunas = useMemo(
    () => [...transacaoColumns, acoesColumn({ onEdit: abrirEdicao, onDelete: pedirExclusao })],
    [abrirEdicao, pedirExclusao],
  )

  const aoSalvar = () => {
    fecharFormulario()
    reload()
  }

  const confirmarExclusao = async () => {
    try {
      await excluirTransacao(paraExcluir.id)
      toast.success(`"${paraExcluir.descricao}" foi excluída.`, { title: 'Transação excluída' })
      setParaExcluir(null)
      reload()
    } catch (erro) {
      toast.error(erro?.message || 'Não foi possível excluir.', { title: 'Erro ao excluir' })
    }
  }

  const transacoes = data ?? SEM_DADOS

  // Pré-calcula o texto normalizado de cada transação uma única vez (e não a cada tecla digitada).
  const indexadas = useMemo(
    () => transacoes.map((t) => ({ transacao: t, texto: normalizar(`${t.descricao} ${t.categoria}`) })),
    [transacoes],
  )

  const opcoesCategoria = useMemo(() => {
    const base = tipo ? transacoes.filter((t) => t.tipo === tipo) : transacoes
    const unicas = [...new Set(base.map((t) => t.categoria))].sort(collator.compare)
    return [{ value: '', label: 'Todas' }, ...unicas.map((c) => ({ value: c, label: c }))]
  }, [transacoes, tipo])

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim())
    return indexadas
      .filter(({ transacao: t, texto }) => {
        if (termo && !texto.includes(termo)) return false
        if (tipo && t.tipo !== tipo) return false
        if (categoria && t.categoria !== categoria) return false
        if (status && t.status !== status) return false
        if (inicio && t.data < inicio) return false
        if (fim && t.data > fim) return false
        return true
      })
      .map(({ transacao }) => transacao)
  }, [indexadas, busca, tipo, categoria, status, inicio, fim])

  const totais = useMemo(
    () =>
      filtradas.reduce(
        (acc, t) => {
          if (t.tipo === 'receita') acc.receitas += t.valor
          else acc.despesas += t.valor
          return acc
        },
        { receitas: 0, despesas: 0 },
      ),
    [filtradas],
  )

  const temFiltroAtivo = Object.entries(filtros).some(([, valor]) => valor !== '')
  const buscando = filtros.busca !== busca

  const limparFiltros = () => setFiltros(FILTROS_INICIAIS)

  const exportar = () => {
    if (!filtradas.length) {
      toast.warning('Não há transações para exportar com os filtros atuais.')
      return
    }
    downloadCsv(`transacoes-${toISODate(new Date())}.csv`, COLUNAS_CSV, filtradas)
    toast.success(`${filtradas.length} transações exportadas para CSV.`, { title: 'Exportação concluída' })
  }

  const emptyState = error ? (
    <EmptyState
      tone="danger"
      icon="alertTriangle"
      title="Não foi possível carregar as transações"
      description={error.message}
      action={
        <Button icon="refresh" onClick={reload}>
          Tentar novamente
        </Button>
      }
    />
  ) : transacoes.length === 0 ? (
    <EmptyState
      icon="wallet"
      title="Nenhuma transação cadastrada"
      description="Adicione sua primeira receita ou despesa para começar."
      action={
        <Button icon="plus" onClick={abrirNova}>
          Nova transação
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon="filterOff"
      title="Nenhuma transação encontrada"
      description="Nenhum resultado para os filtros selecionados."
      action={
        <Button variant="secondary" onClick={limparFiltros}>
          Limpar filtros
        </Button>
      }
    />
  )

  return (
    <div className="page transacoes">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Extrato de transações</h2>
          <p className="page-header__subtitle">Pesquise, filtre, ordene e exporte suas movimentações.</p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" icon="refresh" onClick={reload} loading={loading && Boolean(data)}>
            Atualizar
          </Button>
          <Button variant="secondary" icon="download" onClick={exportar} disabled={!data}>
            Exportar CSV
          </Button>
          <Button icon="plus" onClick={abrirNova}>
            Nova transação
          </Button>
        </div>
      </div>

      <section className="card filters-card" aria-label="Filtros">
        <div className="filters">
          <div className="filters__search">
            <SearchInput value={filtros.busca} onChange={handleBusca} label="Buscar transações" placeholder="Buscar transações…" />
          </div>
          <SelectFilter label="Tipo" value={tipo} onChange={handleTipo} options={OPCOES_TIPO} />
          <SelectFilter label="Categoria" value={categoria} onChange={handleCategoria} options={opcoesCategoria} />
          <SelectFilter label="Status" value={status} onChange={handleStatus} options={OPCOES_STATUS} />
          <DateRangeFilter start={inicio} end={fim} onChange={handlePeriodo} />
        </div>
        {temFiltroAtivo && (
          <div className="filters__footer">
            <Button variant="ghost" size="sm" icon="filterOff" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          </div>
        )}
      </section>

      <section className="card table-card" aria-label="Transações">
        <div className="table-summary" aria-live="polite">
          <p className="table-summary__count">
            {loading && !data ? 'Carregando…' : `${filtradas.length} ${filtradas.length === 1 ? 'transação' : 'transações'}`}
            {buscando && <span className="table-summary__searching"> · buscando…</span>}
          </p>
          {data && filtradas.length > 0 && (
            <dl className="table-summary__totals">
              <div>
                <dt>Receitas</dt>
                <dd className="amount amount--positive">{formatCurrency(totais.receitas)}</dd>
              </div>
              <div>
                <dt>Despesas</dt>
                <dd className="amount amount--negative">{formatCurrency(totais.despesas)}</dd>
              </div>
              <div>
                <dt>Saldo</dt>
                <dd className="amount">{formatCurrency(totais.receitas - totais.despesas)}</dd>
              </div>
            </dl>
          )}
        </div>

        <DataTable
          columns={colunas}
          data={filtradas}
          loading={loading}
          caption="Transações filtradas"
          initialSort={{ key: 'data', direction: 'desc' }}
          emptyState={emptyState}
          resetPageKey={`${busca}|${tipo}|${categoria}|${status}|${inicio}|${fim}`}
        />
      </section>

      <TransacaoFormModal open={formulario.aberto} transacao={formulario.transacao} onClose={fecharFormulario} onSaved={aoSalvar} />

      <ConfirmModal
        open={Boolean(paraExcluir)}
        title="Excluir transação?"
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onClose={() => setParaExcluir(null)}
      >
        <p>
          A transação <strong>{paraExcluir?.descricao}</strong> ({paraExcluir && formatCurrency(paraExcluir.valor)}) será removida. Esta ação
          não pode ser desfeita.
        </p>
      </ConfirmModal>

      <ErrorModal
        open={Boolean(error) && error !== dismissedError}
        error={error}
        title="Erro ao carregar transações"
        onRetry={reload}
        onClose={() => setDismissedError(error)}
      />
    </div>
  )
}
