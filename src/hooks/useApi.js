import { useCallback, useEffect, useState } from 'react'

/**
 * Executa uma função assíncrona (ex.: chamada de API) e controla carregamento, erro e dados.
 *
 * - `fetcher` deve ser estável (useCallback) — quando ele muda, a busca é refeita.
 * - Requisições antigas são canceladas (AbortController) ao trocar filtros ou desmontar.
 * - Os dados anteriores continuam visíveis enquanto a nova busca carrega (sem "piscar").
 *
 * @param {(signal: AbortSignal) => Promise<any>} fetcher
 */
export function useApi(fetcher) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ fetcher: null, attempt: -1, data: undefined, error: null, updatedAt: null })

  useEffect(() => {
    const controller = new AbortController()

    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ fetcher, attempt, data, error: null, updatedAt: new Date() })
      },
      (error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setResult((prev) => ({ ...prev, fetcher, attempt, error }))
      },
    )

    return () => controller.abort()
  }, [fetcher, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  // "loading" é derivado: a última resposta recebida não corresponde à busca atual.
  const loading = result.fetcher !== fetcher || result.attempt !== attempt

  return {
    data: result.data,
    error: loading ? null : result.error,
    loading,
    updatedAt: result.updatedAt,
    reload,
  }
}
