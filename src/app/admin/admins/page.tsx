'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, ShieldOff, KeyRound, UserCheck } from 'lucide-react'

interface Perfil {
  id: string
  nombre_completo: string
  correo: string
  rol: string
}

export default function AdminsPage() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ tipo: 'promover' | 'cambiar_password'; perfil: Perfil } | null>(null)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function cargar() {
    const supabase = createClient()
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, correo, rol')
      .order('rol', { ascending: false })
      .order('nombre_completo')
    setPerfiles(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  async function accion(user_id: string, accion: string, pwd?: string) {
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/admin/set-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, accion, password: pwd }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || 'Error')
    } else {
      setMsg('Guardado correctamente')
      setModal(null)
      setPassword('')
      cargar()
    }
    setSaving(false)
  }

  if (loading) return <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">Cargando...</div>

  const admins = perfiles.filter(p => p.rol === 'admin')
  const usuarios = perfiles.filter(p => p.rol !== 'admin')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" /> Gestión de Administradores
      </h1>

      {msg && <p className={`text-sm p-3 rounded-lg ${msg.includes('Error') || msg.includes('error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{msg}</p>}

      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-sm font-semibold text-purple-700 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Administradores actuales ({admins.length})
        </h2>
        <div className="space-y-3">
          {admins.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{p.nombre_completo}</p>
                <p className="text-xs text-gray-500">{p.correo}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setModal({ tipo: 'cambiar_password', perfil: p }); setMsg('') }}
                  className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-50">
                  <KeyRound className="w-3.5 h-3.5" /> Contraseña
                </button>
                <button onClick={() => accion(p.id, 'degradar')}
                  className="flex items-center gap-1 text-xs bg-white border border-red-200 text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50">
                  <ShieldOff className="w-3.5 h-3.5" /> Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4" /> Usuarios ({usuarios.length})
        </h2>
        <div className="space-y-3">
          {usuarios.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{p.nombre_completo}</p>
                <p className="text-xs text-gray-500">{p.correo}</p>
              </div>
              <button onClick={() => { setModal({ tipo: 'promover', perfil: p }); setMsg('') }}
                className="flex items-center gap-1 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700">
                <Shield className="w-3.5 h-3.5" /> Hacer admin
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal contraseña */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-1">
              {modal.tipo === 'promover' ? 'Hacer administrador' : 'Cambiar contraseña'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{modal.perfil.nombre_completo}</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            {msg && <p className="text-red-500 text-sm mb-3">{msg}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setPassword(''); setMsg('') }}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => accion(modal.perfil.id, modal.tipo === 'promover' ? 'promover' : 'cambiar_password', password)}
                disabled={saving}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
