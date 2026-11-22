import { createContext } from 'react'

// Objetos de contexto ficam separados dos Providers para manter o Fast Refresh do Vite funcionando.
export const AuthContext = createContext(null)
export const ToastContext = createContext(null)
