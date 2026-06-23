'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, CheckCircle2, RefreshCw } from 'lucide-react'
import type { Estacion } from '@/lib/supabase/types'

const INTERVALO_SEG = 30

interface SesionActiva {
  estacion_id: string
  placa: string
  nombre_completo: string
  desde: string
}

interface Props {
  estacionesIniciales: Estacion[]
  sesionesInicialesMap: Record<string, SesionActiva>
}

export default function EstacionesRealtime({ estacionesIniciales, sesionesInicialesMap }: Props) {
  const [ocupadas, setOcupadas] = useState<Record<string, SesionActiva>>(sesionesInicialesMap)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date())
  const [countdown, setCountdown] = useState(INTERVALO_SEG)

  const recargar = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('sesiones_carga')
      .select('estacion_id, placa, hora_inicio, perfiles(nombre_completo)')
      .eq('estado', 'activa')

    const mapa: Record<string, SesionActiva> = {}
    data?.forEach(s => {
      if (s.estacion_id) {
        const perfil = Array.isArray(s.perfiles) ? s.perfiles[0] : s.perfiles
        mapa[s.estacion_id] = {
          estacion_id: s.estacion_id,
          placa: s.placa,
          nombre_completo: (perfil as any)?.nombre_completo ?? '—',
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
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Estado de estaciones</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {libres}/{estacionesIniciales.length} libres · actualizado {ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button onClick={recargar} title="Actualizar ahora"
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition">
            <RefreshCw className="w-3.5 h-3.5" />
            {countdown}s
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {estacionesIniciales.map(est => {
          const sesion = ocupadas[est.id]
          const ocupada = !!sesion
          const desde = sesion
            ? new Date(sesion.desde).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            : null

          return (
            <div
              key={est.id}
              className={`rounded-lg border-2 p-4 flex flex-col gap-2 transition-all duration-500 ${
                ocupada ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
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
              {ocupada && sesion && (
                <div className="text-xs text-red-700 bg-red-100 rounded px-2 py-1 space-y-0.5">
                  <p><span className="font-medium">Placa:</span> {sesion.placa}</p>
                  <p><span className="font-medium">Usuario:</span> {sesion.nombre_completo}</p>
                  <p><span className="font-medium">Desde:</span> {desde}</p>
                </div>
              )}
              {!ocupada && (
                <div className="flex items-center gap-1 text-xs text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Disponible
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
