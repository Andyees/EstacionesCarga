import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encodeSession, COOKIE_NAME } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id, correo, nombre_completo, rol, password_hash')
    .eq('correo', email.toLowerCase().trim())
    .eq('rol', 'admin')
    .single()

  if (!perfil || !perfil.password_hash) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, perfil.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const session = encodeSession({
    id: perfil.id,
    correo: perfil.correo,
    nombre_completo: perfil.nombre_completo,
    rol: perfil.rol,
  })

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, session, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  })
  return response
}
