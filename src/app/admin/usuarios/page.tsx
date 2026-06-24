import { createClient } from '@/lib/supabase/server'
import UsuariosClient from '@/components/UsuariosClient'

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
      <UsuariosClient usuarios={(usuarios ?? []) as any} />
    </div>
  )
}
