import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null

  if (!user) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: perfil }, { data: estaciones }, { data: sesionActiva }, { data: sesionesActivas }] = await Promise.all([
    supabase.from('perfiles').select('placa, correo, nombre_completo').eq('id', user.id).single(),
    supabase.from('estaciones').select('*').order('nombre'),
    supabase.from('sesiones_carga').select('*, estaciones(nombre, tipo_conector)').eq('user_id', user.id).eq('estado', 'activa').maybeSingle(),
    supabase.from('sesiones_carga').select('estacion_id').eq('estado', 'activa'),
  ])

  const ocupadasIds = new Set((sesionesActivas || []).map((s: any) => s.estacion_id))

  // Agrupar por tipo de conector
  const grupos: Record<string, { tipo: string; total: number; libres: number }> = {}
  for (const e of (estaciones || [])) {
    if (!grupos[e.tipo_conector]) grupos[e.tipo_conector] = { tipo: e.tipo_conector, total: 0, libres: 0 }
    grupos[e.tipo_conector].total++
    if (!ocupadasIds.has(e.id)) grupos[e.tipo_conector].libres++
  }

  return NextResponse.json({
    correo: perfil?.correo || user.correo,
    placa: perfil?.placa || '',
    nombre: perfil?.nombre_completo || user.nombre_completo || '',
    tiposConector: Object.values(grupos),
    sesionActiva: sesionActiva || null,
  })
}
