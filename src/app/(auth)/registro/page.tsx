'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, X, CheckCircle, Clock, Shield, Users, AlertTriangle, XCircle, BarChart3, Car, Bell } from 'lucide-react'

const TIPOS_CONECTOR = ['TIPO 1', 'TIPO 2', 'GBT'] as const

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
    if (atBottom) setScrolledToBottom(true)
  }

  function abrirReglamento() {
    setModalOpen(true)
    setScrolledToBottom(false)
    setTimeout(() => scrollRef.current?.scrollTo(0, 0), 50)
  }

  function aceptarReglamento() {
    set('acepto_reglamento', true)
    setModalOpen(false)
  }
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

            {/* Reglamento */}
            {!form.acepto_reglamento ? (
              <button
                type="button"
                onClick={abrirReglamento}
                className="w-full border-2 border-orange-300 bg-orange-50 rounded-xl p-4 text-left hover:border-orange-400 transition"
              >
                <p className="text-sm font-semibold text-orange-700 mb-0.5">Leer y aceptar el Reglamento de Uso</p>
                <p className="text-xs text-orange-500">Debes leer el reglamento antes de registrarte. Toca aquí para abrirlo.</p>
              </button>
            ) : (
              <div className="border-2 border-green-400 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700">Reglamento aceptado</p>
                  <button type="button" onClick={abrirReglamento} className="text-xs text-green-600 underline mt-0.5">Ver de nuevo</button>
                </div>
              </div>
            )}

            {/* Modal reglamento */}
            {modalOpen && (
              <div className="fixed inset-0 z-50 flex items-end justify-center">
                <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
                <div className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
                  <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
                    <h2 className="font-bold text-gray-900 text-base">Reglamento de Uso</h2>
                    <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
                    {/* Pasos */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">¿Cómo funciona?</p>
                      <div className="space-y-2.5">
                        {[
                          { n: '1', t: 'Regístrate', d: 'Crea tu cuenta en el aplicativo.' },
                          { n: '2', t: 'Consulta', d: 'Visualiza en tiempo real la disponibilidad de las estaciones.' },
                          { n: '3', t: 'Inicia tu carga', d: 'Conecta tu vehículo y registra el inicio en la app.' },
                          { n: '4', t: 'Finaliza tu carga', d: 'Al terminar, finaliza la sesión, desconecta y retira tu vehículo.' },
                          { n: '5', t: 'Libera el espacio', d: 'Permite que otros puedan usar la estación.' },
                        ].map(p => (
                          <div key={p.n} className="flex items-start gap-2.5">
                            <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{p.n}</span>
                            <div><p className="text-sm font-semibold text-gray-800">{p.t}</p><p className="text-xs text-gray-500">{p.d}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Normas */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Normas de Uso</p>
                      <div className="space-y-3">
                        {[
                          { icon: <Clock className="w-4 h-4 text-green-600" />, t: 'Tiempo máximo: 4 horas por vehículo.', d: 'Salvo condiciones especiales definidas por CELSIA.' },
                          { icon: <Car className="w-4 h-4 text-green-600" />, t: 'Uso exclusivo para vehículos cargando.', d: 'Los espacios son solo para vehículos activamente cargando.' },
                          { icon: <Users className="w-4 h-4 text-green-600" />, t: 'Uso compartido en alta demanda.', d: 'Realiza cargas parciales para promover la rotación.' },
                          { icon: <Shield className="w-4 h-4 text-green-600" />, t: 'Manipula cables con cuidado.', d: 'Reporta inmediatamente cualquier falla o daño.' },
                          { icon: <AlertTriangle className="w-4 h-4 text-green-600" />, t: 'Reporta novedades.', d: 'Informa anomalías o condiciones inseguras.' },
                          { icon: <Bell className="w-4 h-4 text-green-600" />, t: 'Estaciona correctamente.', d: 'Dentro de la celda para que otros tengan espacio.' },
                        ].map((n, i) => (
                          <div key={i} className="flex items-start gap-2.5 pb-3 border-b border-gray-50 last:border-0">
                            <div className="bg-green-50 rounded-full p-1.5 flex-shrink-0">{n.icon}</div>
                            <div><p className="text-sm font-semibold text-gray-800">{n.t}</p><p className="text-xs text-gray-500">{n.d}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prohibido */}
                    <div>
                      <p className="text-xs font-bold text-red-500 uppercase mb-3">No está permitido</p>
                      <div className="space-y-2">
                        {[
                          'Usar la estación sin registrarse en el aplicativo.',
                          'Dejar el vehículo conectado una vez finalizada la carga.',
                          'Reservar espacios sin hacer uso del servicio.',
                          'Bloquear el acceso a otras estaciones.',
                          'Manipular equipos sin autorización.',
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-700 rounded-xl p-4 text-center">
                      <p className="text-white font-bold text-sm">¡Buen uso, mejor energía!</p>
                      <p className="text-green-100 text-xs mt-1">Tu uso responsable mejora el servicio para todos.</p>
                    </div>

                    <div className="h-2" />
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
                    {!scrolledToBottom && (
                      <p className="text-xs text-gray-400 text-center mb-3">↓ Desplázate hacia abajo para leer todo el reglamento</p>
                    )}
                    <button
                      type="button"
                      onClick={aceptarReglamento}
                      disabled={!scrolledToBottom}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed text-base"
                    >
                      He leído y acepto el Reglamento
                    </button>
                  </div>
                </div>
              </div>
            )}

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
