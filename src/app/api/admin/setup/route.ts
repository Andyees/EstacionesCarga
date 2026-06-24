import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Endpoint temporal para configurar contraseña inicial del admin
// Eliminar después de usar
export async function GET() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const hash = await bcrypt.hash('madrid25_', 10)

  const { error } = await supabase
    .from('perfiles')
    .update({ password_hash: hash })
    .eq('correo', 'andguja@gmail.com')
    .eq('rol', 'admin')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
