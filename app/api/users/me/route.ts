import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  const user = await prisma.user.findFirst({
    include: { disputes: true, proofs: true },
  })
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }
  return NextResponse.json(user)
}
