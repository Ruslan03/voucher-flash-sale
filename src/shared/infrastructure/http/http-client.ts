/**
 * SHARED INFRASTRUCTURE LAYER — Centralized HTTP Client
 * Reusable fetch wrapper with timeout, standardized headers, and typed JSON handling.
 */

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string
  ) {
    super(`HTTP ${status} ${statusText} — ${url}`)
    this.name = 'HttpError'
  }
}

export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number
  body?: unknown
}

async function request<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
  const { timeout = 10_000, body, headers, ...rest } = options

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  })

  if (!res.ok) {
    throw new HttpError(res.status, res.statusText, url)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const httpClient = {
  get: <T>(url: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PUT', body }),
  patch: <T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PATCH', body }),
  delete: <T>(url: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'DELETE' }),
}
