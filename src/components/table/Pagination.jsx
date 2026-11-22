import { memo } from 'react'
import Icon from '../ui/Icon'

/** Gera a lista de páginas com reticências: 1 … 4 5 6 … 20 */
function getPageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const items = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) items.push('start-gap')
  for (let p = start; p <= end; p += 1) items.push(p)
  if (end < totalPages - 1) items.push('end-gap')
  items.push(totalPages)
  return items
}

function Pagination({ page, totalPages, totalItems, pageSize, pageSizeOptions, onPageChange, onPageSizeChange }) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalItems)

  return (
    <nav className="pagination" aria-label="Paginação">
      <p className="pagination__info">
        Mostrando <strong>{first}</strong>–<strong>{last}</strong> de <strong>{totalItems}</strong>
      </p>

      <div className="pagination__controls">
        <button type="button" className="pagination__btn" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Página anterior">
          <Icon name="chevronLeft" size={16} />
        </button>
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={`pagination__btn ${item === page ? 'is-active' : ''}`}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Página ${item}`}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="pagination__gap" aria-hidden="true">
              …
            </span>
          ),
        )}
        <button type="button" className="pagination__btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Próxima página">
          <Icon name="chevronRight" size={16} />
        </button>
      </div>

      <label className="pagination__size">
        <span>Itens por página</span>
        <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  )
}

export default memo(Pagination)
