import { api, setToken } from './client'

export interface AuthResponse {
  user: { id: string; email: string; name: string | null }
  token: string
}

export interface UserInfo {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password })
  setToken(res.token)
  return res
}

export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', { email, password, name })
  setToken(res.token)
  return res
}

export async function getMe(): Promise<UserInfo> {
  return api.get<UserInfo>('/auth/me')
}
