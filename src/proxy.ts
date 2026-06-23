import { NextResponse, type NextRequest } from 'next/server'
import { decodeSession, COOKIE_NAME } from '@/lib/session'

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null

  const { pathname } = request.nextUrl
  const isProtected = ['/inicio-carga', '/fin-carga', '/admin'].some(p => pathname.startsWith(p))
  const isAuthPage = ['/login', '/registro'].some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/inicio-carga', request.url))
  }

  if (pathname.startsWith('/admin') && user && user.rol !== 'admin') {
    return NextResponse.redirect(new URL('/inicio-carga', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
