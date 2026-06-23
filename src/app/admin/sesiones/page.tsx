import { createClient } from '@/lib/supabase/server'
import SesionesRealtime from '@/components/SesionesRealtime'

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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-500">en vivo</span>
        </div>
      </div>
      <SesionesRealtime iniciales={(sesiones ?? []) as any} />
    </div>
  )
}
