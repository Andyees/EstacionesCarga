import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null

  if (!user || user.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { user_id, accion, password } = await request.json()
  const supabase = await createClient()

  if (accion === 'promover') {
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
    const hash = await bcrypt.hash(password, 10)
    const { error } = await supabase
      .from('perfiles')
      .update({ rol: 'admin', password_hash: hash })
      .eq('id', user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (accion === 'degradar') {
    const { error } = await supabase
      .from('perfiles')
      .update({ rol: 'user', password_hash: null })
      .eq('id', user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (accion === 'cambiar_password') {
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
    const hash = await bcrypt.hash(password, 10)
    const { error } = await supabase
      .from('perfiles')
      .update({ password_hash: hash })
      .eq('id', user_id)
      .eq('rol', 'admin')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
