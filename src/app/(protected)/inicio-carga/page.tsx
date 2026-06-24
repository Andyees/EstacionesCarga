'use client'

import { useState, useEffect } from 'react'
import { BatteryCharging, CheckCircle } from 'lucide-react'
import type { Estacion } from '@/lib/supabase/types'

export default function InicioCargaPage() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([])
  const [correoSesion, setCorreoSesion] = useState('')
  const [placaSesion, setPlacaSesion] = useState('')
  const [nombreSesion, setNombreSesion] = useState('')
  const [cargando, setCargando] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [estacionId, setEstacionId] = useState('')
  const [confirmacion, setConfirmacion] = useState(false)

  const estacionSeleccionada = estaciones.find(e => e.id === estacionId)

  useEffect(() => {
    fetch('/api/datos-inicio')
      .then(r => r.json())
      .then(data => {
        if (data.correo) setCorreoSesion(data.correo)
        if (data.placa) setPlacaSesion(data.placa)
        if (data.nombre) setNombreSesion(data.nombre)
        if (data.estaciones) setEstaciones(data.estaciones)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmacion) { setError('Debes confirmar que has conectado correctamente el vehículo.'); return }
    if (!estacionId) { setError('Selecciona una estación.'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/iniciar-carga', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estacion_id: estacionId, placa: placaSesion }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al registrar.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <CheckCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Carga iniciada!</h2>
        <p className="text-gray-500 mb-6">Tu sesión de carga ha sido registrada correctamente.</p>
        <button onClick={() => { setSuccess(false); setEstacionId(''); setConfirmacion(false) }}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition w-full">
          Nueva sesión
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-orange-100 rounded-full p-2">
          <BatteryCharging className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Inicio de Carga</h1>
          <p className="text-xs text-gray-500">Registra el inicio de tu sesión</p>
        </div>
      </div>

      {nombreSesion && (
        <div className="mb-5 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">👋</span>
          <div>
            <p className="text-sm font-semibold text-orange-700">¡Bienvenido, {nombreSesion.split(' ')[0]}!</p>
            <p className="text-xs text-orange-500">Completa los datos para iniciar tu carga.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input value={correoSesion} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
          <input
            value={placaSesion}
            onChange={e => setPlacaSesion(e.target.value.toUpperCase())}
            className={inputCls}
            placeholder="ABC123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estación *</label>
          {cargando ? (
            <p className="text-sm text-gray-400 py-3">Cargando estaciones...</p>
          ) : estaciones.length === 0 ? (
            <p className="text-sm text-red-400 py-3">No hay estaciones disponibles.</p>
          ) : (
            <select
              required
              value={estacionId}
              onChange={e => setEstacionId(e.target.value)}
              className={inputCls}
            >
              <option value="">Selecciona una estación</option>
              {estaciones.map(est => (
                <option key={est.id} value={est.id}>
                  {est.nombre} — {est.ubicacion}
                </option>
              ))}
            </select>
          )}
        </div>

        {estacionSeleccionada && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
            Conector: <span className="font-semibold">{estacionSeleccionada.tipo_conector}</span>
          </div>
        )}

        <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer" onClick={() => setConfirmacion(c => !c)}>
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
              confirmacion ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'
            }`}>
              {confirmacion && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-sm text-gray-700">
              Confirmo que he conectado correctamente el vehículo a la estación seleccionada
            </span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-800 text-white font-semibold py-4 rounded-xl transition disabled:opacity-60 text-base">
          {loading ? 'Registrando...' : 'Registrar inicio de carga'}
        </button>
      </form>
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
