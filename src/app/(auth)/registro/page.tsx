'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap } from 'lucide-react'

const TIPOS_CONECTOR = ['TIPO 1', 'TIPO 2', 'GBT'] as const

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_completo: '',
    empresa: '',
    correo: '',
    celular: '',
    placa: '',
    tipo_conector: '' as typeof TIPOS_CONECTOR[number] | '',
    marca_vehiculo: '',
    acepto_reglamento: false,
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.acepto_reglamento) { setError('Debes aceptar el Reglamento de Uso.'); return }
    if (!form.tipo_conector) { setError('Selecciona el tipo de conector.'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al registrar.')
      setLoading(false)
      return
    }

    router.push('/inicio-carga')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-green-600 rounded-full p-3 mb-3">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Registro de Usuario</h1>
            <p className="text-gray-500 text-sm mt-1">Estaciones de Carga Eléctrica Celsia</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre completo *">
              <input required value={form.nombre_completo} onChange={e => set('nombre_completo', e.target.value)} className={inputCls} placeholder="Juan Pérez" />
            </Field>
            <Field label="Empresa *">
              <input required value={form.empresa} onChange={e => set('empresa', e.target.value)} className={inputCls} placeholder="Mi Empresa S.A." />
            </Field>
            <Field label="Correo electrónico *">
              <input required type="email" value={form.correo} onChange={e => set('correo', e.target.value)} className={inputCls} placeholder="tu@correo.com" />
            </Field>
            <Field label="Número de celular *">
              <input required type="tel" value={form.celular} onChange={e => set('celular', e.target.value)} className={inputCls} placeholder="3001234567" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Placa *">
                <input required value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} className={inputCls} placeholder="ABC123" />
              </Field>
              <Field label="Marca del vehículo *">
                <input required value={form.marca_vehiculo} onChange={e => set('marca_vehiculo', e.target.value)} className={inputCls} placeholder="Tesla, BYD..." />
              </Field>
            </div>

            <Field label="Tipo de conector *">
              <div className="flex gap-4 mt-1">
                {TIPOS_CONECTOR.map(tipo => (
                  <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo_conector" value={tipo}
                      checked={form.tipo_conector === tipo} onChange={e => set('tipo_conector', e.target.value)}
                      className="accent-green-600" />
                    <span className="text-sm text-gray-700">{tipo}</span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-700 mb-2 font-medium">Reglamento de Uso de la Estación de Carga Vehículos Eléctricos Celsia</p>
              <p className="text-xs text-gray-500 mb-3">
                Al aceptar, confirma que ha leído y acepta las normas de uso de las estaciones de carga eléctrica de Celsia.
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.acepto_reglamento} onChange={e => set('acepto_reglamento', e.target.checked)}
                  className="accent-green-600 w-4 h-4" />
                <span className="text-sm text-gray-700 font-medium">Acepto el Reglamento de Uso — SI</span>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya estás registrado?{' '}
            <Link href="/login" className="text-green-600 font-medium hover:underline">Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
