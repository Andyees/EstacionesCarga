'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, X, User, Car, Zap, MapPin, Clock, CheckCircle } from 'lucide-react'

const INTERVALO_SEG = 30

interface Sesion {
  id: string
  placa: string
  tipo_conector: string
  hora_inicio: string
  hora_fin: string | null
  estado: string
  estaciones: { nombre: string } | null
  perfiles: { nombre_completo: string; empresa: string } | null
}

function duracion(inicio: Date, fin: Date | null) {
  const fin_ = fin || new Date()
  const min = Math.floor((fin_.getTime() - inicio.getTime()) / 60000)
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

function Modal({ s, onClose }: { s: Sesion; onClose: () => void }) {
  const inicio = new Date(s.hora_inicio)
  const fin = s.hora_fin ? new Date(s.hora_fin) : null
  const activa = s.estado === 'activa'
  const elapsed = Math.floor((Date.now() - inicio.getTime()) / 1000)
  const totalSeg = 4 * 3600
  const porcentaje = Math.min(100, (elapsed / totalSeg) * 100)
  const critico = activa && (totalSeg - elapsed) < 30 * 60

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 pt-5 pb-4 ${activa ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-gray-600 to-gray-500'}`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${activa ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activa ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
                {activa ? 'EN CURSO' : 'FINALIZADA'}
              </span>
              <h2 className="text-white font-bold text-xl">{s.perfiles?.nombre_completo ?? '—'}</h2>
              <p className="text-white/70 text-sm">{s.perfiles?.empresa ?? ''}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 -mt-1 -mr-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Barra de tiempo si está activa */}
          {activa && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tiempo transcurrido: <strong>{duracion(inicio, null)}</strong></span>
                <span className={critico ? 'text-amber-600 font-semibold' : ''}>
                  {(() => {
                    const rest = Math.max(0, totalSeg - elapsed)
                    const rh = Math.floor(rest / 3600)
                    const rm = Math.floor((rest % 3600) / 60)
                    return `${rh > 0 ? rh + 'h ' : ''}${rm}min restantes`
                  })()}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${porcentaje >= 100 ? 'bg-red-500' : critico ? 'bg-amber-400' : 'bg-green-400'}`}
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon={<Car className="w-4 h-4 text-orange-500" />} label="Placa" value={s.placa} mono />
            <InfoCard icon={<Zap className="w-4 h-4 text-orange-500" />} label="Conector" value={s.tipo_conector} />
            <InfoCard icon={<MapPin className="w-4 h-4 text-orange-500" />} label="Estación" value={s.estaciones?.nombre ?? '—'} full />
            <InfoCard icon={<Clock className="w-4 h-4 text-orange-500" />} label="Inicio" value={inicio.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })} />
            <InfoCard
              icon={<CheckCircle className="w-4 h-4 text-orange-500" />}
              label={activa ? 'Duración hasta ahora' : 'Duración total'}
              value={duracion(inicio, fin)}
            />
            {fin && (
              <InfoCard icon={<Clock className="w-4 h-4 text-gray-400" />} label="Fin" value={fin.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })} />
            )}
          </div>
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

function InfoCard({ icon, label, value, mono, full }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 ${full ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className={`font-semibold text-gray-800 text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

export default function SesionesRealtime({ iniciales }: { iniciales: Sesion[] }) {
  const [sesiones, setSesiones] = useState<Sesion[]>(iniciales)
  const [countdown, setCountdown] = useState(INTERVALO_SEG)
  const [seleccionada, setSeleccionada] = useState<Sesion | null>(null)

  const recargar = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('sesiones_carga')
      .select('*, estaciones(nombre), perfiles(nombre_completo, empresa)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setSesiones(data as unknown as Sesion[])
    setCountdown(INTERVALO_SEG)
  }, [])

  useEffect(() => {
    const interval = setInterval(recargar, INTERVALO_SEG * 1000)
    const tick = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : INTERVALO_SEG)), 1000)
    return () => { clearInterval(interval); clearInterval(tick) }
  }, [recargar])

  const activas = sesiones.filter(s => s.estado === 'activa')
  const finalizadas = sesiones.filter(s => s.estado !== 'activa')

  return (
    <>
      {seleccionada && <Modal s={seleccionada} onClose={() => setSeleccionada(null)} />}

      <div className="space-y-4">
        {/* Resumen rápido */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-xs text-green-600 font-medium mb-0.5">Activas ahora</p>
            <p className="text-2xl font-bold text-green-700">{activas.length}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Total hoy</p>
            <p className="text-2xl font-bold text-gray-700">{sesiones.length}</p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
            <p className="text-xs text-gray-400">Toca una sesión para ver detalle</p>
            <button onClick={recargar} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition">
              <RefreshCw className="w-3.5 h-3.5" />{countdown}s
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {sesiones.length === 0 && (
              <p className="px-4 py-8 text-center text-gray-400 text-sm">Sin sesiones registradas</p>
            )}
            {sesiones.map(s => {
              const inicio = new Date(s.hora_inicio)
              const fin = s.hora_fin ? new Date(s.hora_fin) : null
              const activa = s.estado === 'activa'
              return (
                <button
                  key={s.id}
                  onClick={() => setSeleccionada(s)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-3 ${activa ? 'bg-green-50/50' : ''}`}
                >
                  {/* Indicador estado */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activa ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {s.perfiles?.nombre_completo ?? '—'}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {activa ? 'Activa' : 'Finalizada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span className="font-mono">{s.placa}</span>
                      <span>·</span>
                      <span>{s.estaciones?.nombre ?? '—'}</span>
                      <span>·</span>
                      <span>{duracion(inicio, fin)}</span>
                    </div>
                  </div>

                  <span className="text-gray-300 text-lg flex-shrink-0">›</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
