'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function TestCronButton() {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [resultado, setResultado] = useState<string>('')

  async function probar() {
    setEstado('loading')
    setResultado('')
    try {
      const res = await fetch('/api/admin/test-cron', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setEstado('error')
        setResultado(data.error || `Error ${res.status}`)
      } else {
        setEstado('ok')
        setResultado(`Ejecutado — ${data.enviados ?? 0} correo(s) enviado(s) de ${data.total ?? 0} sesión(es) elegible(s)`)
      }
    } catch (e: any) {
      setEstado('error')
      setResultado(e.message || 'Error de red')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Prueba de correos (cron)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ejecuta el cron manualmente y muestra cuántos correos se enviaron</p>
        </div>
        <button
          onClick={probar}
          disabled={estado === 'loading'}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-60"
        >
          {estado === 'loading'
            ? <><Loader2 className="w-4 h-4 animate-spin" />Probando...</>
            : <><Mail className="w-4 h-4" />Probar envío</>
          }
        </button>
      </div>

      {resultado && (
        <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
          estado === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {estado === 'ok'
            ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          }
          <span>{resultado}</span>
        </div>
      )}
    </div>
  )
}
