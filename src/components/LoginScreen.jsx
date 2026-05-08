import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'

const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'Vintora2026'

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-gray-600 transition-colors'

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (username === 'Anas' && password === CORRECT_PASSWORD) {
      sessionStorage.setItem('vb_logged_in', 'true')
      onLogin()
    } else {
      setError('Benutzername oder Passwort falsch.')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md mx-auto mb-3">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vinted Buchhaltung</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Bitte melde dich an</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Benutzername
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder=""
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Passwort
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              className={inputCls}
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg transition-colors shadow-sm"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  )
}
