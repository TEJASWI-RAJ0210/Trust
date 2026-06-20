import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getAuthUserId, unauthorized, serverError } from '../../../lib/api-auth'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    // Bug fix: only return THIS user's proofs, not everyone's
    const proofs = await prisma.proof.findMany({
      where: { userId },
      // Bug fix: never expose passwordHash — select only safe fields
      select: {
        id: true,
        title: true,
        description: true,
        data: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(proofs)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const body = await request.json()

    // Bug fix: userId always comes from the cookie, never from the body
    if (!body.title) {
      return NextResponse.json({ message: 'title is required' }, { status: 400 })
    }

    const proof = await prisma.proof.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        data: body.data ?? null,
        status: 'active', // always start active, never trust status from client
        user: { connect: { id: userId } },
      },
    })

    return NextResponse.json(proof, { status: 201 })
  } catch (err) {
    return serverError(err)
  }
}