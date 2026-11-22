import Icon from './Icon'
import Spinner from '../feedback/Spinner'

/**
 * Botão padrão do sistema.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'   ·   size: 'md' | 'sm'
 * loading: mostra spinner, desabilita o botão e anuncia "aria-busy" para leitores de tela.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} label={null} /> : icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
    </button>
  )
}
