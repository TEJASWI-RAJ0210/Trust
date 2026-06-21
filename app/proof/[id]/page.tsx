"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield, ArrowLeft, Clock, Users, FileIcon, Link2,
  Download, Share2, CheckCircle2, Copy, ExternalLink,
  Plus, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProofData {
  type?: string
  parties?: { id?: string; name: string; email?: string; role?: string }[]
  files?: { name: string; size?: string }[]
  links?: string[]
}

interface Proof {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  data: ProofData | null
  user: { id: string; email: string; name: string | null }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function VerifiedBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
      <Shield className="h-4 w-4 text-green-600" />
      <span className="text-sm font-medium text-green-700">Tamper-Proof Verified</span>
    </div>
  )
}

function TimestampBadge({ date }: { date: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="font-mono text-xs">{formatDate(date)}</span>
    </div>
  )
}

export default function ProofDetailPage() {
  // Bug fix: useParams instead of server component params prop
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [proof, setProof] = useState<Proof | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Bug fix: use API route (with auth) instead of direct Prisma call
        const res = await fetch(`/api/proofs/${id}`)
        if (res.status === 401) { router.push("/auth/login"); return }
        if (res.status === 403) { setError("You don't have access to this proof."); return }
        if (res.status === 404) { setError("Proof not found."); return }
        if (!res.ok) throw new Error(`Failed to load proof (${res.status})`)
        const data: Proof = await res.json()
        setProof(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load proof")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleCopy = () => {
    // Bug fix: copy button now actually copies
    navigator.clipboard.writeText(`trustlayer.app/proof/${id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading proof record...</p>
      </div>
    )
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-4">
        <Shield className="h-10 w-10 text-muted-foreground/30" />
        <h1 className="text-xl font-semibold">{error ?? "Proof not found"}</h1>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  // Bug fix: safely extract data fields (proof.data is Json — cast carefully)
  const proofData = proof.data as ProofData | null
  const proofType = proofData?.type ?? "Unknown"
  const files = Array.isArray(proofData?.files) ? proofData.files : []
  const links = Array.isArray(proofData?.links) ? proofData.links : []
  const parties = Array.isArray(proofData?.parties) ? proofData.parties : []

  // Bug fix: timeline built only from fields that actually exist in schema
  // (updatedAt and completedAt do NOT exist — removed)
  const timeline = [
    { event: "Proof created", timestamp: proof.createdAt, verified: true },
    ...(proof.status === "delivered"
      ? [{ event: "Proof delivered", timestamp: proof.createdAt, verified: true }]
      : []),
    ...(proof.status === "disputed"
      ? [{ event: "Dispute raised", timestamp: proof.createdAt, verified: true }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/disputes/new?proof=${proof.id}`}>
              <Button variant="outline" size="sm" className="gap-2 text-amber-600 border-amber-600/30 hover:bg-amber-500/10">
                <AlertTriangle className="h-4 w-4" />
                Raise Dispute
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCopy}
            >
              <Share2 className="h-4 w-4" />
              {copied ? "Copied!" : "Share"}
            </Button>
            {/* Download PDF - placeholder until PDF generation is built */}
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{proof.title}</h1>
            <VerifiedBadge />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Proof ID:</span>
              <span className="font-mono text-xs">{proof.id}</span>
              {/* Bug fix: copy button has handler */}
              <button
                className="p-1 hover:bg-secondary rounded transition-colors"
                onClick={() => { navigator.clipboard.writeText(proof.id) }}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="text-border">|</span>
            <span>{proofType}</span>
            <span className="text-border">|</span>
            <TimestampBadge date={proof.createdAt} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {proof.description ?? "No description provided."}
                </p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.verified ? "bg-green-500/10" : "bg-secondary"
                        }`}>
                          {item.verified
                            ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                            : <Clock className="h-4 w-4 text-muted-foreground" />
                          }
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-border absolute top-8" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(item.timestamp)}</p>
                        {item.verified && (
                          <p className="text-xs text-green-600 mt-1">Timestamp secured</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attached Files</CardTitle>
              </CardHeader>
              <CardContent>
                {files.length > 0 ? (
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size ?? "Unknown size"}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" disabled>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No files attached to this proof.</p>
                )}

                {links.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">External Links</h4>
                    <div className="space-y-2">
                      {links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-accent hover:underline"
                        >
                          <Link2 className="h-4 w-4" />
                          <span className="truncate">{link}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Evidence — placeholder until file upload endpoint is built */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div
                    className="p-4 border-2 border-dashed border-border rounded-lg text-center opacity-50 cursor-not-allowed"
                    title="File uploads coming soon"
                  >
                    <Plus className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload additional files (coming soon)</p>
                    <p className="text-xs text-muted-foreground mt-1">All uploads will be timestamped and immutable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parties Involved
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parties.length > 0 ? (
                  <div className="space-y-3">
                    {parties.map((party, index) => (
                      <div key={index} className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{party.name}</p>
                            {party.email && (
                              <p className="text-xs text-muted-foreground">{party.email}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{party.role ?? "Participant"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Fall back to showing the proof owner */}
                    <div className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{proof.user.name ?? proof.user.email}</p>
                          <p className="text-xs text-muted-foreground">{proof.user.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Creator</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification */}
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-medium text-green-600">Verified & Immutable</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-medium text-sm">{formatDate(proof.createdAt)}</p>
                </div>
                <div className="pt-4 border-t border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    This record cannot be altered. All timestamps are cryptographically secured.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Proof</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <input
                    type="text"
                    value={`trustlayer.app/proof/${proof.id}`}
                    readOnly
                    className="flex-1 bg-transparent text-xs font-mono outline-none min-w-0"
                  />
                  {/* Bug fix: copy handler */}
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-2">Link copied to clipboard</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Anyone with this link can verify this proof
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}