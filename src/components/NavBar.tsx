'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Zap, LogOut, LayoutDashboard, BatteryCharging, BatteryFull, Shield, ClipboardList, Users } from 'lucide-react'

export default function NavBar({ nombre, rol }: { nombre: string; rol: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(rol === 'admin' ? '/admin/login' : '/login')
    router.refresh()
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${rol === 'admin' ? 'bg-purple-600' : 'bg-green-600'} rounded-full p-1.5`}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Celsia EV Charging</span>
              {rol === 'admin' && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">Admin</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 max-w-[120px] truncate">{nombre}</span>
            <button onClick={signOut} title="Cerrar sesión" className="text-gray-400 hover:text-red-500 transition p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto flex">
          {rol === 'admin' ? (
            <>
              <NavItem href="/admin" label="Estaciones" active={pathname === '/admin'} color="purple">
                <LayoutDashboard className="w-5 h-5" />
              </NavItem>
              <NavItem href="/admin/sesiones" label="Sesiones" active={pathname.startsWith('/admin/sesiones')} color="purple">
                <ClipboardList className="w-5 h-5" />
              </NavItem>
              <NavItem href="/admin/usuarios" label="Usuarios" active={pathname.startsWith('/admin/usuarios')} color="purple">
                <Users className="w-5 h-5" />
              </NavItem>
              <NavItem href="/admin/admins" label="Admins" active={pathname.startsWith('/admin/admins')} color="purple">
                <Shield className="w-5 h-5" />
              </NavItem>
            </>
          ) : (
            <>
              <NavItem href="/inicio-carga" label="Iniciar" active={pathname.startsWith('/inicio-carga')} color="green">
                <BatteryCharging className="w-5 h-5" />
              </NavItem>
              <NavItem href="/fin-carga" label="Finalizar" active={pathname.startsWith('/fin-carga')} color="green">
                <BatteryFull className="w-5 h-5" />
              </NavItem>
            </>
          )}
        </div>
      </nav>

      <div className="h-16" />
    </>
  )
}

function NavItem({ href, label, active, color, children }: {
  href: string; label: string; active: boolean; color: 'green' | 'purple'; children: React.ReactNode
}) {
  const activeColor = color === 'purple' ? 'text-purple-600' : 'text-green-600'
  return (
    <Link href={href} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
      active ? activeColor : 'text-gray-400 hover:text-gray-600'
    }`}>
      {children}
      {label}
    </Link>
  )
}
