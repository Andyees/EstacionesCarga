'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Zap, LogOut, LayoutDashboard, BatteryCharging, BatteryFull, Shield } from 'lucide-react'

export default function NavBar({ nombre, rol }: { nombre: string; rol: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  function isActive(path: string) {
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Top bar — solo logo y usuario */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 rounded-full p-1.5">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Celsia EV Charging</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 max-w-[120px] truncate">{nombre}</span>
            <button onClick={signOut} title="Cerrar sesión" className="text-gray-400 hover:text-red-500 transition p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom nav — navegación principal en mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto flex">
          <NavItem href="/inicio-carga" label="Iniciar" active={isActive('/inicio-carga')}>
            <BatteryCharging className="w-5 h-5" />
          </NavItem>
          <NavItem href="/fin-carga" label="Finalizar" active={isActive('/fin-carga')}>
            <BatteryFull className="w-5 h-5" />
          </NavItem>
          {rol === 'admin' && (
            <NavItem href="/admin" label="Dashboard" active={pathname === '/admin'}>
              <LayoutDashboard className="w-5 h-5" />
            </NavItem>
          )}
          {rol === 'admin' && (
            <NavItem href="/admin/admins" label="Admins" active={isActive('/admin/admins')}>
              <Shield className="w-5 h-5" />
            </NavItem>
          )}
        </div>
      </nav>

      {/* Spacer para que el contenido no quede detrás del bottom nav */}
      <div className="h-16" />
    </>
  )
}

function NavItem({ href, label, active, children }: {
  href: string; label: string; active: boolean; children: React.ReactNode
}) {
  return (
    <Link href={href} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
      active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
    }`}>
      {children}
      {label}
    </Link>
  )
}
