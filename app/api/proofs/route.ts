import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const proofs = await prisma.proof.findMany({
    include: { user: true },
  })
  return NextResponse.json(proofs)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.title || !body.userId) {
    return NextResponse.json({ message: 'title and userId are required' }, { status: 400 })
  }

  const proof = await prisma.proof.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      data: body.data ?? null,
      status: body.status ?? 'active',
      user: { connect: { id: body.userId } },
    },
  })

  return NextResponse.json(proof, { status: 201 })
}
