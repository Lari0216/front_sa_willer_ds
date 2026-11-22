import { memo, useId } from 'react'

/** Período "de / até" com inputs de data nativos (formato AAAA-MM-DD). */
function DateRangeFilter({ start, end, onChange }) {
  const id = useId()
  return (
    <fieldset className="filter-field date-range">
      <legend>Período</legend>
      <div className="date-range__inputs">
        <label htmlFor={`${id}-inicio`} className="sr-only">
          Data inicial
        </label>
        <input id={`${id}-inicio`} type="date" value={start} max={end || undefined} onChange={(e) => onChange({ start: e.target.value, end })} />
        <span aria-hidden="true">até</span>
        <label htmlFor={`${id}-fim`} className="sr-only">
          Data final
        </label>
        <input id={`${id}-fim`} type="date" value={end} min={start || undefined} onChange={(e) => onChange({ start, end: e.target.value })} />
      </div>
    </fieldset>
  )
}

export default memo(DateRangeFilter)
