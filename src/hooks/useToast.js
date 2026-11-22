import { useContext } from 'react'
import { ToastContext } from '../context/contexts'

/**
 * const toast = useToast()
 * toast.success('Salvo!')  ·  toast.error('Falhou', { title: 'Erro' })  ·  toast.info(...)  ·  toast.warning(...)
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast precisa estar dentro de <ToastProvider>.')
  return context
}
