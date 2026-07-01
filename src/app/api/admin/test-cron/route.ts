import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null
  if (!user || user.rol !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const base = new URL(request.url).origin
  const res = await fetch(`${base}/api/cron/avisos?secret=${process.env.CRON_SECRET}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
