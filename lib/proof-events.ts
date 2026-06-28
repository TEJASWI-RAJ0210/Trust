import { prisma } from './prisma'
import { hashProofContent, requestTimestamp, type ProofHashInput } from './hashing'

export type ProofEventType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'file_added'
  | 'disputed'
  | 'dispute_responded'
  | 'resolved'

interface LogEventOptions {
  proofId: string
  eventType: ProofEventType
  actorId: string          // userId performing the action
  description?: string     // human-readable description of what changed
  metadata?: Record<string, unknown>
}

/**
 * Log a proof event, compute its SHA-256 hash, and optionally get an RFC 3161
 * timestamp. Call this whenever a proof or its associated dispute changes.
 *
 * The event is stored in ProofEvent. The proof's own `hash` and `tsr` fields
 * are updated to reflect the latest state.
 */
export async function logProofEvent({
  proofId,
  eventType,
  actorId,
  description,
  metadata,
}: LogEventOptions): Promise<void> {
  // Fetch the current proof state to hash
  const proof = await prisma.proof.findUnique({
    where: { id: proofId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      data: true,
      userId: true,
      createdAt: true,
    },
  })

  if (!proof) throw new Error(`Proof ${proofId} not found for event logging`)

  const eventTimestamp = new Date().toISOString()

  const hashInput: ProofHashInput = {
    id: proof.id,
    title: proof.title,
    description: proof.description,
    status: proof.status,
    data: proof.data,
    userId: proof.userId,
    createdAt: proof.createdAt.toISOString(),
    eventType,
    eventTimestamp,
  }

  const hash = hashProofContent(hashInput)

  // Request RFC 3161 timestamp — if TSA is unavailable, we still store the hash
  let tsrBase64: string | null = null
  let tsaUrl: string | null = null
  let tsrTimestampedAt: Date | null = null

  try {
    const tsr = await requestTimestamp(hash)
    tsrBase64 = tsr.tsrBase64
    tsaUrl = tsr.tsaUrl
    tsrTimestampedAt = new Date(tsr.timestampedAt)
  } catch (err) {
    // TSA failure is non-fatal — hash is still recorded
    console.warn(`[proof-events] RFC 3161 timestamp failed for proof ${proofId}:`, err)
  }

  // Store the event and update the proof's latest hash atomically
  await prisma.$transaction([
    prisma.proofEvent.create({
      data: {
        proofId,
        eventType,
        actorId,
        description: description ?? eventType,
        metadata: metadata ?? {},
        hash,
        tsrBase64,
        tsaUrl,
        tsrTimestampedAt,
        occurredAt: new Date(eventTimestamp),
      },
    }),
    prisma.proof.update({
      where: { id: proofId },
      data: {
        latestHash: hash,
        latestTsr: tsrBase64,
        latestTsrAt: tsrTimestampedAt,
      },
    }),
  ])
}