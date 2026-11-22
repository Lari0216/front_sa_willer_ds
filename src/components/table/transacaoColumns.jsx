import { Amount, StatusBadge, TipoBadge } from './cells'
import Icon from '../ui/Icon'
import { formatDate } from '../../utils/format'

// Definidas fora dos componentes: a referência nunca muda, então as linhas memoizadas do DataTable não re-renderizam à toa.
export const transacaoColumns = [
  { key: 'data', header: 'Data', sortable: true, render: (t) => formatDate(t.data), className: 'cell-nowrap' },
  {
    key: 'descricao',
    header: 'Descrição',
    sortable: true,
    render: (t) => <span className="cell-strong">{t.descricao}</span>,
  },
  { key: 'categoria', header: 'Categoria', sortable: true },
  { key: 'tipo', header: 'Tipo', sortable: true, render: (t) => <TipoBadge tipo={t.tipo} /> },
  { key: 'status', header: 'Status', sortable: true, render: (t) => <StatusBadge status={t.status} /> },
  {
    key: 'valor',
    header: 'Valor',
    sortable: true,
    align: 'right',
    // Ordena pelo valor com sinal (despesas negativas), como num extrato.
    sortValue: (t) => (t.tipo === 'despesa' ? -t.valor : t.valor),
    render: (t) => <Amount value={t.valor} tipo={t.tipo} />,
    className: 'cell-nowrap',
  },
]

/** Versão enxuta para a lista de "últimas transações" do dashboard. */
export const recentColumns = transacaoColumns
  .filter((c) => c.key !== 'status' && c.key !== 'tipo')
  .map((c) => ({ ...c, sortable: false }))

/** Coluna com os botões de editar e excluir. Passe callbacks estáveis (useCallback). */
export function acoesColumn({ onEdit, onDelete }) {
  return {
    key: 'acoes',
    header: 'Ações',
    align: 'right',
    render: (t) => (
      <div className="row-actions">
        <button type="button" className="icon-button icon-button--sm" onClick={() => onEdit(t)} aria-label={`Editar ${t.descricao}`} title="Editar">
          <Icon name="pencil" size={16} />
        </button>
        <button
          type="button"
          className="icon-button icon-button--sm icon-button--danger"
          onClick={() => onDelete(t)}
          aria-label={`Excluir ${t.descricao}`}
          title="Excluir"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    ),
  }
}
