import { API_URL, REQUEST_TIMEOUT } from '../config'
import { getToken } from './session'

/** Erro padronizado de API: a UI sempre recebe uma mensagem amigável em `message`. */
export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const STATUS_MESSAGES = {
  400: 'Dados inválidos. Revise as informações e tente novamente.',
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para acessar este recurso.',
  404: 'Recurso não encontrado no servidor.',
  409: 'Este registro já existe.',
  422: 'Dados inválidos. Revise as informações e tente novamente.',
  429: 'Muitas requisições. Aguarde um instante e tente de novo.',
  500: 'Erro interno no servidor. Tente novamente em instantes.',
  503: 'Servidor indisponível no momento. Tente novamente em instantes.',
}

// Permite que o AuthProvider reaja a respostas 401 (ex.: deslogar e avisar o usuário).
const unauthorizedListeners = new Set()

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

export function notifyUnauthorized() {
  unauthorizedListeners.forEach((listener) => listener())
}

function buildUrl(path, params) {
  const url = new URL(`${API_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  return url.toString()
}

async function parseBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Wrapper de fetch com: JSON automático, token Bearer, timeout, cancelamento
 * (AbortSignal) e mensagens de erro em português.
 */
export async function request(path, { method = 'GET', body, params, signal, auth = true } = {}) {
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT)

  const abortFromCaller = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', abortFromCaller, { once: true })
  }

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    const data = await parseBody(response)

    if (!response.ok) {
      if (response.status === 401 && auth) notifyUnauthorized()
      const serverMessage = data && typeof data === 'object' ? data.erro || data.error || data.message : null
      throw new ApiError(serverMessage || STATUS_MESSAGES[response.status] || `Erro inesperado (${response.status}).`, {
        status: response.status,
        data,
      })
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error?.name === 'AbortError') {
      if (timedOut) throw new ApiError('O servidor demorou demais para responder. Tente novamente.', { status: 408 })
      throw error // cancelado pelo próprio componente (ex.: desmontou) — quem chamou ignora
    }
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão ou se o back-end está rodando.')
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}
