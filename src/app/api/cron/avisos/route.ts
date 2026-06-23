import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const LIMITE_HORAS = 4
const AVISO_MINUTOS = 30 // avisar 30 min antes

export async function GET(request: Request) {
  // Verificar que viene de Vercel Cron (seguridad básica)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const resend = new Resend(process.env.RESEND_API_KEY)

  const ahora = new Date()

  // Buscar sesiones activas donde:
  // hora_inicio + (LIMITE_HORAS * 60 - AVISO_MINUTOS) minutos <= ahora
  // O sea, llevan 3h30m cargando y no se ha enviado aviso
  const minutosTranscurridos = LIMITE_HORAS * 60 - AVISO_MINUTOS // 210 min = 3h30m
  const corteInicio = new Date(ahora.getTime() - minutosTranscurridos * 60 * 1000)
  // El límite máximo (4h) para no enviar avisos de sesiones ya vencidas
  const corteFin = new Date(ahora.getTime() - LIMITE_HORAS * 60 * 60 * 1000)

  const { data: sesiones, error } = await supabase
    .from('sesiones_carga')
    .select('id, placa, hora_inicio, user_id, estaciones(nombre), perfiles(correo, nombre_completo)')
    .eq('estado', 'activa')
    .eq('aviso_enviado', false)
    .lte('hora_inicio', corteInicio.toISOString())  // ya pasaron 3h30m
    .gte('hora_inicio', corteFin.toISOString())      // pero no más de 4h (no vencidas aún)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!sesiones || sesiones.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  let enviados = 0

  for (const sesion of sesiones) {
    const perfil = Array.isArray(sesion.perfiles) ? sesion.perfiles[0] : sesion.perfiles as any
    const estacion = Array.isArray(sesion.estaciones) ? sesion.estaciones[0] : sesion.estaciones as any

    if (!perfil?.correo) continue

    const horaInicio = new Date(sesion.hora_inicio)
    const horaLimite = new Date(horaInicio.getTime() + LIMITE_HORAS * 60 * 60 * 1000)
    const horaLimiteStr = horaLimite.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    try {
      await resend.emails.send({
        from: 'Celsia EV Charging <noreply@resend.dev>',
        to: perfil.correo,
        subject: '⚡ Tu tiempo de carga está por terminar — Celsia',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <div style="background: #16a34a; padding: 16px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">⚡ Celsia EV Charging</h1>
            </div>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 16px;">Hola <strong>${perfil.nombre_completo}</strong>,</p>
              <p style="color: #374151;">Te quedan <strong>30 minutos</strong> de carga en la estación:</p>
              <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px; margin: 16px 0;">
                <p style="margin: 0; font-weight: bold; color: #713f12;">📍 ${estacion?.nombre ?? 'Estación'}</p>
                <p style="margin: 4px 0 0; color: #713f12; font-size: 14px;">Placa: ${sesion.placa}</p>
              </div>
              <p style="color: #374151;">Tu tiempo máximo de carga <strong>(4 horas)</strong> vence a las <strong>${horaLimiteStr}</strong>.</p>
              <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px; margin: 16px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  🚗 Por favor retira tu vehículo a tiempo para que otros compañeros puedan usar la estación.
                </p>
              </div>
              <p style="color: #374151;">Recuerda finalizar tu sesión en la app después de desconectar el vehículo.</p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Celsia · Sistema de Carga Eléctrica</p>
            </div>
          </div>
        `,
      })

      // Marcar aviso como enviado
      await supabase
        .from('sesiones_carga')
        .update({ aviso_enviado: true })
        .eq('id', sesion.id)

      enviados++
    } catch (emailError) {
      console.error('Error enviando email a', perfil.correo, emailError)
    }
  }

  return NextResponse.json({ ok: true, enviados, total: sesiones.length })
}
