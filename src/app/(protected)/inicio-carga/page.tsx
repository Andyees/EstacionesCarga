'use client'

import { useState, useEffect, useCallback } from 'react'
import { BatteryCharging, CheckCircle, Clock, Zap } from 'lucide-react'
import type { Estacion, SesionCarga } from '@/lib/supabase/types'

const LIMITE_HORAS = 4

function useTimer(horaInicio: string | null) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!horaInicio) return
    const update = () => setElapsed(Math.floor((Date.now() - new Date(horaInicio).getTime()) / 1000))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [horaInicio])

  const totalSeg = LIMITE_HORAS * 3600
  const restanteSeg = Math.max(0, totalSeg - elapsed)
  const horas = Math.floor(elapsed / 3600)
  const minutos = Math.floor((elapsed % 3600) / 60)
  const segundos = elapsed % 60
  const restH = Math.floor(restanteSeg / 3600)
  const restM = Math.floor((restanteSeg % 3600) / 60)
  const porcentaje = Math.min(100, (elapsed / totalSeg) * 100)
  const critico = restanteSeg < 30 * 60

  return { horas, minutos, segundos, restH, restM, porcentaje, critico, vencida: restanteSeg === 0 }
}

export default function InicioCargaPage() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([])
  const [correoSesion, setCorreoSesion] = useState('')
  const [placaSesion, setPlacaSesion] = useState('')
  const [nombreSesion, setNombreSesion] = useState('')
  const [sesionActiva, setSesionActiva] = useState<SesionCarga | null>(null)
  const [cargando, setCargando] = useState(true)
  const [loading, setLoading] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successFin, setSuccessFin] = useState(false)
  const [error, setError] = useState('')
  const [estacionId, setEstacionId] = useState('')
  const [confirmacion, setConfirmacion] = useState(false)
  const [confirmFin, setConfirmFin] = useState(false)

  const estacionSeleccionada = estaciones.find(e => e.id === estacionId)
  const timer = useTimer(sesionActiva?.hora_inicio || null)

  const cargarDatos = useCallback(() => {
    fetch('/api/datos-inicio')
      .then(r => r.json())
      .then(data => {
        if (data.correo) setCorreoSesion(data.correo)
        if (data.placa) setPlacaSesion(data.placa)
        if (data.nombre) setNombreSesion(data.nombre)
        if (data.estaciones) setEstaciones(data.estaciones)
        setSesionActiva(data.sesionActiva || null)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  async function handleIniciar(e: React.FormEvent) {
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
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => { setSuccess(false); cargarDatos() }, 2000)
      setLoading(false)
    }
  }

  async function handleFinalizar() {
    if (!confirmFin) { setError('Debes confirmar que retiraste el vehículo.'); return }
    if (!sesionActiva) return
    setFinalizando(true)
    setError('')
    const res = await fetch('/api/finalizar-carga', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sesion_id: sesionActiva.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al finalizar.')
      setFinalizando(false)
    } else {
      setSuccessFin(true)
      setTimeout(() => { setSuccessFin(false); setSesionActiva(null); setEstacionId(''); setConfirmacion(false); setConfirmFin(false) }, 2500)
      setFinalizando(false)
    }
  }

  if (cargando) {
    return <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">Cargando...</div>
  }

  if (successFin) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Carga finalizada!</h2>
        <p className="text-gray-500">Gracias por usar el servicio de carga Celsia.</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <CheckCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Carga iniciada!</h2>
        <p className="text-gray-500">Cargando tu sesión...</p>
      </div>
    )
  }

  // Vista: sesión activa
  if (sesionActiva) {
    const estNombre = (sesionActiva as any).estaciones?.nombre || '—'
    const estConector = (sesionActiva as any).estaciones?.tipo_conector || sesionActiva.tipo_conector

    return (
      <div className="space-y-4">
        {/* Bienvenida */}
        {nombreSesion && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <p className="text-sm font-semibold text-orange-700">¡Hola, {nombreSesion.split(' ')[0]}!</p>
          </div>
        )}

        {/* Temporizador */}
        <div className={`rounded-2xl shadow p-5 ${timer.vencida ? 'bg-red-50 border-2 border-red-400' : timer.critico ? 'bg-amber-50 border-2 border-amber-400' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`rounded-full p-2 ${timer.vencida ? 'bg-red-100' : timer.critico ? 'bg-amber-100' : 'bg-green-100'}`}>
              <Zap className={`w-6 h-6 ${timer.vencida ? 'text-red-500' : timer.critico ? 'text-amber-500' : 'text-green-500'}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sesión en curso</h2>
              <p className="text-xs text-gray-500">{estNombre} · {estConector}</p>
            </div>
          </div>

          {/* Tiempo transcurrido */}
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-1">Tiempo transcurrido</p>
            <p className="text-5xl font-bold tracking-tight text-gray-900 tabular-nums">
              {String(timer.horas).padStart(2,'0')}:{String(timer.minutos).padStart(2,'0')}
              <span className="text-2xl text-gray-400">:{String(timer.segundos).padStart(2,'0')}</span>
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${timer.vencida ? 'bg-red-500' : timer.critico ? 'bg-amber-400' : 'bg-green-400'}`}
              style={{ width: `${timer.porcentaje}%` }}
            />
          </div>

          {/* Tiempo restante */}
          {timer.vencida ? (
            <p className="text-center text-sm font-semibold text-red-600">¡Tiempo límite alcanzado! Por favor finaliza tu carga ahora.</p>
          ) : (
            <p className="text-center text-sm text-gray-500">
              Te quedan <span className={`font-semibold ${timer.critico ? 'text-amber-600' : 'text-gray-700'}`}>
                {timer.restH > 0 ? `${timer.restH}h ` : ''}{timer.restM}min
              </span> de {LIMITE_HORAS} horas permitidas
            </p>
          )}
        </div>

        {/* Confirmación y botón finalizar */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => setConfirmFin(c => !c)}>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                confirmFin ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'
              }`}>
                {confirmFin && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-sm text-gray-700">Confirmo que he retirado el vehículo y liberado la estación</span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

          <button onClick={handleFinalizar} disabled={finalizando}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-60 text-base">
            {finalizando ? 'Finalizando...' : 'Finalizar carga'}
          </button>
        </div>
      </div>
    )
  }

  // Vista: sin sesión activa — formulario de inicio
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

      <form onSubmit={handleIniciar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input value={correoSesion} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
          <input value={placaSesion} onChange={e => setPlacaSesion(e.target.value.toUpperCase())} className={inputCls} placeholder="ABC123" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estación *</label>
          {estaciones.length === 0 ? (
            <p className="text-sm text-red-400 py-3">No hay estaciones disponibles.</p>
          ) : (
            <select required value={estacionId} onChange={e => setEstacionId(e.target.value)} className={inputCls}>
              <option value="">Selecciona una estación</option>
              {estaciones.map(est => (
                <option key={est.id} value={est.id}>{est.nombre} — {est.ubicacion}</option>
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
            <span className="text-sm text-gray-700">Confirmo que he conectado correctamente el vehículo a la estación seleccionada</span>
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
