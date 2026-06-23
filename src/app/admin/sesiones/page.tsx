import { createClient } from '@/lib/supabase/server'

export default async function AdminSesionesPage() {
  const supabase = await createClient()

  const { data: sesiones } = await supabase
    .from('sesiones_carga')
    .select('*, estaciones(nombre), perfiles(nombre_completo, empresa)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Sesiones de Carga</h1>
        <span className="text-sm text-gray-500">{sesiones?.length ?? 0} registros</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
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
              {sesiones?.map(s => {
                const inicio = new Date(s.hora_inicio)
                const fin = s.hora_fin ? new Date(s.hora_fin) : null
                const durMin = fin ? Math.round((fin.getTime() - inicio.getTime()) / 60000) : null
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{(s as any).perfiles?.nombre_completo ?? '—'}</p>
                      <p className="text-xs text-gray-400">{(s as any).perfiles?.empresa}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{s.placa}</td>
                    <td className="px-4 py-3 text-gray-700">{(s as any).estaciones?.nombre ?? '—'}</td>
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
              {(!sesiones || sesiones.length === 0) && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin sesiones registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
