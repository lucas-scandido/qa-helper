const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const api = {
  get: (path: string): Promise<Response> =>
    fetch(`${BASE}${path}`),

  post: (path: string, body: unknown): Promise<Response> =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
}
