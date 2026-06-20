import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set')

export async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    return payload.userId ?? null
  } catch {
    return null
  }
}

export function unauthorized() {
  return Response.json({ message: 'Unauthenticated' }, { status: 401 })
}

export function forbidden() {
  return Response.json({ message: 'Forbidden' }, { status: 403 })
}

export function notFound(resource = 'Resource') {
  return Response.json({ message: `${resource} not found` }, { status: 404 })
}

export function serverError(err: unknown) {
  console.error(err)
  return Response.json({ message: 'Internal server error' }, { status: 500 })
}