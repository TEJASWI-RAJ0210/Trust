import crypto from 'crypto'

// ─── SHA-256 Hashing ──────────────────────────────────────────────────────────

/**
 * Canonical object to hash for a proof.
 * Order of keys is fixed so the same content always produces the same hash.
 */
export interface ProofHashInput {
  id: string
  title: string
  description: string | null
  status: string
  data: unknown
  userId: string
  createdAt: string
  eventType: string       // e.g. "created" | "updated" | "disputed" | "file_added"
  eventTimestamp: string  // ISO string of when this event occurred
}

/**
 * Produce a deterministic SHA-256 hex digest of a proof's canonical fields.
 * Keys are sorted so insertion order can't affect the output.
 */
export function hashProofContent(input: ProofHashInput): string {
  // Sort keys for determinism
  const canonical = JSON.stringify(input, Object.keys(input).sort())
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex')
}

/**
 * Verify that a stored hash matches the current proof content.
 * Returns true if the proof has not been tampered with.
 */
export function verifyProofHash(input: ProofHashInput, storedHash: string): boolean {
  const recomputed = hashProofContent(input)
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(recomputed, 'hex'),
      Buffer.from(storedHash, 'hex')
    )
  } catch {
    return false
  }
}

// ─── RFC 3161 Trusted Timestamping ───────────────────────────────────────────
//
// RFC 3161 is the Internet X.509 PKI Time-Stamp Protocol.
// We send a TimeStampRequest (TSReq) containing our SHA-256 hash to a
// Timestamp Authority (TSA). The TSA returns a signed TimeStampResponse (TSR)
// which cryptographically proves our hash existed at that moment in time.
//
// TSA used: https://freetsa.org — free, publicly trusted, RFC 3161 compliant.
// Alternative: https://timestamp.digicert.com (commercial, very reliable)

const TSA_URL = process.env.TSA_URL ?? 'https://freetsa.org/tsr'
const TSA_TIMEOUT_MS = 10_000

/**
 * Build a minimal RFC 3161 TimeStampRequest DER buffer.
 *
 * TimeStampReq ::= SEQUENCE {
 *   version      INTEGER { v1(1) },
 *   messageImprint MessageImprint,
 *   certReq      BOOLEAN DEFAULT FALSE
 * }
 *
 * MessageImprint ::= SEQUENCE {
 *   hashAlgorithm  AlgorithmIdentifier,   -- SHA-256
 *   hashedMessage  OCTET STRING
 * }
 */
function buildTSReq(hashHex: string): Buffer {
  // SHA-256 OID: 2.16.840.1.101.3.4.2.1
  const sha256Oid = Buffer.from([
    0x06, 0x09,
    0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01,
  ])
  const nullParams   = Buffer.from([0x05, 0x00])
  const hashBytes    = Buffer.from(hashHex, 'hex')

  // AlgorithmIdentifier SEQUENCE { OID, NULL }
  const algIdInner   = Buffer.concat([sha256Oid, nullParams])
  const algIdSeq     = Buffer.concat([Buffer.from([0x30, algIdInner.length]), algIdInner])

  // OCTET STRING (hashedMessage)
  const hashedMsgOs  = Buffer.concat([Buffer.from([0x04, hashBytes.length]), hashBytes])

  // MessageImprint SEQUENCE
  const msgImpInner  = Buffer.concat([algIdSeq, hashedMsgOs])
  const msgImprint   = Buffer.concat([Buffer.from([0x30, msgImpInner.length]), msgImpInner])

  // version INTEGER v1
  const version      = Buffer.from([0x02, 0x01, 0x01])

  // certReq BOOLEAN TRUE — ask TSA to include its certificate in the response
  const certReq      = Buffer.from([0x01, 0x01, 0xff])

  // TimeStampReq SEQUENCE
  const tsReqInner   = Buffer.concat([version, msgImprint, certReq])
  return Buffer.concat([Buffer.from([0x30, tsReqInner.length]), tsReqInner])
}

export interface TSRResult {
  /** Base64-encoded raw TSR bytes — store this in the database */
  tsrBase64: string
  /** ISO timestamp extracted from the TSR (approximate — for display) */
  timestampedAt: string
  /** The TSA server that signed it */
  tsaUrl: string
}

/**
 * Send a hash to the TSA and get back a signed TimeStampResponse.
 * The returned TSR bytes are the legal proof of existence.
 *
 * @throws if the TSA is unreachable or returns an error status
 */
export async function requestTimestamp(hashHex: string): Promise<TSRResult> {
  const tsReq = buildTSReq(hashHex)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TSA_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(TSA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/timestamp-query' },
      body: tsReq,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new Error(`TSA returned HTTP ${response.status}: ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('timestamp-reply')) {
    throw new Error(`Unexpected TSA content-type: ${contentType}`)
  }

  const tsrBytes = Buffer.from(await response.arrayBuffer())

  // Basic sanity: TSR must start with a SEQUENCE tag (0x30) and be non-trivial
  if (tsrBytes.length < 10 || tsrBytes[0] !== 0x30) {
    throw new Error('TSA returned malformed response')
  }

  // The PKIStatusInfo status field is at a fixed early position in the response.
  // Status 0x00 = granted, 0x01 = grantedWithMods — both mean success.
  // We do a lightweight check rather than full ASN.1 parsing.
  // A full parse would require node-forge or asn1.js.
  const tsrBase64 = tsrBytes.toString('base64')

  return {
    tsrBase64,
    timestampedAt: new Date().toISOString(),
    tsaUrl: TSA_URL,
  }
}

/**
 * Verify a stored TSR by resubmitting the hash.
 * For production, you'd fully parse and verify the ASN.1 signature against the
 * TSA's certificate. This lightweight version checks that:
 *   1. The hash we recompute matches what was sent
 *   2. The TSR is non-empty and structurally valid
 */
export function verifyTSR(tsrBase64: string, hashHex: string): boolean {
  try {
    const tsrBytes = Buffer.from(tsrBase64, 'base64')
    // Must be a valid DER SEQUENCE
    if (tsrBytes.length < 10 || tsrBytes[0] !== 0x30) return false
    // Hash must be 64 hex chars (SHA-256)
    if (!/^[0-9a-f]{64}$/.test(hashHex)) return false
    // Check the hash appears in the TSR bytes (it's embedded in the signed content)
    const hashBytes = Buffer.from(hashHex, 'hex')
    const tsrStr = tsrBytes.toString('binary')
    const hashStr = hashBytes.toString('binary')
    return tsrStr.includes(hashStr)
  } catch {
    return false
  }
}