import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router'
import KpiCard from '../components/dashboard/KpiCard'
import ChartCard from '../components/dashboard/ChartCard'
import MonthlyChart from '../components/dashboard/MonthlyChart'
import CategoryChart from '../components/dashboard/CategoryChart'
import BalanceChart from '../components/dashboard/BalanceChart'
import { CHART_COLORS } from '../components/dashboard/chartTheme'
import SegmentedControl from '../components/filters/SegmentedControl'
import DataTable from '../components/table/DataTable'
import { recentColumns } from '../components/table/transacaoColumns'
import ErrorModal from '../components/feedback/ErrorModal'
import TransacaoFormModal from '../components/transacoes/TransacaoFormModal'
import EmptyState from '../components/feedback/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { useApi } from '../hooks/useApi'
import { getDashboard } from '../services/dashboardService'
import { getTransacoes } from '../services/transacoesService'
import { formatCurrency, formatMonthShort, formatPercent, percentChange } from '../utils/format'
import '../styles/dashboard.css'

const PERIODOS = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
]

const LEGENDA_MENSAL = [
  { label: 'Receitas', color: CHART_COLORS.receitas },
  { label: 'Despesas', color: CHART_COLORS.despesas },
]

// Colunas das "tabelas alternativas" dos gráficos (acessibilidade).
const COLUNAS_MENSAL = [
  { key: 'mes', header: 'Mês', render: (r) => formatMonthShort(r.mes) },
  { key: 'receitas', header: 'Receitas', align: 'right', render: (r) => formatCurrency(r.receitas) },
  { key: 'despesas', header: 'Despesas', align: 'right', render: (r) => formatCurrency(r.despesas) },
  { key: 'resultado', header: 'Resultado', align: 'right', render: (r) => formatCurrency(r.receitas - r.despesas) },
]
const COLUNAS_CATEGORIA = [
  { key: 'categoria', header: 'Categoria' },
  { key: 'valor', header: 'Valor', align: 'right', render: (r) => formatCurrency(r.valor) },
  { key: 'percentual', header: '% do total', align: 'right', render: (r) => formatPercent(r.percentual) },
]
const COLUNAS_SALDO = [
  { key: 'mes', header: 'Mês', render: (r) => formatMonthShort(r.mes) },
  { key: 'saldo', header: 'Saldo no fim do mês', align: 'right', render: (r) => formatCurrency(r.saldo) },
]

const horaFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState('6m')
  const [dismissedError, setDismissedError] = useState(null)
  const [formAberto, setFormAberto] = useState(false)

  // useCallback: a função só muda quando o período muda → useApi refaz a busca apenas nesse caso.
  const fetchDashboard = useCallback((signal) => getDashboard({ periodo }, { signal }), [periodo])
  const fetchRecentes = useCallback((signal) => getTransacoes({ limite: 6, signal }), [])

  const dashboard = useApi(fetchDashboard)
  const recentes = useApi(fetchRecentes)
  const { data } = dashboard

  // Cálculos derivados memoizados: só refazem quando os dados chegam/mudam.
  const kpis = useMemo(() => {
    if (!data) return null
    const { saldoAtual, receitas, despesas, receitasAnterior, despesasAnterior } = data.resumo
    const economia = receitas - despesas
    return {
      saldoAtual: formatCurrency(saldoAtual),
      receitas: formatCurrency(receitas),
      despesas: formatCurrency(despesas),
      receitasDelta: percentChange(receitas, receitasAnterior),
      despesasDelta: percentChange(despesas, despesasAnterior),
      taxaEconomia: formatPercent(receitas ? economia / receitas : 0),
      economia: `${economia >= 0 ? 'Sobrou' : 'Faltou'} ${formatCurrency(Math.abs(economia))} no período`,
    }
  }, [data])

  const categoriasTabela = useMemo(() => {
    if (!data) return []
    const total = data.categorias.reduce((soma, c) => soma + c.valor, 0)
    return data.categorias.map((c) => ({ ...c, percentual: total ? c.valor / total : 0 }))
  }, [data])

  const activeError = dashboard.error ?? recentes.error
  const loadingFirstTime = dashboard.loading && !data

  const retry = () => {
    if (dashboard.error) dashboard.reload()
    if (recentes.error) recentes.reload()
  }

  const refreshAll = () => {
    dashboard.reload()
    recentes.reload()
  }

  const aoSalvarTransacao = () => {
    setFormAberto(false)
    refreshAll()
  }

  // Conta sem nenhuma transação: mostra um convite para começar no lugar dos gráficos vazios.
  const semTransacoes = recentes.data?.length === 0 && !recentes.error

  return (
    <div className="page dashboard">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Visão geral</h2>
          <p className="page-header__subtitle">
            {dashboard.updatedAt
              ? `Atualizado às ${horaFormatter.format(dashboard.updatedAt)}`
              : dashboard.error
                ? 'Falha ao carregar os dados'
                : 'Carregando dados…'}
          </p>
        </div>
        <div className="page-header__actions">
          <SegmentedControl label="Período" value={periodo} onChange={setPeriodo} options={PERIODOS} />
          <Button variant="secondary" icon="refresh" onClick={refreshAll} loading={dashboard.loading && Boolean(data)}>
            Atualizar
          </Button>
          <Button icon="plus" onClick={() => setFormAberto(true)}>
            Nova transação
          </Button>
        </div>
      </div>

      {dashboard.error && !data ? (
        <div className="card">
          <EmptyState
            tone="danger"
            icon="alertTriangle"
            title="Não foi possível carregar o dashboard"
            description={dashboard.error.message}
            action={
              <Button icon="refresh" onClick={dashboard.reload}>
                Tentar novamente
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <section className="kpi-grid" aria-label="Indicadores do período" aria-busy={loadingFirstTime}>
            <KpiCard label="Saldo atual" icon="wallet" value={kpis?.saldoAtual} hint="Somando todas as contas" loading={loadingFirstTime} />
            <KpiCard
              label="Receitas"
              icon="trendingUp"
              tone="green"
              value={kpis?.receitas}
              delta={kpis?.receitasDelta}
              upIsGood
              loading={loadingFirstTime}
            />
            <KpiCard
              label="Despesas"
              icon="trendingDown"
              tone="orange"
              value={kpis?.despesas}
              delta={kpis?.despesasDelta}
              upIsGood={false}
              loading={loadingFirstTime}
            />
            <KpiCard
              label="Taxa de economia"
              icon="piggy"
              tone="violet"
              value={kpis?.taxaEconomia}
              hint={kpis?.economia}
              loading={loadingFirstTime}
            />
          </section>

          {semTransacoes ? (
            <section className="card" aria-label="Primeiros passos">
              <EmptyState
                icon="wallet"
                title="Comece cadastrando suas transações"
                description="Adicione suas receitas e despesas. Os indicadores e gráficos são atualizados automaticamente."
                action={
                  <Button icon="plus" onClick={() => setFormAberto(true)}>
                    Nova transação
                  </Button>
                }
              />
            </section>
          ) : (
            <div className={`dashboard-grid ${dashboard.loading && data ? 'is-refreshing' : ''}`}>
              <ChartCard
                className="span-2"
                title="Receitas x Despesas"
                subtitle="Totais por mês"
                legend={LEGENDA_MENSAL}
                loading={loadingFirstTime}
                isEmpty={data?.mensal.length === 0}
                height={300}
                table={{ columns: COLUNAS_MENSAL, data: data?.mensal ?? [], rowKey: 'mes' }}
              >
                <MonthlyChart data={data?.mensal} />
              </ChartCard>

              <ChartCard
                title="Despesas por categoria"
                subtitle="Onde o dinheiro foi gasto no período"
                loading={loadingFirstTime}
                isEmpty={data?.categorias.length === 0}
                height={300}
                table={{ columns: COLUNAS_CATEGORIA, data: categoriasTabela, rowKey: 'categoria' }}
              >
                <CategoryChart data={data?.categorias} />
              </ChartCard>

              <ChartCard
                title="Evolução do saldo"
                subtitle="Saldo ao fim de cada mês"
                loading={loadingFirstTime}
                isEmpty={data?.mensal.length === 0}
                height={260}
                table={{ columns: COLUNAS_SALDO, data: data?.mensal ?? [], rowKey: 'mes' }}
              >
                <BalanceChart data={data?.mensal} />
              </ChartCard>

              <section className="card recent-card" aria-label="Últimas transações">
                <header className="chart-card__header">
                  <div>
                    <h2 className="card__title">Últimas transações</h2>
                    <p className="card__subtitle">Movimentações mais recentes</p>
                  </div>
                  <Link to="/transacoes" className="chip-button">
                    Ver todas <Icon name="chevronRight" size={15} />
                  </Link>
                </header>
                <DataTable
                  columns={recentColumns}
                  data={recentes.data ?? []}
                  loading={recentes.loading}
                  caption="Últimas transações"
                  paginated={false}
                  compact
                  emptyState={
                    recentes.error ? (
                      <EmptyState
                        tone="danger"
                        icon="alertTriangle"
                        title="Falha ao carregar as transações"
                        action={
                          <Button size="sm" variant="secondary" icon="refresh" onClick={recentes.reload}>
                            Tentar novamente
                          </Button>
                        }
                      />
                    ) : (
                      <EmptyState title="Nenhuma transação ainda" description="As movimentações aparecerão aqui." />
                    )
                  }
                />
              </section>
            </div>
          )}
        </>
      )}

      <TransacaoFormModal open={formAberto} transacao={null} onClose={() => setFormAberto(false)} onSaved={aoSalvarTransacao} />

      <ErrorModal
        open={Boolean(activeError) && activeError !== dismissedError}
        error={activeError}
        onRetry={retry}
        onClose={() => setDismissedError(activeError)}
      />
    </div>
  )
}
