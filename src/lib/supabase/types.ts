export type TipoConector = 'TIPO 1' | 'TIPO 2' | 'GBT'
export type EstadoSesion = 'activa' | 'finalizada'
export type RolUsuario = 'user' | 'admin'

export interface Perfil {
  id: string
  nombre_completo: string
  empresa: string
  correo: string
  celular: string
  placa: string
  tipo_conector: TipoConector
  marca_vehiculo: string
  acepto_reglamento: boolean
  rol: RolUsuario
  created_at: string
}

export interface Estacion {
  id: string
  nombre: string
  tipo_conector: TipoConector
  ubicacion: string
  activa: boolean
}

export interface SesionCarga {
  id: string
  user_id: string
  placa: string
  estacion_id: string
  tipo_conector: TipoConector
  hora_inicio: string
  hora_fin: string | null
  confirmacion_inicio: boolean
  confirmacion_fin: boolean
  estado: EstadoSesion
  created_at: string
  estaciones?: Estacion
  perfiles?: Perfil
}
