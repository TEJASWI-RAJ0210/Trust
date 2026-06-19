import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from '../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set')

export async function GET() {
  try {
    // Bug 1 fix: use Next.js cookies() helper — safe, handles = in JWT correctly
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Bug 2 fix: DB call inside try/catch
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, phone: true, country: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error('[me]', err)
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}