import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  const response = NextResponse.json({ id: user.id, email: user.email, name: user.name })
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  return response
}
