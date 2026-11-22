// Configuração central lida das variáveis de ambiente do Vite (.env.*).
// Toda variável exposta ao navegador precisa começar com VITE_.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

// Quando "true", o front usa dados simulados (src/services/mock) e não precisa do back-end.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Tempo máximo (ms) de espera por uma resposta da API antes de exibir erro.
export const REQUEST_TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 15000
