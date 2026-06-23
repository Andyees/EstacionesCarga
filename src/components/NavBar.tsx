'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, LogOut, LayoutDashboard } from 'lucide-react'

export default function NavBar({ nombre, rol }: { nombre: string; rol: string }) {
  const router = useRouter()

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 rounded-full p-1.5">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Celsia EV Charging</span>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/inicio-carga" className="text-sm text-gray-600 hover:text-green-600 transition">Iniciar Carga</Link>
          <Link href="/fin-carga" className="text-sm text-gray-600 hover:text-green-600 transition">Finalizar Carga</Link>
          {rol === 'admin' && (
            <Link href="/admin" className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium transition">
              <LayoutDashboard className="w-4 h-4" />Admin
            </Link>
          )}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <span className="text-xs text-gray-500">{nombre}</span>
            <button onClick={signOut} title="Cerrar sesión" className="text-gray-400 hover:text-red-500 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
