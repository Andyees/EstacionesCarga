'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BatteryFull, CheckCircle, AlertCircle } from 'lucide-react'
import type { SesionCarga } from '@/lib/supabase/types'

export default function FinCargaPage() {
  const [sesionActiva, setSesionActiva] = useState<SesionCarga | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [confirmacion, setConfirmacion] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const cookieVal = document.cookie.split('; ').find(r => r.startsWith('celsia_session='))?.split('=')[1]
      if (!cookieVal) { setLoadingData(false); return }
      const user = JSON.parse(atob(cookieVal))

      const { data } = await supabase
        .from('sesiones_carga')
        .select('*, estaciones(*)')
        .eq('user_id', user.id)
        .eq('estado', 'activa')
        .single()

      setSesionActiva(data)
      setLoadingData(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmacion) { setError('Debes confirmar que has retirado el vehículo y liberado la estación.'); return }
    if (!sesionActiva) return

    setLoading(true)
    setError('')

    const supabase = createClient()

    const horaFinISO = horaFin
      ? (() => {
          const [h, m] = horaFin.split(':')
          const d = new Date()
          d.setHours(+h, +m, 0, 0)
          return d.toISOString()
        })()
      : new Date().toISOString()

    const { error: updateError } = await supabase
      .from('sesiones_carga')
      .update({ hora_fin: horaFinISO, confirmacion_fin: true, estado: 'finalizada' })
      .eq('id', sesionActiva.id)

    if (updateError) {
      setError('Error al registrar la finalización: ' + updateError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (loadingData) {
    return <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">Cargando...</div>
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Carga finalizada!</h2>
        <p className="text-gray-500">La estación ha sido liberada. Gracias por usar el servicio de carga Celsia.</p>
      </div>
    )
  }

  if (!sesionActiva) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sin sesión activa</h2>
        <p className="text-gray-500">No tienes ninguna sesión de carga en curso. Primero inicia una carga.</p>
      </div>
    )
  }

  const inicio = new Date(sesionActiva.hora_inicio)

  return (
    <div className="bg-white rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 rounded-full p-2">
          <BatteryFull className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Finalización de Carga</h1>
          <p className="text-sm text-gray-500">Registra el fin de tu sesión de carga</p>
        </div>
      </div>

      {/* Resumen sesión activa */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-green-800 mb-2">Sesión en curso</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <span className="text-gray-500">Placa:</span><span className="font-medium">{sesionActiva.placa}</span>
          <span className="text-gray-500">Estación:</span><span className="font-medium">{sesionActiva.estaciones?.nombre || '—'}</span>
          <span className="text-gray-500">Conector:</span><span className="font-medium">{sesionActiva.tipo_conector}</span>
          <span className="text-gray-500">Inicio:</span><span className="font-medium">{inicio.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de finalización (opcional)</label>
          <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-400 mt-1">Si no indicas hora, se registra la hora actual.</p>
        </div>

        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={confirmacion} onChange={e => setConfirmacion(e.target.checked)}
              className="accent-blue-600 mt-0.5 w-4 h-4" />
            <span className="text-sm text-gray-700">
              <strong>Confirmación:</strong> ¿Confirma que ha retirado el vehículo y liberado la estación? — <strong>SI</strong>
            </span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60">
          {loading ? 'Registrando...' : 'Registrar finalización de carga'}
        </button>
      </form>
    </div>
  )
}
