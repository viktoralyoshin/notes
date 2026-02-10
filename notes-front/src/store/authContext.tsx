import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { setAccessToken } from '../api/client'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  refreshToken,
  getMe,
  type UserInfo,
} from '../api/auth'

interface AuthState {
  user: UserInfo | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: try to refresh token (cookie will be sent automatically)
  // If refresh succeeds, we get a new access token + user info
  useEffect(() => {
    refreshToken()
      .then((res) => {
        setUser({ id: res.user.id, email: res.user.email, name: res.user.name, createdAt: '' })
        // Now fetch full user info
        return getMe()
      })
      .then(setUser)
      .catch(() => {
        setAccessToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // Listen for forced logout (e.g. when refresh fails in interceptor)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null)
      setAccessToken(null)
    }

    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    setUser({ id: res.user.id, email: res.user.email, name: res.user.name, createdAt: '' })
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await apiRegister(email, password, name)
    setUser({ id: res.user.id, email: res.user.email, name: res.user.name, createdAt: '' })
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
