import { USE_MOCK } from '../config'
import { request } from './http'
import { mockApi } from './mock/mockApi'

/**
 * POST /login  { email, senha }  →  { accessToken, refreshToken, usuario? }
 * Se o back não devolver `usuario`, montamos um a partir do e-mail.
 */
export async function login({ email, senha }) {
  const dados = USE_MOCK
    ? await mockApi.login({ email, senha })
    : await request('/login', { method: 'POST', body: { email, senha }, auth: false })

  if (!dados?.accessToken) {
    throw new Error('Resposta de login inválida: accessToken ausente.')
  }

  return {
    accessToken: dados.accessToken,
    refreshToken: dados.refreshToken,
    usuario: dados.usuario ?? { nome: email.split('@')[0], email },
  }
}

/** POST /usuarios  { nome, email, senha } */
export function cadastrar({ nome, email, senha }) {
  return USE_MOCK
    ? mockApi.cadastrar({ nome, email, senha })
    : request('/usuarios', { method: 'POST', body: { nome, email, senha }, auth: false })
}
