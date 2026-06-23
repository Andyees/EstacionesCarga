export interface SessionUser {
  id: string
  correo: string
  nombre_completo: string
  rol: string
}

const COOKIE_NAME = 'celsia_session'

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64')
}

export function decodeSession(value: string): SessionUser | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

export { COOKIE_NAME }
