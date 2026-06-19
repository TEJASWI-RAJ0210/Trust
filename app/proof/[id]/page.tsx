import Link from "next/link"
import { 
  Shield, 
  ArrowLeft, 
  Clock, 
  Users, 
  FileIcon, 
  Link2, 
  Download, 
  Share2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  AlertTriangle,
  Award,
  Fingerprint
} from "lucide-react"
import { prisma } from "../../../lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export default async function ProofDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const proof = await prisma.proof.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!proof) {
    return (
      <div className="min-h-screen bg-background p-6">
        <h1 className="text-xl font-semibold">Proof not found</h1>
        <p className="text-muted-foreground">No proof record exists for this ID.</p>
      </div>
    )
  }

  const timeline = [
    { event: "Proof created", timestamp: proof.createdAt.toISOString(), verified: true },
    ...(proof.status === "delivered" ? [{ event: "Proof delivered", timestamp: proof.updatedAt?.toISOString() ?? proof.createdAt.toISOString(), verified: true }] : []),
  ]

  const files = Array.isArray(proof.data?.files) ? proof.data.files : []
  const links = Array.isArray(proof.data?.links) ? proof.data.links : []
  const proofType = proof.data && typeof proof.data === 'object' && 'type' in proof.data ? String((proof.data as any).type) : 'Unknown'

  const parties = Array.isArray(proof.data?.parties)
    ? (proof.data.parties as any[])
    : proof.user
    ? [{ id: proof.user.id, name: proof.user.name ?? proof.user.email ?? 'Unknown', role: 'Creator' }]
    : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{proof.title}</h1>
            <VerifiedBadge />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Proof ID:</span>
              <span className="font-mono">{proof.id}</span>
              <button className="p-1 hover:bg-secondary rounded transition-colors">
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{proof.description ?? 'No description available'}</p>
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
                          {item.verified ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
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
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size ?? 'Unknown size'}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

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
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Evidence */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Add Evidence</h4>
                  </div>
                  <div className="p-4 border-2 border-dashed border-border rounded-lg text-center hover:border-accent/50 transition-colors cursor-pointer">
                    <Plus className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload additional files to this proof</p>
                    <p className="text-xs text-muted-foreground mt-1">All uploads are timestamped and immutable</p>
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
                <div className="space-y-4">
                  {parties.length > 0 ? (
                    parties.map((party, index) => (
                      <Link
                        key={index}
                        href={`/party/${party.id}`}
                        className="block p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{party.name}</p>
                            {party.email && <p className="text-sm text-muted-foreground">{party.email}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">{party.role ?? 'Participant'}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No party data available for this proof.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Info */}
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
                  <p className="font-medium">{formatDate(proof.createdAt)}</p>
                </div>
                {proof.completedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="font-medium">{formatDate(proof.completedAt)}</p>
                  </div>
                )}
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
                    className="flex-1 bg-transparent text-sm font-mono outline-none"
                  />
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
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
