import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null
  if (!user) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const { estacion_id, placa } = await request.json()
  if (!estacion_id) return NextResponse.json({ error: 'Selecciona una estación.' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Verificar sesión activa
  const { data: activa } = await supabase
    .from('sesiones_carga')
    .select('id')
    .eq('user_id', user.id)
    .eq('estado', 'activa')
    .maybeSingle()

  if (activa) return NextResponse.json({ error: 'Ya tienes una sesión de carga activa. Finalízala antes de iniciar otra.' }, { status: 409 })

  // Verificar que la estación no esté ocupada por otro usuario
  const { data: estacionOcupada } = await supabase
    .from('sesiones_carga')
    .select('id')
    .eq('estacion_id', estacion_id)
    .eq('estado', 'activa')
    .maybeSingle()

  if (estacionOcupada) {
    return NextResponse.json({ error: 'Esta estación ya está ocupada. Por favor selecciona otra.' }, { status: 409 })
  }

  // Verificar uso de la misma estación hoy
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)
  const { data: yaUsoHoy } = await supabase
    .from('sesiones_carga')
    .select('id')
    .eq('user_id', user.id)
    .eq('estacion_id', estacion_id)
    .gte('hora_inicio', inicioDia.toISOString())
    .limit(1)

  if (yaUsoHoy && yaUsoHoy.length > 0) {
    return NextResponse.json({ error: 'Ya usaste esta estación hoy. Por favor elige otra estación disponible.' }, { status: 409 })
  }

  // Obtener tipo de conector de la estación
  const { data: estacion } = await supabase
    .from('estaciones')
    .select('tipo_conector')
    .eq('id', estacion_id)
    .single()

  const { error: insertError } = await supabase.from('sesiones_carga').insert({
    user_id: user.id,
    placa: (placa || '').toUpperCase(),
    estacion_id,
    tipo_conector: estacion?.tipo_conector,
    hora_inicio: new Date().toISOString(),
    confirmacion_inicio: true,
    estado: 'activa',
  })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
