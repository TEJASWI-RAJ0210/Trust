import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({
    include: { disputes: true, proofs: true },
  })

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.email) {
    return NextResponse.json({ message: 'email is required' }, { status: 400 })
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: body.name ?? null,
        email: body.email,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown'
    return NextResponse.json({ message }, { status: 500 })
  }
}
