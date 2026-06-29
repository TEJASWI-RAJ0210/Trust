import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getAuthUserId, unauthorized, serverError } from '../../../lib/api-auth'
import { logProofEvent } from '../../../lib/proof-events'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const proofs = await prisma.proof.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        data: true,
        status: true,
        createdAt: true,
        latestHash: true,
        latestTsrAt: true,
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

    if (!body.title) {
      return NextResponse.json({ message: 'title is required' }, { status: 400 })
    }

    // Create the proof first (without hash — we need the ID first)
    const proof = await prisma.proof.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        data: body.data ?? null,
        status: 'active',
        user: { connect: { id: userId } },
      },
    })

    // Now log the creation event — this computes + stores the hash and TSR
    await logProofEvent({
      proofId: proof.id,
      eventType: 'created',
      actorId: userId,
      description: `Proof "${proof.title}" created`,
    })

    // Return the proof with its hash populated
    const updated = await prisma.proof.findUnique({
      where: { id: proof.id },
      select: {
        id: true,
        title: true,
        description: true,
        data: true,
        status: true,
        createdAt: true,
        latestHash: true,
        latestTsrAt: true,
        user: { select: { id: true, email: true, name: true } },
      },
    })

    return NextResponse.json(updated, { status: 201 })
  } catch (err) {
    return serverError(err)
  }
}