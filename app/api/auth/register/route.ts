import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const { email, name, password } = body

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ message: 'User already exists' }, { status: 409 })
  }

  const passwordHash = await hash(password, 10)
  const user = await prisma.user.create({ data: { email, name: name ?? '', passwordHash } })

  return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
}
