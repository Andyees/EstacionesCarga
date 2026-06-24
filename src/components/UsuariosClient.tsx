'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, Car, Zap, Building2, Calendar, Activity } from 'lucide-react'

interface Usuario {
  id: string
  nombre_completo: string
  empresa: string
  correo: string
  celular: string
  placa: string
  tipo_conector: string
  marca_vehiculo: string
  created_at: string
  sesiones_carga: { count: number }[]
}

function iniciales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function colorAvatar(nombre: string) {
  const colores = [
    'bg-orange-100 text-orange-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
  ]
  const idx = nombre.charCodeAt(0) % colores.length
  return colores[idx]
}

function Modal({ u, onClose }: { u: Usuario; onClose: () => void }) {
  const sesiones = u.sesiones_carga?.[0]?.count ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                {iniciales(u.nombre_completo)}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">{u.nombre_completo}</h2>
                <p className="text-white/70 text-sm">{u.empresa}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 -mt-1 -mr-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Stat sesiones */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{sesiones}</p>
              <p className="text-xs text-orange-500 mt-0.5">Sesiones totales</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-gray-700">{new Date(u.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-xs text-gray-400 mt-0.5">Fecha registro</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <InfoRow icon={<Mail className="w-4 h-4 text-orange-400" />} label="Correo" value={u.correo} />
            <InfoRow icon={<Phone className="w-4 h-4 text-orange-400" />} label="Celular" value={u.celular} />
            <InfoRow icon={<Building2 className="w-4 h-4 text-orange-400" />} label="Empresa" value={u.empresa} />
            <InfoRow icon={<Car className="w-4 h-4 text-orange-400" />} label="Vehículo" value={`${u.marca_vehiculo} · ${u.placa}`} mono />
            <InfoRow icon={<Zap className="w-4 h-4 text-orange-400" />} label="Conector" value={u.tipo_conector} />
          </div>
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-xs text-gray-400 w-16 flex-shrink-0">{label}</span>
      <span className={`text-sm text-gray-800 font-medium truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

export default function UsuariosClient({ usuarios }: { usuarios: Usuario[] }) {
  const [seleccionado, setSeleccionado] = useState<Usuario | null>(null)

  if (usuarios.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
        <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Sin usuarios registrados</p>
      </div>
    )
  }

  return (
    <>
      {seleccionado && <Modal u={seleccionado} onClose={() => setSeleccionado(null)} />}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100">
          <p className="text-xs text-gray-400">Toca un usuario para ver su detalle</p>
        </div>
        <div className="divide-y divide-gray-50">
          {usuarios.map(u => {
            const sesiones = u.sesiones_carga?.[0]?.count ?? 0
            return (
              <button
                key={u.id}
                onClick={() => setSeleccionado(u)}
                className="w-full text-left px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorAvatar(u.nombre_completo)}`}>
                  {iniciales(u.nombre_completo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{u.nombre_completo}</p>
                    <span className="text-xs bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      {sesiones} sesiones
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <span className="truncate">{u.correo}</span>
                    <span>·</span>
                    <span className="font-mono flex-shrink-0">{u.placa}</span>
                  </div>
                </div>
                <span className="text-gray-300 text-lg flex-shrink-0">›</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
