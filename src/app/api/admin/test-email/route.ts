import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import { Resend } from 'resend'

export async function POST() {
  const cookieStore = await cookies()
  const user = decodeSession(cookieStore.get(COOKIE_NAME)?.value ?? '')
  if (!user || user.rol !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Celsia EV Charging <onboarding@resend.dev>',
      to: user.correo,
      subject: '✅ Prueba de correo — Celsia EV Charging',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <div style="background: #f97316; padding: 16px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">⚡ Celsia EV Charging</h1>
          </div>
          <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px;">Hola <strong>${user.nombre_completo}</strong>,</p>
            <p style="color: #374151;">Este es un correo de prueba para verificar que el sistema de notificaciones está funcionando correctamente.</p>
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; margin: 16px 0; text-align: center;">
              <p style="margin: 0; font-weight: bold; color: #166534;">✅ El envío de correos funciona correctamente</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Celsia · Sistema de Carga Eléctrica</p>
          </div>
        </div>
      `,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
