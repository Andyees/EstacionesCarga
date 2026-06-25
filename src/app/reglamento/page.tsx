import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock, Zap, Users, Shield, Bell, BarChart3, Car } from 'lucide-react'

export default function ReglamentoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-gray-900 text-base">Reglamento de Uso</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-5">

        {/* Hero */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-5 py-6 flex items-center gap-4">
            <Image src="/Logo2.png" alt="Celsia" width={52} height={52} className="object-contain" />
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Celsia</p>
              <h2 className="text-white font-bold text-xl leading-tight">Reglamento de Uso</h2>
              <p className="text-white font-bold text-xl leading-tight">Estaciones de Carga</p>
            </div>
          </div>
          <div className="bg-green-600 px-5 py-2.5">
            <p className="text-white text-xs text-center font-medium">Conectamos la mejor energía para impulsar una movilidad más sostenible.</p>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4 text-center">¿CÓMO FUNCIONA NUESTRO APLICATIVO?</h3>
          <div className="space-y-3">
            {[
              { n: '1', title: 'Regístrate', desc: 'Crea tu cuenta en el aplicativo.', color: 'bg-green-500' },
              { n: '2', title: 'Consulta', desc: 'Visualiza en tiempo real la disponibilidad de las estaciones.', color: 'bg-green-500' },
              { n: '3', title: 'Inicia tu carga', desc: 'Conecta tu vehículo y registra el inicio de la carga en el aplicativo.', color: 'bg-green-500' },
              { n: '4', title: 'Finaliza tu carga', desc: 'Al terminar, finaliza la sesión en la app, desconecta y retira tu vehículo.', color: 'bg-green-500' },
              { n: '5', title: 'Libera el espacio', desc: 'Permite que otros usuarios puedan usar la estación.', color: 'bg-green-500' },
            ].map((paso) => (
              <div key={paso.n} className="flex items-start gap-3">
                <div className={`${paso.color} text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {paso.n}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{paso.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disponibilidad y alertas */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Visualiza la disponibilidad</p>
                <p className="text-gray-500 text-xs mt-1">Consulta en el aplicativo qué estaciones están disponibles en tiempo real.</p>
              </div>
            </div>
            <div className="space-y-2 pl-1">
              {[
                { color: 'bg-green-500', label: 'Disponible' },
                { color: 'bg-orange-500', label: 'En uso' },
                { color: 'bg-gray-400', label: 'Fuera de servicio' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                <Bell className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Alertas en tiempo real</p>
                <p className="text-gray-500 text-xs mt-1">El aplicativo te enviará notificaciones y alertas sobre el estado de tu carga y recomendaciones de uso.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Normas de uso */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4 text-center border-b border-gray-100 pb-3">NORMAS DE USO</h3>
          <div className="space-y-4">

            <NormaCard
              icon={<Clock className="w-5 h-5 text-green-600" />}
              title="Tiempo máximo de permanencia"
              desc="Tiempo máximo recomendado de 4 horas por vehículo, salvo condiciones especiales definidas por CELSIA."
              highlight="4 horas"
            />

            <NormaCard
              icon={<Car className="w-5 h-5 text-green-600" />}
              title="Uso exclusivo"
              desc="Los espacios de carga son de uso exclusivo para vehículos que se encuentren cargando activamente."
            />

            <NormaCard
              icon={<Users className="w-5 h-5 text-green-600" />}
              title="Uso compartido"
              desc="En momentos de alta demanda, realiza cargas parciales para promover la rotación y el acceso equitativo."
            />

            <NormaCard
              icon={<Shield className="w-5 h-5 text-green-600" />}
              title="Seguridad y cuidado"
              bullets={[
                'Manipula conectores y cables con cuidado.',
                'Verifica que el cable quede organizado y libre.',
                'No golpees, tires ni modifiques los equipos.',
                'Reporta inmediatamente cualquier falla o daño.',
              ]}
            />

            <NormaCard
              icon={<AlertTriangle className="w-5 h-5 text-green-600" />}
              title="Reporte de novedades"
              desc="Reporta cualquier anomalía o condición insegura en los canales definidos."
            />

            <NormaCard
              icon={<BarChart3 className="w-5 h-5 text-green-600" />}
              title="Monitoreo y control"
              desc="CELSIA realiza seguimiento a:"
              bullets={[
                'Frecuencia de uso',
                'Tiempo de permanencia',
                'Disponibilidad de estaciones',
                'Cumplimiento de tiempos',
                'Incidentes reportados',
              ]}
              footer="Tu uso responsable mejora el servicio para todos."
            />

          </div>
        </div>

        {/* Estaciona correctamente */}
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800 text-sm">Estaciona correctamente</p>
              <p className="text-gray-500 text-xs mt-1">Estaciona correctamente dentro de la celda para permitir que otros usuarios tengan espacio de parqueo.</p>
            </div>
          </div>
        </div>

        {/* No está permitido */}
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-red-600">NO ESTÁ PERMITIDO</h3>
          </div>
          <div className="space-y-3">
            {[
              'Usar la estación sin registrarse en el aplicativo.',
              'Dejar el vehículo conectado una vez finalizada la carga.',
              'Reservar espacios de carga sin hacer uso del servicio.',
              'Bloquear el acceso a otras estaciones.',
              'Manipular equipos sin autorización.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                </span>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nuestro compromiso */}
        <div className="bg-green-700 rounded-2xl shadow p-5">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">NUESTRO COMPROMISO</p>
              <p className="text-green-100 text-xs mt-1">El uso responsable de las estaciones de carga contribuye al fortalecimiento de la movilidad sostenible, la optimización de los recursos energéticos y el bienestar de toda la comunidad.</p>
            </div>
          </div>
          <div className="border-t border-green-600 pt-4">
            <p className="text-white font-bold text-sm text-center mb-3">¡BUEN USO, MEJOR ENERGÍA!</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Verifica la disponibilidad antes de ir.',
                'Inicia y finaliza tu carga en el aplicativo.',
                'Usa solo el tiempo necesario.',
                'Tu compromiso permite que más personas accedan al servicio.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                  <p className="text-green-100 text-xs">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">¿Necesitas ayuda o tienes novedades?</p>
          <a
            href="https://wa.me/573234535424"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-green-600 transition"
          >
            WhatsApp 323 453 5424
          </a>
        </div>

      </div>
    </div>
  )
}

function NormaCard({ icon, title, desc, bullets, highlight, footer }: {
  icon: React.ReactNode
  title: string
  desc?: string
  bullets?: string[]
  highlight?: string
  footer?: string
}) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
      <div className="bg-green-50 rounded-full p-2 flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        {desc && (
          <p className="text-gray-500 text-xs mt-1">
            {highlight ? desc.replace(highlight, '') : desc}
            {highlight && <strong className="text-orange-600"> {highlight}</strong>}
            {highlight && desc.split(highlight)[1]}
          </p>
        )}
        {bullets && (
          <ul className="mt-1.5 space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">•</span>{b}
              </li>
            ))}
          </ul>
        )}
        {footer && <p className="text-xs text-orange-600 font-semibold mt-2">{footer}</p>}
      </div>
    </div>
  )
}
