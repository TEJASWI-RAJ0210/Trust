import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function GET(request: Request) {
  const token = request.headers.get('cookie')
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='))
    ?.split('=')[1]

  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}
