const API_URL = 'http://localhost:8000/api'

// Access token stored in memory (not localStorage) for security
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

// Refresh logic
let isRefreshing = false
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = []

function processRefreshQueue(token: string | null, error: Error | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  refreshQueue = []
}

async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    accessToken = null
    throw new Error('Session expired')
  }

  const data = await res.json()
  accessToken = data.accessToken
  return data.accessToken
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  _retry = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  // If 401 and we haven't retried yet — try to refresh
  if (res.status === 401 && !_retry) {
    if (isRefreshing) {
      // Wait for the ongoing refresh
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then(() => request<T>(endpoint, options, true))
    }

    isRefreshing = true

    try {
      await refreshAccessToken()
      processRefreshQueue(accessToken, null)
      return request<T>(endpoint, options, true)
    } catch (err) {
      processRefreshQueue(null, err as Error)
      accessToken = null
      // Dispatch a custom event so AuthProvider can react
      window.dispatchEvent(new Event('auth:logout'))
      throw err
    } finally {
      isRefreshing = false
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = new Error(body.error || `Request failed: ${res.status}`)
    ;(error as any).status = res.status
    throw error
  }

  return res.json()
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}
