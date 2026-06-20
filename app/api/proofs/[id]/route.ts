import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getAuthUserId, unauthorized, forbidden, notFound, serverError } from '../../../../lib/api-auth'

// Bug fix: params must be awaited in Next.js 15 App Router
type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    const proof = await prisma.proof.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        data: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, email: true, name: true } },
      },
    })

    if (!proof) return notFound('Proof')

    // Bug fix: only the owner can view their proof
    if (proof.user.id !== userId) return forbidden()

    return NextResponse.json(proof)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params
    const body = await _request.json()

    const existing = await prisma.proof.findUnique({ where: { id } })
    if (!existing) return notFound('Proof')
    if (existing.userId !== userId) return forbidden()

    // Only allow updating title, description, and status
    const allowedStatuses = ['active', 'delivered', 'disputed']
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { message: `status must be one of: ${allowedStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      data.status = body.status
    }

    const proof = await prisma.proof.update({ where: { id }, data })
    return NextResponse.json(proof)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    const existing = await prisma.proof.findUnique({ where: { id } })
    if (!existing) return notFound('Proof')

    // Bug fix: ownership check before delete
    if (existing.userId !== userId) return forbidden()

    await prisma.proof.delete({ where: { id } })

    // Bug fix: 204 must have no body; use 200 with a message instead
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (err) {
    return serverError(err)
  }
}