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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-100 px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-orange-500 rounded-full p-3 mb-3 shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Registro de Usuario</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">Estaciones de Carga Eléctrica Celsia</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre completo *">
              <input required value={form.nombre_completo} onChange={e => set('nombre_completo', e.target.value)} className={inputCls} placeholder="Juan Pérez" autoComplete="name" />
            </Field>
            <Field label="Empresa *">
              <input required value={form.empresa} onChange={e => set('empresa', e.target.value)} className={inputCls} placeholder="Mi Empresa S.A." autoComplete="organization" />
            </Field>
            <Field label="Correo electrónico *">
              <input required type="email" value={form.correo} onChange={e => set('correo', e.target.value)} className={inputCls} placeholder="tu@correo.com" inputMode="email" autoComplete="email" />
            </Field>
            <Field label="Número de celular *">
              <input required type="tel" value={form.celular} onChange={e => set('celular', e.target.value)} className={inputCls} placeholder="3001234567" inputMode="tel" autoComplete="tel" />
            </Field>
            <Field label="Placa *">
              <input required value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} className={inputCls} placeholder="ABC123" />
            </Field>
            <Field label="Marca del vehículo *">
              <input required value={form.marca_vehiculo} onChange={e => set('marca_vehiculo', e.target.value)} className={inputCls} placeholder="Tesla, BYD, Renault..." />
            </Field>

            <Field label="Tipo de conector *">
              <div className="grid grid-cols-3 gap-2 mt-1">
                {TIPOS_CONECTOR.map(tipo => (
                  <label key={tipo} className={`flex items-center justify-center gap-1.5 cursor-pointer border-2 rounded-xl py-3 text-sm font-medium transition-colors ${
                    form.tipo_conector === tipo
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-600'
                  }`}>
                    <input type="radio" name="tipo_conector" value={tipo}
                      checked={form.tipo_conector === tipo} onChange={e => set('tipo_conector', e.target.value)}
                      className="sr-only" />
                    {tipo}
                  </label>
                ))}
              </div>
            </Field>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs text-gray-600 mb-3">
                Al registrarte aceptas las{' '}
                <a href="/reglamento" target="_blank" className="text-orange-500 font-semibold underline">
                  normas de uso
                </a>
                {' '}de las estaciones de carga eléctrica de Celsia.
              </p>
              <label className="flex items-center gap-3 cursor-pointer" onClick={() => set('acepto_reglamento', !form.acepto_reglamento)}>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  form.acepto_reglamento ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                }`}>
                  {form.acepto_reglamento && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-gray-700 font-medium">Acepto el Reglamento de Uso</span>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-800 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60 text-base">
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya estás registrado?{' '}
            <Link href="/login" className="text-orange-500 font-medium hover:underline">Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
