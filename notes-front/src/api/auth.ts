import { api, setAccessToken } from './client'

export interface AuthResponse {
  user: { id: string; email: string; name: string | null }
  accessToken: string
}

export interface UserInfo {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password })
  setAccessToken(res.accessToken)
  return res
}

export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', { email, password, name })
  setAccessToken(res.accessToken)
  return res
}

export async function getMe(): Promise<UserInfo> {
  return api.get<UserInfo>('/auth/me')
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
    // ignore — we clear state anyway
  }
  setAccessToken(null)
}

export async function refreshToken(): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/refresh')
  setAccessToken(res.accessToken)
  return res
}

export async function updateProfile(name: string): Promise<UserInfo> {
  return api.patch<UserInfo>('/auth/profile', { name })
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  return api.patch<{ success: boolean }>('/auth/password', { currentPassword, newPassword })
}
