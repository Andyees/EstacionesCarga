import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encodeSession, COOKIE_NAME } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json()

  const supabase = await createClient()

  // Verificar si el correo ya existe
  const { data: existe } = await supabase
    .from('perfiles')
    .select('correo')
    .eq('correo', body.correo.toLowerCase().trim())
    .single()

  if (existe) {
    return NextResponse.json({ error: 'Este correo ya está registrado.' }, { status: 409 })
  }

  const { data: perfil, error } = await supabase
    .from('perfiles')
    .insert({
      id: crypto.randomUUID(),
      nombre_completo: body.nombre_completo,
      empresa: body.empresa,
      correo: body.correo.toLowerCase().trim(),
      celular: body.celular,
      placa: body.placa.toUpperCase(),
      tipo_conector: body.tipo_conector,
      marca_vehiculo: body.marca_vehiculo,
      acepto_reglamento: true,
      rol: 'user',
    })
    .select('id, correo, nombre_completo, rol')
    .single()

  if (error || !perfil) {
    return NextResponse.json({ error: error?.message || 'Error al registrar' }, { status: 500 })
  }

  const session = encodeSession({
    id: perfil.id,
    correo: perfil.correo,
    nombre_completo: perfil.nombre_completo,
    rol: perfil.rol,
  })

  const response = NextResponse.json({ ok: true, perfil })
  response.cookies.set(COOKIE_NAME, session, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  })
  return response
}
