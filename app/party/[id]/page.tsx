"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield, ArrowLeft, CheckCircle2, AlertTriangle, Clock,
  FileCheck, Mail, Calendar, Building2, Award, TrendingUp,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Bug fix: Party schema only has id, name, createdAt — nothing else
interface Party {
  id: string
  name: string
  createdAt: string
  disputes: {
    id: string
    title: string
    status: string
    createdAt: string
  }[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

// Bug fix: removed trustScore ring — no trust score data exists for parties in schema
// Bug fix: removed verificationLevel — not in schema
// Bug fix: removed mockParty entirely

export default function PartyProfilePage() {
  // Bug fix: useParams instead of server component (no auth in server component)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [party, setParty] = useState<Party | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Bug fix: use API route with auth instead of direct Prisma call
        const res = await fetch(`/api/parties/${id}`)
        if (res.status === 401) { router.push("/auth/login"); return }
        if (res.status === 403) { setError("You don't have access to this party's profile."); return }
        if (res.status === 404) { setError("Party not found."); return }
        if (!res.ok) throw new Error(`Failed to load party (${res.status})`)
        setParty(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load party")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading party profile...</p>
      </div>
    )
  }

  if (error || !party) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Building2 className="h-10 w-10 text-muted-foreground/30" />
        <h1 className="text-xl font-semibold">{error ?? "Party not found"}</h1>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const resolvedDisputes = party.disputes.filter((d) => d.status === "resolved").length
  const openDisputes = party.disputes.filter((d) => d.status === "open" || d.status === "pending").length
  const disputeTotal = party.disputes.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <Link href={`/create`}>
            <Button size="sm" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Create Proof
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">{party.name}</h1>
                {/* Bug fix: no email/company in schema — show what we have */}
                <p className="text-muted-foreground text-sm">
                  {disputeTotal} dispute{disputeTotal !== 1 ? "s" : ""} with you
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Party created {formatDate(party.createdAt)}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Party ID:</span>
                <span className="font-mono text-xs">{party.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats — only from real schema fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Total Disputes</p>
                <p className="text-2xl font-semibold">{disputeTotal}</p>
              </div>
              <div className="p-4 bg-secondary rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                <p className="text-2xl font-semibold text-green-600">{resolvedDisputes}</p>
              </div>
              <div className="p-4 bg-secondary rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Open</p>
                <p className="text-2xl font-semibold text-amber-600">{openDisputes}</p>
              </div>
            </div>

            {/* Disputes with this party */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disputes with {party.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {party.disputes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No disputes recorded with this party.</p>
                ) : (
                  <div className="space-y-3">
                    {party.disputes.map((dispute) => (
                      <Link
                        key={dispute.id}
                        href={`/disputes/${dispute.id}`}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            dispute.status === "resolved" ? "bg-green-500/10" :
                            dispute.status === "in-review" ? "bg-accent/10" :
                            "bg-amber-500/10"
                          )}>
                            {dispute.status === "resolved"
                              ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                              : dispute.status === "in-review"
                              ? <Clock className="h-5 w-5 text-accent" />
                              : <AlertTriangle className="h-5 w-5 text-amber-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">{dispute.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(dispute.createdAt)} · {dispute.status}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Dispute Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resolution Rate</span>
                  <span className={cn(
                    "text-sm font-medium",
                    disputeTotal > 0 && (resolvedDisputes / disputeTotal) >= 0.7
                      ? "text-green-600" : "text-amber-600"
                  )}>
                    {disputeTotal > 0
                      ? `${Math.round((resolvedDisputes / disputeTotal) * 100)}%`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Open Disputes</span>
                  <span className="text-sm font-medium">{openDisputes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resolved</span>
                  <span className="text-sm font-medium text-green-600">{resolvedDisputes}</span>
                </div>
                <div className="pt-4 border-t border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    Based on {disputeTotal} dispute{disputeTotal !== 1 ? "s" : ""} between you and {party.name}.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Note about limited data */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Extended party profiles including trust scores, verification history, and proof history will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}