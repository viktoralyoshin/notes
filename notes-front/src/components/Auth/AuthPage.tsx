import { useState } from 'react'
import { useAuth } from '../../store/authContext'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name || undefined)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Docket</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your notes, organized</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a2a2a] p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">
            {isLogin ? 'Sign in' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#111111] text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-gray-200 dark:border-[#333] focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#111111] text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-gray-200 dark:border-[#333] focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#111111] text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-gray-200 dark:border-[#333] focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
            />

            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? '...' : isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* Demo credentials hint */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Demo: demo@docket.app / demo123
        </p>
      </div>
    </div>
  )
}
