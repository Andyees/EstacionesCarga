'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BatteryCharging, CheckCircle } from 'lucide-react'
import type { Estacion, Perfil } from '@/lib/supabase/types'

const TIPOS_CONECTOR = ['TIPO 1', 'TIPO 2', 'GBT'] as const

export default function InicioCargaPage() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([])
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    placa: '',
    estacion_id: '',
    tipo_conector: '' as typeof TIPOS_CONECTOR[number] | '',
    hora_inicio: '',
    confirmacion: false,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const cookieVal = document.cookie.split('; ').find(r => r.startsWith('celsia_session='))?.split('=')[1]
      if (!cookieVal) return
      const user = JSON.parse(atob(cookieVal))

      const [{ data: p }, { data: e }] = await Promise.all([
        supabase.from('perfiles').select('*').eq('id', user.id).single(),
        supabase.from('estaciones').select('*').eq('activa', true).order('nombre'),
      ])

      if (p) {
        setPerfil(p)
        setForm(prev => ({ ...prev, placa: p.placa, tipo_conector: p.tipo_conector }))
      }
      if (e) setEstaciones(e)
    }
    load()
  }, [])

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.confirmacion) { setError('Debes confirmar que has conectado correctamente el vehículo.'); return }
    if (!form.estacion_id) { setError('Selecciona una estación.'); return }
    if (!form.tipo_conector) { setError('Selecciona el tipo de conector.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const cookieVal = document.cookie.split('; ').find(r => r.startsWith('celsia_session='))?.split('=')[1]
    if (!cookieVal) { setError('Sesión expirada.'); setLoading(false); return }
    const user = JSON.parse(atob(cookieVal))

    const { data: activa } = await supabase
      .from('sesiones_carga')
      .select('id')
      .eq('user_id', user.id)
      .eq('estado', 'activa')
      .single()

    if (activa) {
      setError('Ya tienes una sesión de carga activa. Finalízala antes de iniciar otra.')
      setLoading(false)
      return
    }

    const inicioDia = new Date()
    inicioDia.setHours(0, 0, 0, 0)
    const { data: yaUsoHoy } = await supabase
      .from('sesiones_carga')
      .select('id')
      .eq('user_id', user.id)
      .eq('estacion_id', form.estacion_id)
      .gte('hora_inicio', inicioDia.toISOString())
      .limit(1)

    if (yaUsoHoy && yaUsoHoy.length > 0) {
      setError('Ya usaste esta estación hoy. Por favor elige otra estación disponible.')
      setLoading(false)
      return
    }

    const hace4horas = new Date(Date.now() - 4 * 60 * 60 * 1000)
    const { data: sesionVencida } = await supabase
      .from('sesiones_carga')
      .select('id, hora_inicio, estaciones(nombre)')
      .eq('user_id', user.id)
      .eq('estado', 'activa')
      .lte('hora_inicio', hace4horas.toISOString())
      .single()

    if (sesionVencida) {
      setError('Tienes una sesión de carga vencida (más de 4 horas). Finalízala primero.')
      setLoading(false)
      return
    }

    const horaInicio = form.hora_inicio
      ? (() => {
          const [h, m] = form.hora_inicio.split(':')
          const d = new Date()
          d.setHours(+h, +m, 0, 0)
          return d.toISOString()
        })()
      : new Date().toISOString()

    const { error: insertError } = await supabase.from('sesiones_carga').insert({
      user_id: user.id,
      placa: form.placa.toUpperCase(),
      estacion_id: form.estacion_id,
      tipo_conector: form.tipo_conector,
      hora_inicio: horaInicio,
      confirmacion_inicio: true,
      estado: 'activa',
    })

    if (insertError) {
      setError('Error al registrar el inicio de carga: ' + insertError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Carga iniciada!</h2>
        <p className="text-gray-500 mb-6">Tu sesión de carga ha sido registrada correctamente.</p>
        <button onClick={() => { setSuccess(false); setForm(f => ({ ...f, estacion_id: '', hora_inicio: '', confirmacion: false })) }}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition w-full">
          Nueva sesión
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-green-100 rounded-full p-2">
          <BatteryCharging className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Inicio de Carga</h1>
          <p className="text-xs text-gray-500">Registra el inicio de tu sesión</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Correo electrónico">
          <input value={perfil?.correo || ''} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
        </Field>

        <Field label="Placa *">
          <input required value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} className={inputCls} placeholder="ABC123" />
        </Field>

        <Field label="Estación *">
          <select required value={form.estacion_id} onChange={e => set('estacion_id', e.target.value)} className={inputCls}>
            <option value="">Selecciona una estación</option>
            {estaciones.map(est => (
              <option key={est.id} value={est.id}>{est.nombre} — {est.ubicacion}</option>
            ))}
          </select>
        </Field>

        <Field label="Tipo de conector *">
          <div className="grid grid-cols-3 gap-2 mt-1">
            {TIPOS_CONECTOR.map(tipo => (
              <label key={tipo} className={`flex items-center justify-center gap-1.5 cursor-pointer border-2 rounded-xl py-3 text-sm font-medium transition-colors ${
                form.tipo_conector === tipo
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600'
              }`}>
                <input type="radio" name="tipo_conector" value={tipo} checked={form.tipo_conector === tipo}
                  onChange={e => set('tipo_conector', e.target.value)} className="sr-only" />
                {tipo}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Hora de inicio (opcional)">
          <input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className={inputCls} />
          <p className="text-xs text-gray-400 mt-1">Si no indicas hora, se registra la hora actual.</p>
        </Field>

        <div className="border border-green-200 bg-green-50 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer" onClick={() => set('confirmacion', !form.confirmacion)}>
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
              form.confirmacion ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'
            }`}>
              {form.confirmacion && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input type="checkbox" checked={form.confirmacion} onChange={e => set('confirmacion', e.target.checked)} className="sr-only" />
            <span className="text-sm text-gray-700">
              Confirmo que he conectado correctamente el vehículo a la estación seleccionada
            </span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 rounded-xl transition disabled:opacity-60 text-base">
          {loading ? 'Registrando...' : 'Registrar inicio de carga'}
        </button>
      </form>
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
