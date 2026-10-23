/**
 * SHARED INFRASTRUCTURE LAYER — Centralized HTTP Client
 * Reusable fetch wrapper with timeout, standardized headers, and typed JSON handling.
 */

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
    public readonly data?: unknown
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
  const method = (rest.method || 'GET').toUpperCase()

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Log outgoing API request details (method, URL, headers, and body)
  console.log(`[HTTP Request] ${method} ${url}`, {
    headers: requestHeaders,
    body: body !== undefined ? body : null,
  })

  const res = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  })

  let responseData: unknown = undefined
  if (res.status !== 204) {
    try {
      responseData = await res.json()
    } catch {
      // not JSON or empty body
    }
  }

  console.log(`[HTTP Response] ${method} ${url}`, {
    status: res.status,
    body: responseData ?? null,
  })

  if (!res.ok) {
    console.warn(`[HTTP Response Error] ${method} ${url} -> ${res.status} ${res.statusText}`, {
      status: res.status,
      errorData: responseData,
    })

    throw new HttpError(res.status, res.statusText, url, responseData)
  }

  return responseData as T
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
