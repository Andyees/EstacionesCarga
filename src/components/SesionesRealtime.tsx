'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw } from 'lucide-react'

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

export default function SesionesRealtime({ iniciales }: { iniciales: Sesion[] }) {
  const [sesiones, setSesiones] = useState<Sesion[]>(iniciales)
  const [countdown, setCountdown] = useState(INTERVALO_SEG)

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

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex justify-end px-4 pt-3 pb-1">
        <button onClick={recargar} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition">
          <RefreshCw className="w-3.5 h-3.5" />{countdown}s
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Placa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estación</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Conector</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inicio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fin</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duración</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sesiones.map(s => {
              const inicio = new Date(s.hora_inicio)
              const fin = s.hora_fin ? new Date(s.hora_fin) : null
              const durMin = fin ? Math.round((fin.getTime() - inicio.getTime()) / 60000) : null
              return (
                <tr key={s.id} className={`hover:bg-gray-50 transition ${s.estado === 'activa' ? 'bg-green-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.perfiles?.nombre_completo ?? '—'}</p>
                    <p className="text-xs text-gray-400">{s.perfiles?.empresa}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">{s.placa}</td>
                  <td className="px-4 py-3 text-gray-700">{s.estaciones?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{s.tipo_conector}</td>
                  <td className="px-4 py-3 text-gray-700">{inicio.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-4 py-3 text-gray-700">{fin ? fin.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{durMin != null ? `${durMin} min` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.estado}
                    </span>
                  </td>
                </tr>
              )
            })}
            {sesiones.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin sesiones registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
