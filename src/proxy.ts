import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/inicio-carga', '/fin-carga', '/admin']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  const isAuthPage = ['/login', '/registro'].some(p => request.nextUrl.pathname.startsWith(p))
  const isBienvenida = request.nextUrl.pathname.startsWith('/bienvenida')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/inicio-carga', request.url))
  }

  if (isBienvenida) {
    return supabaseResponse
  }

  // Verificar acceso admin
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!perfil || perfil.rol !== 'admin') {
      return NextResponse.redirect(new URL('/inicio-carga', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
