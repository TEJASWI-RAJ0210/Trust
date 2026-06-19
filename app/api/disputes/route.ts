import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const disputes = await prisma.dispute.findMany({
    include: { user: true, party: true },
  })
  return NextResponse.json(disputes)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.title || !body.userId || !body.partyId) {
    return NextResponse.json({ message: 'title, userId, and partyId are required.' }, { status: 400 })
  }

  const dispute = await prisma.dispute.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      status: body.status ?? 'open',
      user: { connect: { id: body.userId } },
      party: { connect: { id: body.partyId } },
    },
  })

  return NextResponse.json(dispute, { status: 201 })
}
