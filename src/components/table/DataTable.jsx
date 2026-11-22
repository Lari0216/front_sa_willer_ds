import { memo, useMemo, useState } from 'react'
import Icon from '../ui/Icon'
import Skeleton from '../feedback/Skeleton'
import Pagination from './Pagination'

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true })

function compareValues(a, b) {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return collator.compare(String(a), String(b))
}

/**
 * Tabela genérica e reutilizável com ordenação por coluna, paginação, estado de
 * carregamento (skeleton) e estado vazio. No celular as linhas viram "cards".
 *
 * columns: [{ key, header, render?(row), sortable?, sortValue?(row), align?: 'left'|'right'|'center', className? }]
 *          → defina `columns` fora do componente ou com useMemo para aproveitar a memoização das linhas.
 */
export default function DataTable({
  columns,
  data,
  rowKey = 'id',
  caption,
  loading = false,
  initialSort = null,
  paginated = true,
  pageSizeOptions = [10, 25, 50],
  emptyState = null,
  footer = null,
  compact = false,
  resetPageKey,
}) {
  const [sort, setSort] = useState(initialSort)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  // A página "lembra" para quais filtros/ordem ela vale: se eles mudarem, volta para a página 1
  // sem precisar de useEffect. Sem `resetPageKey`, qualquer troca de `data` reinicia a paginação.
  const resetKey = resetPageKey ?? data
  const [pageState, setPageState] = useState({ page: 1, resetKey, sort })

  const sortedData = useMemo(() => {
    if (!sort) return data
    const column = columns.find((c) => c.key === sort.key)
    const getValue = column?.sortValue ?? ((row) => row[sort.key])
    const direction = sort.direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => direction * compareValues(getValue(a), getValue(b)))
  }, [data, sort, columns])

  const totalPages = paginated ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1
  const samePage = pageState.resetKey === resetKey && pageState.sort === sort
  const page = Math.min(samePage ? pageState.page : 1, totalPages)

  const visibleRows = useMemo(
    () => (paginated ? sortedData.slice((page - 1) * pageSize, page * pageSize) : sortedData),
    [sortedData, paginated, page, pageSize],
  )

  const goToPage = (next) => setPageState({ page: next, resetKey, sort })

  const toggleSort = (key) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' }
      if (current.direction === 'asc') return { key, direction: 'desc' }
      return initialSort?.key === key ? { key, direction: 'asc' } : null
    })
  }

  const showEmpty = !loading && data.length === 0

  return (
    <div className={`data-table ${compact ? 'data-table--compact' : ''}`}>
      <div className="data-table__scroll">
        <table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.key
                const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined
                return (
                  <th key={column.key} scope="col" aria-sort={ariaSort} className={`align-${column.align ?? 'left'}`}>
                    {column.sortable ? (
                      <button type="button" className={`th-sort ${active ? 'is-active' : ''}`} onClick={() => toggleSort(column.key)}>
                        {column.header}
                        <Icon name={active ? (sort.direction === 'asc' ? 'sortAsc' : 'sortDesc') : 'sort'} size={14} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0
              ? Array.from({ length: Math.min(pageSize, 6) }, (_, i) => <SkeletonRow key={i} columns={columns} />)
              : visibleRows.map((row) => <TableRow key={row[rowKey]} row={row} columns={columns} />)}
          </tbody>
          {footer && !showEmpty && <tfoot>{footer}</tfoot>}
        </table>
      </div>

      {showEmpty && emptyState}

      {paginated && !showEmpty && sortedData.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={sortedData.length}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={goToPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            goToPage(1)
          }}
        />
      )}
    </div>
  )
}

// Linha memoizada: ao trocar de página ou ordenar, linhas com os mesmos dados não re-renderizam.
const TableRow = memo(function TableRow({ row, columns }) {
  return (
    <tr>
      {columns.map((column) => (
        <td key={column.key} data-label={column.header} className={`align-${column.align ?? 'left'} ${column.className ?? ''}`}>
          {column.render ? column.render(row) : row[column.key]}
        </td>
      ))}
    </tr>
  )
})

function SkeletonRow({ columns }) {
  return (
    <tr className="is-skeleton" aria-hidden="true">
      {columns.map((column) => (
        <td key={column.key} className={`align-${column.align ?? 'left'}`}>
          <Skeleton width={column.align === 'right' ? '60%' : '80%'} height={14} />
        </td>
      ))}
    </tr>
  )
}
