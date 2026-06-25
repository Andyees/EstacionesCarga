import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null
  if (!user) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const { tipo_conector, placa } = await request.json()
  if (!tipo_conector) return NextResponse.json({ error: 'Selecciona un tipo de conector.' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Verificar que no tenga sesión activa
  const { data: activa } = await supabase
    .from('sesiones_carga')
    .select('id')
    .eq('user_id', user.id)
    .eq('estado', 'activa')
    .maybeSingle()

  if (activa) return NextResponse.json({ error: 'Ya tienes una sesión de carga activa. Finalízala antes de iniciar otra.' }, { status: 409 })

  // Obtener todas las estaciones del tipo seleccionado
  const { data: estacionesTipo } = await supabase
    .from('estaciones')
    .select('id')
    .eq('tipo_conector', tipo_conector)

  if (!estacionesTipo || estacionesTipo.length === 0) {
    return NextResponse.json({ error: 'No hay estaciones de ese tipo.' }, { status: 404 })
  }

  const ids = estacionesTipo.map((e: any) => e.id)

  // Ver cuáles están ocupadas ahora
  const { data: ocupadas } = await supabase
    .from('sesiones_carga')
    .select('estacion_id')
    .eq('estado', 'activa')
    .in('estacion_id', ids)

  const ocupadasIds = new Set((ocupadas || []).map((s: any) => s.estacion_id))
  const libres = ids.filter((id: string) => !ocupadasIds.has(id))

  if (libres.length === 0) {
    return NextResponse.json({ error: 'No hay estaciones disponibles de ese tipo en este momento.' }, { status: 409 })
  }

  // Verificar que el usuario no haya usado ya ese tipo hoy en todas las estaciones
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)
  const { data: yaUsoHoy } = await supabase
    .from('sesiones_carga')
    .select('estacion_id')
    .eq('user_id', user.id)
    .in('estacion_id', ids)
    .gte('hora_inicio', inicioDia.toISOString())

  const usadasHoy = new Set((yaUsoHoy || []).map((s: any) => s.estacion_id))
  const disponibles = libres.filter((id: string) => !usadasHoy.has(id))

  if (disponibles.length === 0) {
    return NextResponse.json({ error: 'Ya usaste todas las estaciones de ese tipo hoy.' }, { status: 409 })
  }

  // Asignar la primera estación libre disponible
  const estacion_id = disponibles[0]

  const { error: insertError } = await supabase.from('sesiones_carga').insert({
    user_id: user.id,
    placa: (placa || '').toUpperCase(),
    estacion_id,
    tipo_conector,
    hora_inicio: new Date().toISOString(),
    confirmacion_inicio: true,
    estado: 'activa',
  })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
