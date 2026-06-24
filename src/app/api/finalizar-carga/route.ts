import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null
  if (!user) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const { sesion_id } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase
    .from('sesiones_carga')
    .update({ hora_fin: new Date().toISOString(), confirmacion_fin: true, estado: 'finalizada' })
    .eq('id', sesion_id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
