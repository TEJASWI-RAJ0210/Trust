import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getAuthUserId, unauthorized, forbidden, notFound, serverError } from '../../../../lib/api-auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    const party = await prisma.party.findUnique({
      where: { id },
      include: {
        disputes: {
          where: { userId }, // only show disputes that belong to the current user
          select: { id: true, title: true, status: true, createdAt: true },
        },
      },
    })

    if (!party) return notFound('Party')

    // Bug fix: only accessible if user has a dispute with this party
    if (party.disputes.length === 0) return forbidden()

    return NextResponse.json(party)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    const party = await prisma.party.findUnique({
      where: { id },
      include: { disputes: { where: { userId } } },
    })

    if (!party) return notFound('Party')

    // Bug fix: only allow deletion if this user has disputes with the party
    // and no other users do (parties can be shared across users via disputes)
    if (party.disputes.length === 0) return forbidden()

    const allDisputes = await prisma.dispute.count({ where: { partyId: id } })
    const userDisputes = party.disputes.length

    if (allDisputes > userDisputes) {
      // Other users reference this party — don't delete, just disassociate
      return NextResponse.json(
        { message: 'Cannot delete party referenced by other users' },
        { status: 409 }
      )
    }

    await prisma.party.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (err) {
    return serverError(err)
  }
}