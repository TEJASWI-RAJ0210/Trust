import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Bug 5 fix: normalize email
    const email = body.email?.toLowerCase().trim()
    const name = body.name?.trim() || null
    const { password, phone, country, role } = body

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Bug 2 fix: wrapped in try/catch
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 })
    }

    const passwordHash = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,           // Bug 3 fix: null instead of ''
        passwordHash,
        phone:          phone?.trim() || null,
        country:        country?.trim() || null,
        role:           role || 'freelancer',
        emailVerified:  false,
      },
    })

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 }
    )
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}