'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail } from 'lucide-react'

export default function LoginPage() {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Verificar si el correo está registrado
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('correo')
      .eq('correo', correo)
      .single()

    if (!perfil) {
      setError('Este correo no está registrado. ¿Quieres registrarte?')
      setLoading(false)
      return
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: correo,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        shouldCreateUser: false,
      },
    })

    if (otpError) {
      setError('Error al enviar el enlace: ' + otpError.message)
      setLoading(false)
      return
    }

    setEnviado(true)
    setLoading(false)
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
            <Mail className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Revisa tu correo!</h2>
          <p className="text-gray-500 mb-4">
            Te enviamos un enlace de acceso a <strong>{correo}</strong>.<br />
            Haz clic en el enlace para ingresar.
          </p>
          <p className="text-xs text-gray-400">Si no lo ves, revisa la carpeta de spam.</p>
          <button onClick={() => setEnviado(false)} className="mt-4 text-sm text-green-600 hover:underline">
            Usar otro correo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-green-600 rounded-full p-3 mb-3">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Celsia EV Charging</h1>
            <p className="text-gray-500 text-sm mt-1">Ingresa con tu correo electrónico</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="tu@correo.com"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error}{' '}
                {error.includes('registrarte') && (
                  <Link href="/registro" className="underline font-medium">Regístrate aquí</Link>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Enviando enlace...' : 'Recibir enlace de acceso'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-green-600 font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
