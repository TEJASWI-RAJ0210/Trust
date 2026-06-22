"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, AlertTriangle, Clock, CheckCircle2,
  Users, FileIcon, Send, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Dispute {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string | null; email: string }
  party: { id: string; name: string }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// Bug fix: added "open" status — was missing, causing crash on default disputes
type DisputeStatus = "open" | "pending" | "in-review" | "resolved"

function StatusBadge({ status }: { status: string }) {
  const config: Record<DisputeStatus, { styles: string; label: string; icon: React.ReactNode }> = {
    open: {
      styles: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      label: "Open",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    pending: {
      styles: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      label: "Pending Review",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    "in-review": {
      styles: "bg-accent/10 text-accent border-accent/20",
      label: "In Review",
      icon: <Clock className="h-4 w-4" />,
    },
    resolved: {
      styles: "bg-green-500/10 text-green-700 border-green-500/20",
      label: "Resolved",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  }

  // Bug fix: safe fallback for unknown statuses
  const c = config[status as DisputeStatus] ?? config.open

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${c.styles}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

export default function DisputeDetailPage() {
  // Bug fix: useParams instead of server component params (no auth in server component)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Response form state — Bug fix: textarea now has state and a submit handler
  const [response, setResponse] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Bug fix: API call with auth instead of direct Prisma
        const res = await fetch(`/api/disputes/${id}`)
        if (res.status === 401) { router.push("/auth/login"); return }
        if (res.status === 403) { setError("You don't have access to this dispute."); return }
        if (res.status === 404) { setError("Dispute not found."); return }
        if (!res.ok) throw new Error(`Failed to load dispute (${res.status})`)
        setDispute(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dispute")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Bug fix: response submission actually calls PATCH /api/disputes/[id]
  const handleSubmitResponse = async () => {
    if (!response.trim() || !dispute) return
    setSubmitLoading(true)
    setSubmitError(null)

    try {
      const res = await fetch(`/api/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Append response to description so it's part of the record
          description: [
            dispute.description,
            `\n--- Response (${new Date().toLocaleString()}) ---\n${response.trim()}`,
          ].filter(Boolean).join(""),
          status: dispute.status === "open" ? "in-review" : dispute.status,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || "Failed to submit response")
      }

      const updated: Dispute = await res.json()
      setDispute(updated)
      setResponse("")
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground py-20 text-center">Loading dispute...</p>
      </div>
    )
  }

  if (error || !dispute) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-muted-foreground/30" />
        <h1 className="text-xl font-semibold">{error ?? "Dispute not found"}</h1>
        <Link href="/disputes">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Disputes
          </Button>
        </Link>
      </div>
    )
  }

  // Build timeline from fields that actually exist in schema
  // Bug fix: removed dispute.proofId (not in schema), fixed parties access
  const timeline = [
    {
      event: "Dispute submitted",
      timestamp: dispute.createdAt,
      party: dispute.user?.name ?? dispute.user?.email ?? "Unknown",
      highlight: true,
    },
    ...(dispute.updatedAt !== dispute.createdAt ? [{
      event: `Status updated to: ${dispute.status}`,
      timestamp: dispute.updatedAt,
      party: "System",
      highlight: dispute.status === "in-review",
    }] : []),
    ...(dispute.status === "resolved" ? [{
      event: "Dispute resolved",
      timestamp: dispute.updatedAt,
      party: "TrustLayer",
      highlight: false,
    }] : []),
  ]

  // Bug fix: parties built from real dispute fields, not from nonexistent dispute.parties
  const claimant = {
    name: dispute.user?.name ?? dispute.user?.email ?? "Claimant",
    role: "Claimant",
    claim: dispute.description ?? "No description provided.",
  }
  const respondent = {
    name: dispute.party?.name ?? "Respondent",
    role: "Respondent",
    claim: "Response pending from respondent.",
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/disputes"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Disputes</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{dispute.title}</h1>
          <StatusBadge status={dispute.status} />
        </div>
        {/* Bug fix: removed dispute.proofId — doesn't exist in schema */}
        <p className="text-muted-foreground mt-2 text-sm">
          Dispute ID: <span className="font-mono">{dispute.id}</span>
          {" · "}Filed {formatDate(dispute.createdAt)}
        </p>
      </div>

      {/* Party claims */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {claimant.name}
              <span className="text-xs font-normal text-muted-foreground">({claimant.role})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary rounded-lg">
              {/* Bug fix: using claimant.claim (local var), not dispute.parties[0].claim */}
              <p className="text-sm leading-relaxed">{claimant.claim}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {respondent.name}
              <span className="text-xs font-normal text-muted-foreground">({respondent.role})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary rounded-lg">
              {/* Bug fix: using respondent.claim (local var), not dispute.parties[1].claim */}
              <p className="text-sm leading-relaxed text-muted-foreground italic">{respondent.claim}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mismatches — shown only when there's a description to analyze */}
      {dispute.description && (
        <Card className="mb-8 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Dispute Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {dispute.description}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${item.highlight
                      ? "bg-amber-500/5 -mx-4 px-4 py-2 rounded-lg border-l-2 border-amber-500"
                      : ""
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        item.highlight ? "bg-amber-500/20" : "bg-secondary"
                      }`}>
                        {item.highlight
                          ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                          : <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border absolute top-8" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">{item.event}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(item.timestamp)}</span>
                        <span className="text-border">|</span>
                        <span>{item.party}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No attachments added yet.</p>
            </CardContent>
          </Card>

          {/* Bug fix: response textarea now has state + submit handler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Response</CardTitle>
            </CardHeader>
            <CardContent>
              {dispute.status === "resolved" ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  This dispute has been resolved.
                </p>
              ) : (
                <>
                  <Textarea
                    placeholder="Add your response or additional evidence..."
                    className="mb-3"
                    rows={4}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    disabled={submitLoading}
                  />
                  {submitError && (
                    <p className="text-xs text-destructive mb-3">{submitError}</p>
                  )}
                  {submitSuccess && (
                    <p className="text-xs text-green-600 mb-3">Response submitted successfully.</p>
                  )}
                  <Button
                    className="w-full gap-2"
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || submitLoading}
                  >
                    <Send className="h-4 w-4" />
                    {submitLoading ? "Submitting..." : "Submit for Review"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Your response will be added to the official record
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}