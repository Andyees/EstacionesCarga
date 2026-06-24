'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Shield } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel izquierdo — imagen estación */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/estacion-carga.png" alt="Estación de carga Celsia" fill className="object-cover" />
        <div className="absolute inset-0 bg-orange-900/40 flex flex-col justify-end p-10">
          <p className="text-white text-3xl font-bold leading-tight">#AvancemosAlFuturo</p>
          <p className="text-orange-100 mt-2">Sistema de gestión de estaciones de carga eléctrica</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Logo Celsia */}
          <div className="flex flex-col items-center mb-8">
            <Image src="/Logo2.png" alt="Celsia" width={72} height={72} className="object-contain mb-3" />
            <Image src="/celsia-logo.png" alt="Celsia" width={130} height={52} className="object-contain mb-3 rounded-lg" />
            <h1 className="text-xl font-bold text-gray-900">Estaciones de Carga Eléctrica</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
              {esAdmin ? 'Acceso de administrador' : 'Ingresa con tu correo electrónico'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {esAdmin && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-4">
                <Shield className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm text-orange-700 font-medium">Acceso administrador detectado</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={e => { setCorreo(e.target.value); setEsAdmin(false); setPassword('') }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full border border-orange-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60 text-base"
              >
                {loading ? 'Verificando...' : esAdmin ? 'Ingresar como Admin' : 'Ingresar'}
              </button>
            </form>

            {!esAdmin && (
              <p className="text-center text-sm text-gray-500 mt-5">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="text-orange-500 font-medium hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
