import { memo, useId } from 'react'

/** Filtro de seleção simples. options: [{ value, label }] — use value '' para "Todos". */
function SelectFilter({ label, value, onChange, options }) {
  const id = useId()
  return (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default memo(SelectFilter)
