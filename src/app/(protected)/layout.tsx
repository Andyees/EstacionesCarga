import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import NavBar from '@/components/NavBar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nombre={user.nombre_completo} rol={user.rol} />
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
