'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function TestCronButton() {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function enviar() {
    setEstado('loading')
    setMsg('')
    const res = await fetch('/api/admin/test-email', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setEstado('ok')
      setMsg('Correo de prueba enviado a tu correo.')
    } else {
      setEstado('error')
      setMsg(data.error || 'Error al enviar.')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700">Prueba de correos</h2>
        {msg && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${estado === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
            {estado === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {msg}
          </p>
        )}
      </div>
      <button
        onClick={enviar}
        disabled={estado === 'loading'}
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-60 flex-shrink-0"
      >
        {estado === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        {estado === 'loading' ? 'Enviando...' : 'Enviar correo de prueba'}
      </button>
    </div>
  )
}
