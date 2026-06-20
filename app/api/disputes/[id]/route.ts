import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getAuthUserId, unauthorized, forbidden, notFound, serverError } from '../../../../lib/api-auth'

type Params = { params: Promise<{ id: string }> }

const VALID_STATUSES = ['open', 'pending', 'in-review', 'resolved'] as const

export async function GET(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        party: true,
      },
    })

    if (!dispute) return notFound('Dispute')
    if (dispute.userId !== userId) return forbidden()

    return NextResponse.json(dispute)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.dispute.findUnique({ where: { id } })
    if (!existing) return notFound('Dispute')
    if (existing.userId !== userId) return forbidden()

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { message: `status must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        )
      }
      data.status = body.status
    }

    const dispute = await prisma.dispute.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
        party: true,
      },
    })

    return NextResponse.json(dispute)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    const existing = await prisma.dispute.findUnique({ where: { id } })
    if (!existing) return notFound('Dispute')
    if (existing.userId !== userId) return forbidden()

    await prisma.dispute.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (err) {
    return serverError(err)
  }
}