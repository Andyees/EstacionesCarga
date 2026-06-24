import { NextResponse, type NextRequest } from 'next/server'
import { decodeSession, COOKIE_NAME } from '@/lib/session'

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null

  const { pathname } = request.nextUrl
  const isAdminLoginPage = pathname === '/admin/login'
  const isProtected = ['/inicio-carga', '/fin-carga', '/admin'].some(p => pathname.startsWith(p)) && !isAdminLoginPage
  const isAuthPage = ['/login', '/registro'].some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    if (pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/admin/login', request.url))
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && user) {
    if (user.rol === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.redirect(new URL('/inicio-carga', request.url))
  }

  if ((pathname.startsWith('/inicio-carga') || pathname.startsWith('/fin-carga')) && user && user.rol === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (isAdminLoginPage && user && user.rol === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (pathname.startsWith('/admin') && !isAdminLoginPage && user && user.rol !== 'admin') {
    return NextResponse.redirect(new URL('/inicio-carga', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
