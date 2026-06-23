import { createClient } from '@/lib/supabase/server'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()

  const { data: usuarios } = await supabase
    .from('perfiles')
    .select('*, sesiones_carga(count)')
    .eq('rol', 'user')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Usuarios Registrados</h1>
        <span className="text-sm text-gray-500">{usuarios?.length ?? 0} usuarios</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Correo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Celular</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Placa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Conector</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marca</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sesiones</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios?.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.nombre_completo}</td>
                  <td className="px-4 py-3 text-gray-600">{u.empresa}</td>
                  <td className="px-4 py-3 text-gray-600">{u.correo}</td>
                  <td className="px-4 py-3 text-gray-600">{u.celular}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{u.placa}</td>
                  <td className="px-4 py-3 text-gray-600">{u.tipo_conector}</td>
                  <td className="px-4 py-3 text-gray-600">{u.marca_vehiculo}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {(u as any).sesiones_carga?.[0]?.count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
              {(!usuarios || usuarios.length === 0) && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Sin usuarios registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
