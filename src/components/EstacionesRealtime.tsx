'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, CheckCircle2, RefreshCw, X, Car, User, Clock, MapPin, Phone } from 'lucide-react'
import type { Estacion } from '@/lib/supabase/types'

const INTERVALO_SEG = 30

interface SesionActiva {
  estacion_id: string
  placa: string
  nombre_completo: string
  celular: string
  desde: string
}

interface Props {
  estacionesIniciales: Estacion[]
  sesionesInicialesMap: Record<string, SesionActiva>
}

function useElapsed(desde: string | null) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!desde) return
    const update = () => setElapsed(Math.floor((Date.now() - new Date(desde).getTime()) / 1000))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [desde])
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const porcentaje = Math.min(100, (elapsed / (4 * 3600)) * 100)
  const critico = elapsed > 3 * 3600 + 30 * 60
  const vencida = elapsed >= 4 * 3600
  const restSeg = Math.max(0, 4 * 3600 - elapsed)
  const rh = Math.floor(restSeg / 3600)
  const rm = Math.floor((restSeg % 3600) / 60)
  return { h, m, s, porcentaje, critico, vencida, rh, rm }
}

function EstacionModal({ est, sesion, onClose }: { est: Estacion; sesion: SesionActiva | null; onClose: () => void }) {
  const ocupada = !!sesion
  const timer = useElapsed(sesion?.desde ?? null)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 pt-5 pb-4 ${ocupada ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white mb-2">
                <span className={`w-1.5 h-1.5 rounded-full bg-white ${ocupada ? 'animate-pulse' : ''}`} />
                {ocupada ? 'OCUPADA' : 'LIBRE'}
              </span>
              <h2 className="text-white font-bold text-xl">{est.nombre}</h2>
              <p className="text-white/70 text-sm">{est.ubicacion}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 -mt-1 -mr-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Info estación */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-400 font-medium">Conector</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{est.tipo_conector}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-400 font-medium">Ubicación</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{est.ubicacion}</p>
            </div>
          </div>

          {ocupada && sesion && (
            <>
              {/* Barra de tiempo */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>
                    Tiempo: <strong className="tabular-nums">
                      {String(timer.h).padStart(2,'0')}:{String(timer.m).padStart(2,'0')}:{String(timer.s).padStart(2,'0')}
                    </strong>
                  </span>
                  <span className={timer.critico ? 'text-amber-600 font-semibold' : ''}>
                    {timer.vencida ? '¡Tiempo vencido!' : `${timer.rh > 0 ? timer.rh + 'h ' : ''}${timer.rm}min restantes`}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${timer.vencida ? 'bg-red-500' : timer.critico ? 'bg-amber-400' : 'bg-green-400'}`}
                    style={{ width: `${timer.porcentaje}%` }}
                  />
                </div>
              </div>

              {/* Datos usuario */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-400 font-medium">Usuario</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{sesion.nombre_completo}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Car className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-gray-400 font-medium">Placa</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm font-mono">{sesion.placa}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-gray-400 font-medium">Desde</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {new Date(sesion.desde).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-gray-400 font-medium">Celular</span>
                    </div>
                    <a href={`tel:${sesion.celular}`} className="font-semibold text-orange-600 text-sm hover:underline">
                      {sesion.celular}
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {!ocupada && (
            <div className="flex items-center justify-center gap-2 py-4 text-green-600 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-sm">Estación disponible</span>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EstacionesRealtime({ estacionesIniciales, sesionesInicialesMap }: Props) {
  const [ocupadas, setOcupadas] = useState<Record<string, SesionActiva>>(sesionesInicialesMap)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date())
  const [countdown, setCountdown] = useState(INTERVALO_SEG)
  const [seleccionada, setSeleccionada] = useState<Estacion | null>(null)

  const recargar = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('sesiones_carga')
      .select('estacion_id, placa, hora_inicio, perfiles(nombre_completo, celular)')
      .eq('estado', 'activa')
    const mapa: Record<string, SesionActiva> = {}
    data?.forEach(s => {
      if (s.estacion_id) {
        const perfil = Array.isArray(s.perfiles) ? s.perfiles[0] : s.perfiles
        mapa[s.estacion_id] = {
          estacion_id: s.estacion_id,
          placa: s.placa,
          nombre_completo: (perfil as any)?.nombre_completo ?? '—',
          celular: (perfil as any)?.celular ?? '—',
          desde: s.hora_inicio,
        }
      }
    })
    setOcupadas(mapa)
    setUltimaActualizacion(new Date())
    setCountdown(INTERVALO_SEG)
  }, [])

  useEffect(() => {
    const interval = setInterval(recargar, INTERVALO_SEG * 1000)
    const tick = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : INTERVALO_SEG)), 1000)
    return () => { clearInterval(interval); clearInterval(tick) }
  }, [recargar])

  const libres = estacionesIniciales.filter(e => !ocupadas[e.id]).length

  return (
    <>
      {seleccionada && (
        <EstacionModal
          est={seleccionada}
          sesion={ocupadas[seleccionada.id] ?? null}
          onClose={() => setSeleccionada(null)}
        />
      )}

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Estado de estaciones</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {libres}/{estacionesIniciales.length} libres · actualizado {ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button onClick={recargar} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition">
              <RefreshCw className="w-3.5 h-3.5" />{countdown}s
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {estacionesIniciales.map(est => {
            const sesion = ocupadas[est.id]
            const ocupada = !!sesion
            return (
              <button
                key={est.id}
                onClick={() => setSeleccionada(est)}
                className={`rounded-xl border-2 p-4 flex flex-col gap-2 transition-all duration-300 text-left w-full hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  ocupada ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-green-300 bg-green-50 hover:border-green-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${ocupada ? 'text-red-500' : 'text-green-600'}`} />
                    <span className="font-semibold text-sm text-gray-900">{est.nombre}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ocupada ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {ocupada ? 'OCUPADA' : 'LIBRE'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{est.ubicacion} · {est.tipo_conector}</p>
                {ocupada && sesion ? (
                  <div className="text-xs text-red-700 space-y-0.5">
                    <p className="font-medium truncate">{sesion.nombre_completo}</p>
                    <p className="font-mono">{sesion.placa}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Disponible
                  </div>
                )}
                <p className="text-xs text-gray-400 text-right">Toca para ver detalle →</p>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
