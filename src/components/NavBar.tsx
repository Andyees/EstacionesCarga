'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, BatteryCharging, BatteryFull, Shield, ClipboardList, Users } from 'lucide-react'

export default function NavBar({ nombre, rol }: { nombre: string; rol: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/Logo2.png" alt="Celsia" width={32} height={32} className="object-contain" />
            <div>
              <span className="font-bold text-gray-900 text-sm">Celsia EV Charging</span>
              {rol === 'admin' && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">Admin</span>}
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
              <NavItem href="/admin" label="Estaciones" active={pathname === '/admin'}>
                <LayoutDashboard className="w-5 h-5" />
              </NavItem>
              <NavItem href="/admin/sesiones" label="Sesiones" active={pathname.startsWith('/admin/sesiones')}>
                <ClipboardList className="w-5 h-5" />
              </NavItem>
              <NavItem href="/admin/usuarios" label="Usuarios" active={pathname.startsWith('/admin/usuarios')}>
                <Users className="w-5 h-5" />
              </NavItem>
              <NavItem href="/admin/admins" label="Admins" active={pathname.startsWith('/admin/admins')}>
                <Shield className="w-5 h-5" />
              </NavItem>
            </>
          ) : (
            <>
              <NavItem href="/inicio-carga" label="Mi carga" active={pathname.startsWith('/inicio-carga') || pathname.startsWith('/fin-carga')}>
                <BatteryCharging className="w-5 h-5" />
              </NavItem>
            </>
          )}
        </div>
      </nav>

      <div className="h-16" />
    </>
  )
}

function NavItem({ href, label, active, children }: {
  href: string; label: string; active: boolean; children: React.ReactNode
}) {
  return (
    <Link href={href} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
      active ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
    }`}>
      {children}
      {label}
    </Link>
  )
}
