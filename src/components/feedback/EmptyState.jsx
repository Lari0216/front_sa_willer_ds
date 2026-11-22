import Icon from '../ui/Icon'

/** Mensagem para listas vazias, resultados de busca sem itens ou falhas de carregamento. */
export default function EmptyState({ icon = 'inbox', title, description, action, tone = 'neutral' }) {
  return (
    <div className={`empty-state empty-state--${tone}`}>
      <span className="empty-state__icon">
        <Icon name={icon} size={26} />
      </span>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action}
    </div>
  )
}
