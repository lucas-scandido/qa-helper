const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// Timeout generoso para acomodar chamadas ao LLM (geração de bug pode levar ~30s)
const TIMEOUT_MS = 70_000

async function wrapFetch(promise: Promise<Response>): Promise<Response> {
  try {
    return await promise
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new Error('A requisição demorou muito. Verifique sua conexão e tente novamente.')
    }
    throw err
  }
}

export const api = {
  get: (path: string): Promise<Response> =>
    wrapFetch(fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })),

  post: (path: string, body: unknown): Promise<Response> =>
    wrapFetch(
      fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    ),

  put: (path: string, body: unknown): Promise<Response> =>
    wrapFetch(
      fetch(`${BASE}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    ),
}
