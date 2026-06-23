import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/session'
import Link from 'next/link'
import { LayoutDashboard, Users, Activity } from 'lucide-react'
import NavBar from '@/components/NavBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const user = sessionCookie ? decodeSession(sessionCookie.value) : null

  if (!user) redirect('/login')
  if (user.rol !== 'admin') redirect('/inicio-carga')

  const perfil = user

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nombre={perfil.nombre_completo} rol="admin" />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <aside className="w-52 shrink-0">
          <nav className="bg-white rounded-xl shadow p-3 space-y-1">
            <SideLink href="/admin" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
            <SideLink href="/admin/sesiones" icon={<Activity className="w-4 h-4" />} label="Sesiones" />
            <SideLink href="/admin/usuarios" icon={<Users className="w-4 h-4" />} label="Usuarios" />
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

function SideLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition">
      {icon}{label}
    </Link>
  )
}
