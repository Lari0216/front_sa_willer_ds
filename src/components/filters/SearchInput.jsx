import { memo, useId } from 'react'
import Icon from '../ui/Icon'

/** Campo de busca com ícone e botão de limpar. O debounce fica em quem usa (useDebouncedValue). */
function SearchInput({ value, onChange, label = 'Buscar', placeholder = 'Buscar…' }) {
  const id = useId()
  return (
    <div className="search-input">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon name="search" size={18} className="search-input__icon" />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
      {value && (
        <button type="button" className="search-input__clear" onClick={() => onChange('')} aria-label="Limpar busca">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  )
}

export default memo(SearchInput)
