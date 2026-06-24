import { createClient } from '@/lib/supabase/server'
import { Activity, Users, BatteryCharging, Clock } from 'lucide-react'
import AdminCharts from '@/components/AdminCharts'
import EstacionesRealtime from '@/components/EstacionesRealtime'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsuarios },
    { count: totalSesiones },
    { count: sesionesActivas },
    { data: sesionesData },
    { data: estaciones },
    { data: sesionesActivasDetalle },
  ] = await Promise.all([
    supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('rol', 'user'),
    supabase.from('sesiones_carga').select('*', { count: 'exact', head: true }),
    supabase.from('sesiones_carga').select('*', { count: 'exact', head: true }).eq('estado', 'activa'),
    supabase.from('sesiones_carga').select('created_at, tipo_conector, estado, hora_inicio, hora_fin').order('created_at', { ascending: false }).limit(200),
    supabase.from('estaciones').select('*').eq('activa', true).order('nombre'),
    supabase.from('sesiones_carga').select('estacion_id, placa, hora_inicio, perfiles(nombre_completo, celular)').eq('estado', 'activa'),
  ])

  // Sesiones por día (últimos 7 días)
  const sesionesPorDia: Record<string, number> = {}
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    sesionesPorDia[d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })] = 0
  }
  sesionesData?.forEach(s => {
    const d = new Date(s.created_at)
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diff <= 6) {
      const key = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
      sesionesPorDia[key] = (sesionesPorDia[key] || 0) + 1
    }
  })

  const finalizadas = sesionesData?.filter(s => s.estado === 'finalizada' && s.hora_fin) || []
  const duracionPromMin = finalizadas.length > 0
    ? Math.round(finalizadas.reduce((acc, s) => {
        const dur = (new Date(s.hora_fin!).getTime() - new Date(s.hora_inicio).getTime()) / 60000
        return acc + (dur > 0 ? dur : 0)
      }, 0) / finalizadas.length)
    : 0

  const porConector = (sesionesData || []).reduce((acc: Record<string, number>, s) => {
    acc[s.tipo_conector] = (acc[s.tipo_conector] || 0) + 1
    return acc
  }, {})

  const chartData = {
    sesionesPorDia: Object.entries(sesionesPorDia).map(([dia, total]) => ({ dia, total })),
    porConector: Object.entries(porConector).map(([name, value]) => ({ name, value })),
  }

  // Mapa inicial de estaciones ocupadas para el componente realtime
  const sesionesMap: Record<string, { estacion_id: string; placa: string; nombre_completo: string; celular: string; desde: string }> = {}
  sesionesActivasDetalle?.forEach(s => {
    if (s.estacion_id) {
      const perfil = (Array.isArray(s.perfiles) ? s.perfiles[0] : s.perfiles) as { nombre_completo: string; celular: string } | null
      sesionesMap[s.estacion_id] = {
        estacion_id: s.estacion_id,
        placa: s.placa,
        nombre_completo: perfil?.nombre_completo ?? '—',
        celular: perfil?.celular ?? '—',
        desde: s.hora_inicio,
      }
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-blue-600" />} label="Usuarios registrados" value={totalUsuarios ?? 0} color="blue" />
        <StatCard icon={<Activity className="w-5 h-5 text-green-600" />} label="Total sesiones" value={totalSesiones ?? 0} color="green" />
        <StatCard icon={<BatteryCharging className="w-5 h-5 text-amber-600" />} label="Sesiones activas" value={sesionesActivas ?? 0} color="amber" />
        <StatCard icon={<Clock className="w-5 h-5 text-purple-600" />} label="Duración promedio" value={`${duracionPromMin} min`} color="purple" />
      </div>

      {/* Componente en tiempo real — se actualiza sin recargar */}
      <EstacionesRealtime
        estacionesIniciales={estaciones ?? []}
        sesionesInicialesMap={sesionesMap}
      />

      <AdminCharts data={chartData} />
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50', green: 'bg-green-50', amber: 'bg-amber-50', purple: 'bg-purple-50'
  }
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className={`${colors[color]} rounded-lg p-2 w-fit mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
