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

  const estacionesOcupadas = new Set((sesionesActivas || []).map((s: any) => s.estacion_id))

  return NextResponse.json({
    correo: perfil?.correo || user.correo,
    placa: perfil?.placa || '',
    nombre: perfil?.nombre_completo || user.nombre_completo || '',
    estaciones: (estaciones || []).map((e: any) => ({ ...e, ocupada: estacionesOcupadas.has(e.id) })),
    sesionActiva: sesionActiva || null,
  })
}
