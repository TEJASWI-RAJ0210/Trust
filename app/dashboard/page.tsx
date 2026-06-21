"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation" // Bug fix: was 'next/router' (pages router)
import {
  FileCheck, Clock, AlertTriangle, Plus, ArrowRight,
  Shield, Users, Zap, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ProofStatus = "active" | "delivered" | "disputed"

interface ProofRecord {
  id: string
  title: string
  status: ProofStatus
  timestamp: string
  parties: string[]
  type: string
}

function fromApiRecord(record: any): ProofRecord {
  return {
    id: record.id,
    title: record.title,
    status:
      record.status === "disputed"
        ? "disputed"
        : record.status === "delivered"
        ? "delivered"
        : "active",
    timestamp: record.createdAt ?? new Date().toISOString(),
    parties: record.data?.parties ?? ["Unknown"],
    type: record.data?.type ?? "Unknown",
  }
}

function useProofs() {
  const [proofs, setProofs] = useState<ProofRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProofs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/proofs")
      if (!response.ok) throw new Error(`Failed to load proofs (${response.status})`)
      const data = await response.json()
      setProofs(data.map((item: any) => fromApiRecord(item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return { proofs, loading, error, loadProofs }
}

function StatusBadge({ status }: { status: ProofStatus }) {
  const styles = {
    active: "bg-accent/10 text-accent border-accent/20",
    delivered: "bg-green-500/10 text-green-700 border-green-500/20",
    disputed: "bg-destructive/10 text-destructive border-destructive/20",
  }
  const labels = { active: "Active", delivered: "Delivered", disputed: "Disputed" }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function ProofCard({ proof }: { proof: ProofRecord }) {
  const formattedDate = new Date(proof.timestamp).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })

  return (
    <Link href={`/proof/${proof.id}`}>
      <Card className="hover:shadow-md hover:border-accent/20 transition-all cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
                {proof.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{proof.type}</p>
            </div>
            <StatusBadge status={proof.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{proof.parties.length} parties</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatCard({
  title, value, icon: Icon, description,
}: {
  title: string
  value: number
  icon: React.ElementType
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
            <Icon className="h-6 w-6 text-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter() // Bug fix: useRouter hook, not default import
  const { proofs, loading, error, loadProofs } = useProofs()

  useEffect(() => {
    loadProofs()
  }, [])

  const activeProofs = useMemo(() => proofs.filter((p) => p.status === "active"), [proofs])
  const completedProofs = useMemo(() => proofs.filter((p) => p.status === "delivered"), [proofs])
  const disputedProofs = useMemo(() => proofs.filter((p) => p.status === "disputed"), [proofs])

  // Bug fix: proper logout using App Router
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your proof records</p>
        </div>
        {/* Bug fix: removed "Add Random Proof" (debug button) and moved logout to sidebar */}
        <div className="flex items-center gap-3">
          <Button onClick={loadProofs} variant="outline" className="gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Link href="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Proof
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          {error}
        </div>
      )}

      {/* Stats — Bug fix: removed hardcoded 44, replaced with real proof counts */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Active Projects"
          value={activeProofs.length}
          icon={FileCheck}
          description="In progress"
        />
        <StatCard
          title="Completed Proofs"
          value={completedProofs.length}
          icon={Shield}
          description="Successfully delivered"
        />
        <StatCard
          title="Disputes"
          value={disputedProofs.length}
          icon={AlertTriangle}
          description="Requiring attention"
        />
        <StatCard
          title="Total Records"
          value={proofs.length}
          icon={Zap}
          description="All time"
        />
      </div>

      {/* Active Projects */}
      {activeProofs.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <span className="text-sm text-muted-foreground">{activeProofs.length} projects</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProofs.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Proofs */}
      {completedProofs.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Completed Proofs</h2>
            <Link href="/proof" className="text-sm text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProofs.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {proofs.length === 0 && !loading && (
        <Card className="text-center py-16 mb-10">
          <CardContent className="flex flex-col items-center gap-4">
            <Shield className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="font-medium mb-1">No proof records yet</p>
              <p className="text-sm text-muted-foreground">Create your first proof to get started</p>
            </div>
            <Link href="/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Proof
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Auto-Capture Activity — kept as UI placeholder until integrations are built */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Recent Auto-Captures
          </h2>
          <Link href="/integrations" className="text-sm text-accent hover:underline flex items-center gap-1">
            Manage integrations <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[
                { source: "Stripe", event: "Payment confirmed: $2,500", proof: "Website Redesign Project", time: "2 min ago", icon: "S" },
                { source: "Google", event: "Meeting recorded: Client Review Call", proof: "Monthly Retainer", time: "15 min ago", icon: "G" },
                { source: "Notion", event: "Contract signed by all parties", proof: "Office Lease Agreement", time: "1 hour ago", icon: "N" },
                { source: "Stripe", event: "Invoice sent: INV-2026-0312", proof: "Consulting Agreement Q1", time: "3 hours ago", icon: "S" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center font-semibold text-accent">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.source} · {activity.proof}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Disputes requiring attention */}
      {disputedProofs.length > 0 && (
        <section>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Disputes Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {disputedProofs.map((proof) => (
                  <Link key={proof.id} href={`/disputes/${proof.id}`} className="block">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-destructive/30 transition-colors">
                      <div>
                        <p className="font-medium">{proof.title}</p>
                        <p className="text-sm text-muted-foreground">{proof.parties.join(" & ")}</p>
                      </div>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}