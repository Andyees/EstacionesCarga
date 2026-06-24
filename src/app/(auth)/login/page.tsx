'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [esAdmin, setEsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Si ya sabemos que es admin, hacer login de admin
    if (esAdmin) {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password }),
      })
      if (!res.ok) {
        setError('Contraseña incorrecta.')
        setLoading(false)
        return
      }
      router.push('/admin')
      router.refresh()
      return
    }

    // Login normal
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: correo }),
    })

    if (res.status === 404) {
      setError('Este correo no está registrado.')
      setLoading(false)
      return
    }

    if (res.status === 403) {
      // Es admin — mostrar campo de contraseña
      setEsAdmin(true)
      setError('')
      setLoading(false)
      return
    }

    if (!res.ok) {
      setError('Error al ingresar. Intenta de nuevo.')
      setLoading(false)
      return
    }

    router.push('/inicio-carga')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col items-center mb-7">
            <div className={`${esAdmin ? 'bg-purple-600' : 'bg-green-600'} rounded-full p-4 mb-3 shadow-lg transition-colors`}>
              {esAdmin ? <Shield className="w-9 h-9 text-white" /> : <Zap className="w-9 h-9 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Celsia EV Charging</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
              {esAdmin ? 'Acceso de administrador' : 'Ingresa con tu correo electrónico'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={correo}
                onChange={e => { setCorreo(e.target.value); setEsAdmin(false); setPassword('') }}
                className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 ${esAdmin ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-300 focus:ring-green-500'}`}
                placeholder="tu@correo.com"
                autoComplete="email"
                inputMode="email"
                autoFocus
              />
            </div>

            {esAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-purple-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm">
                {error}{' '}
                {error.includes('registrado') && (
                  <Link href="/registro" className="underline font-medium">Regístrate aquí</Link>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60 text-base ${esAdmin ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'}`}
            >
              {loading ? 'Verificando...' : esAdmin ? 'Ingresar como Admin' : 'Ingresar'}
            </button>
          </form>

          {!esAdmin && (
            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="text-green-600 font-medium hover:underline">
                Regístrate aquí
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
