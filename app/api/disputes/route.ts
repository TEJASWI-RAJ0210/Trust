import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getAuthUserId, unauthorized, serverError } from '../../../lib/api-auth'

const VALID_STATUSES = ['open', 'pending', 'in-review', 'resolved'] as const

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    // Bug fix: only return THIS user's disputes
    const disputes = await prisma.dispute.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        party: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(disputes)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const body = await request.json()

    if (!body.title || !body.partyId) {
      return NextResponse.json(
        { message: 'title and partyId are required' },
        { status: 400 }
      )
    }

    // Bug fix: validate status if provided
    const status = body.status ?? 'open'
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { message: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // Bug fix: userId from cookie, not body
    const dispute = await prisma.dispute.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        status,
        user: { connect: { id: userId } },
        party: { connect: { id: body.partyId } },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        party: true,
      },
    })

    return NextResponse.json(dispute, { status: 201 })
  } catch (err) {
    return serverError(err)
  }
}