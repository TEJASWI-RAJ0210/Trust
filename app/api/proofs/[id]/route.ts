import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getAuthUserId, unauthorized, forbidden, notFound, serverError } from '../../../../lib/api-auth'
import { logProofEvent } from '../../../../lib/proof-events'
import { verifyProofHash, verifyTSR } from '../../../../lib/hashing'

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
        latestHash: true,
        latestTsr: true,
        latestTsrAt: true,
        user: { select: { id: true, email: true, name: true } },
        // Include full event timeline
        events: {
          select: {
            id: true,
            eventType: true,
            description: true,
            hash: true,
            tsrBase64: true,
            tsaUrl: true,
            tsrTimestampedAt: true,
            occurredAt: true,
            actor: { select: { id: true, name: true, email: true } },
          },
          orderBy: { occurredAt: 'asc' },
        },
      },
    })

    if (!proof) return notFound('Proof')
    if (proof.user.id !== userId) return forbidden()

    // Verify integrity — check the latest hash matches current content
    let integrityValid: boolean | null = null
    if (proof.latestHash) {
      const latestEvent = proof.events[proof.events.length - 1]
      if (latestEvent) {
        integrityValid = verifyProofHash(
          {
            id: proof.id,
            title: proof.title,
            description: proof.description,
            status: proof.status,
            data: proof.data,
            userId: proof.user.id,
            createdAt: proof.createdAt.toISOString(),
            eventType: latestEvent.eventType,
            eventTimestamp: latestEvent.occurredAt.toISOString(),
          },
          proof.latestHash
        )
      }
    }

    // Verify TSR if present
    let tsrValid: boolean | null = null
    if (proof.latestTsr && proof.latestHash) {
      tsrValid = verifyTSR(proof.latestTsr, proof.latestHash)
    }

    return NextResponse.json({
      ...proof,
      integrity: {
        hashValid: integrityValid,
        tsrValid,
        latestHash: proof.latestHash,
        latestTsrAt: proof.latestTsrAt,
      },
    })
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

    const existing = await prisma.proof.findUnique({ where: { id } })
    if (!existing) return notFound('Proof')
    if (existing.userId !== userId) return forbidden()

    const allowedStatuses = ['active', 'delivered', 'disputed']
    const data: Record<string, unknown> = {}
    const changes: string[] = []

    if (body.title !== undefined) {
      data.title = body.title
      changes.push('title updated')
    }
    if (body.description !== undefined) {
      data.description = body.description
      changes.push('description updated')
    }
    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { message: `status must be one of: ${allowedStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      data.status = body.status
      changes.push(`status changed to ${body.status}`)
    }

    await prisma.proof.update({ where: { id }, data })

    // Determine event type
    const eventType = body.status !== undefined
      ? (body.status === 'disputed' ? 'disputed' : 'status_changed')
      : 'updated'

    // Log event → hashes the new state and gets RFC 3161 timestamp
    await logProofEvent({
      proofId: id,
      eventType,
      actorId: userId,
      description: changes.join(', ') || 'Proof updated',
      metadata: { changes },
    })

    const updated = await prisma.proof.findUnique({
      where: { id },
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

    return NextResponse.json(updated)
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
    if (existing.userId !== userId) return forbidden()

    // ProofEvents are cascade deleted via schema onDelete: Cascade
    await prisma.proof.delete({ where: { id } })

    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (err) {
    return serverError(err)
  }
}