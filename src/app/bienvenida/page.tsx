'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap } from 'lucide-react'

export default function BienvenidaPage() {
  const router = useRouter()

  useEffect(() => {
    async function completarRegistro() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Verificar si ya tiene perfil
      const { data: perfilExistente } = await supabase
        .from('perfiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (perfilExistente) {
        router.push('/inicio-carga')
        return
      }

      // Recuperar datos del registro guardados antes del magic link
      const pendiente = localStorage.getItem('perfil_pendiente')
      if (pendiente) {
        const datos = JSON.parse(pendiente)
        await supabase.from('perfiles').insert({
          id: user.id,
          nombre_completo: datos.nombre_completo,
          empresa: datos.empresa,
          correo: datos.correo,
          celular: datos.celular,
          placa: datos.placa,
          tipo_conector: datos.tipo_conector,
          marca_vehiculo: datos.marca_vehiculo,
          acepto_reglamento: true,
          rol: 'user',
        })
        localStorage.removeItem('perfil_pendiente')
      }

      router.push('/inicio-carga')
    }

    completarRegistro()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="bg-green-600 rounded-full p-4 w-fit mx-auto mb-4 animate-pulse">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 font-medium">Configurando tu cuenta...</p>
      </div>
    </div>
  )
}
