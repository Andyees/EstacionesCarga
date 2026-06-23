import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encodeSession, COOKIE_NAME } from '@/lib/session'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) return NextResponse.json({ error: 'Correo requerido' }, { status: 400 })

  const supabase = await createClient()
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id, correo, nombre_completo, rol')
    .eq('correo', email.toLowerCase().trim())
    .single()

  if (!perfil) {
    return NextResponse.json({ error: 'no_registrado' }, { status: 404 })
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
