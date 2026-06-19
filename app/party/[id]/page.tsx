import Link from "next/link"
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  FileCheck,
  Star,
  Calendar,
  Building2,
  Mail,
  Award,
  TrendingUp,
  History,
  ExternalLink,
  Fingerprint,
  CreditCard,
  PenTool
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PartyData {
  id: string
  name: string
  type: "individual" | "business"
  email: string
  company?: string
  joinedAt: string
  trustScore: number
  verificationLevel: "basic" | "verified" | "premium"
  stats: {
    totalProofs: number
    completedProofs: number
    disputes: number
    disputesWon: number
    avgResponseTime: string
  }
  verifications: {
    id: string
    name: string
    verified: boolean
    verifiedAt?: string
  }[]
  recentProofs: {
    id: string
    title: string
    status: "completed" | "active" | "disputed"
    date: string
  }[]
  verificationHistory: {
    date: string
    action: string
    result: "success" | "failure"
  }[]
}

const mockParty: PartyData = {
  id: "P-A1B2C3D4",
  name: "Design Co.",
  type: "business",
  email: "contact@designco.com",
  company: "Design Co. Pvt. Ltd.",
  joinedAt: "2024-06-15T00:00:00Z",
  trustScore: 87,
  verificationLevel: "verified",
  stats: {
    totalProofs: 156,
    completedProofs: 148,
    disputes: 8,
    disputesWon: 6,
    avgResponseTime: "4.2 hours",
  },
  verifications: [
    { id: "aadhaar", name: "Aadhaar (Director)", verified: true, verifiedAt: "2024-06-15" },
    { id: "pan", name: "PAN Card", verified: true, verifiedAt: "2024-06-15" },
    { id: "gst", name: "GST Registration", verified: true, verifiedAt: "2024-06-16" },
    { id: "cin", name: "Company CIN", verified: true, verifiedAt: "2024-06-16" },
    { id: "esign", name: "Digital Signature", verified: false },
    { id: "bank", name: "Bank Account", verified: true, verifiedAt: "2024-07-01" },
  ],
  recentProofs: [
    { id: "TL-M3X7K9P", title: "Website Redesign Project", status: "completed", date: "2026-03-15" },
    { id: "TL-N4Y8L0Q", title: "Brand Identity Package", status: "active", date: "2026-03-10" },
    { id: "TL-P5Z9M1R", title: "Mobile App UI Design", status: "completed", date: "2026-02-28" },
    { id: "TL-Q6A0N2S", title: "Marketing Collateral", status: "disputed", date: "2026-02-15" },
  ],
  verificationHistory: [
    { date: "2024-07-01", action: "Bank account verified", result: "success" },
    { date: "2024-06-16", action: "GST verification completed", result: "success" },
    { date: "2024-06-16", action: "Company CIN verified", result: "success" },
    { date: "2024-06-15", action: "PAN verified via DigiLocker", result: "success" },
    { date: "2024-06-15", action: "Aadhaar verified via UIDAI", result: "success" },
  ],
}

function TrustScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444"

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-secondary"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">Trust Score</span>
      </div>
    </div>
  )
}

function VerificationBadge({ level }: { level: PartyData["verificationLevel"] }) {
  const config = {
    basic: { label: "Basic", className: "bg-secondary text-muted-foreground" },
    verified: { label: "Verified", className: "bg-green-500/10 text-green-700 border-green-500/20" },
    premium: { label: "Premium", className: "bg-accent/10 text-accent border-accent/20" },
  }

  const { label, className } = config[level]

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border", className)}>
      <CheckCircle2 className="h-4 w-4" />
      {label}
    </span>
  )
}

function StatCard({ 
  label, 
  value, 
  subValue,
  trend 
}: { 
  label: string
  value: string | number
  subValue?: string
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <div className="p-4 bg-secondary rounded-xl">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {subValue && (
        <p className={cn(
          "text-xs mt-1",
          trend === "up" ? "text-green-600" : trend === "down" ? "text-destructive" : "text-muted-foreground"
        )}>
          {subValue}
        </p>
      )}
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function PartyProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const dbParty = await prisma.party.findUnique({
    where: { id },
    include: { disputes: true },
  })

  if (!dbParty) {
    return (
      <div className="min-h-screen p-6 lg:p-10 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold">Party not found</h1>
        <p className="text-muted-foreground">No party exists for this ID.</p>
      </div>
    )
  }

  const party = {
    ...dbParty,
    stats: {
      totalProofs: 0,
      completedProofs: 0,
      disputes: dbParty.disputes.length,
      disputesWon: dbParty.disputes.filter((item) => item.status === 'resolved').length,
      avgResponseTime: 'N/A',
    },
    verifications: [],
    recentProofs: [],
    verificationHistory: [],
  }

  const completionRate = party.stats.totalProofs > 0 ? Math.round((party.stats.completedProofs / party.stats.totalProofs) * 100) : 0
  const disputeRate = party.stats.totalProofs > 0 ? Math.round((party.stats.disputes / party.stats.totalProofs) * 100) : 0
  const verifiedCount = party.verifications.filter(v => v.verified).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </Button>
            <Link href={`/create?party=${party.id}`}>
              <Button size="sm" className="gap-2">
                <FileCheck className="h-4 w-4" />
                Create Proof
              </Button>
            </Link>
          </div>
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
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-semibold">{party.name}</h1>
                  <VerificationBadge level={party.verificationLevel} />
                </div>
                <p className="text-muted-foreground">{party.company}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>{party.email}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(party.joinedAt)}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Party ID:</span>
                <span className="font-mono">{party.id}</span>
              </div>
            </div>
          </div>
          <TrustScoreRing score={party.trustScore} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard 
                label="Total Proofs" 
                value={party.stats.totalProofs}
                subValue={`${party.stats.completedProofs} completed`}
              />
              <StatCard 
                label="Completion Rate" 
                value={`${completionRate}%`}
                subValue="Above average"
                trend="up"
              />
              <StatCard 
                label="Disputes" 
                value={party.stats.disputes}
                subValue={`${disputeRate}% dispute rate`}
                trend={disputeRate < 5 ? "up" : "down"}
              />
              <StatCard 
                label="Response Time" 
                value={party.stats.avgResponseTime}
                subValue="Average"
              />
            </div>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Identity Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {party.verifications.map((verification) => (
                    <div
                      key={verification.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        verification.verified ? "bg-green-500/5 border border-green-500/20" : "bg-secondary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {verification.id === "aadhaar" && <Fingerprint className="h-5 w-5 text-muted-foreground" />}
                        {verification.id === "pan" && <CreditCard className="h-5 w-5 text-muted-foreground" />}
                        {verification.id === "esign" && <PenTool className="h-5 w-5 text-muted-foreground" />}
                        {!["aadhaar", "pan", "esign"].includes(verification.id) && (
                          <FileCheck className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{verification.name}</span>
                      </div>
                      {verification.verified ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {verifiedCount} of {party.verifications.length} verifications completed
                </p>
              </CardContent>
            </Card>

            {/* Recent Proofs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Proofs Together
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {party.recentProofs.map((proof) => (
                    <Link
                      key={proof.id}
                      href={`/proof/${proof.id}`}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          proof.status === "completed" ? "bg-green-500/10" :
                          proof.status === "active" ? "bg-accent/10" : "bg-amber-500/10"
                        )}>
                          {proof.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : proof.status === "active" ? (
                            <Clock className="h-5 w-5 text-accent" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{proof.title}</p>
                          <p className="text-xs text-muted-foreground">{proof.id} | {formatDate(proof.date)}</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Breakdown */}
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Trust Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Identity Verification", score: 30, max: 30 },
                  { label: "Proof History", score: 25, max: 30 },
                  { label: "Dispute Resolution", score: 22, max: 25 },
                  { label: "Response Time", score: 10, max: 15 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.score}/{item.max}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    Trust score is calculated based on verification status, transaction history, and dispute outcomes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Verification Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {party.verificationHistory.map((event, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        event.result === "success" ? "bg-green-500" : "bg-destructive"
                      )} />
                      <div>
                        <p className="text-sm">{event.action}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Risk</span>
                  <span className="text-sm font-medium text-green-600">Low</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Risk</span>
                  <span className="text-sm font-medium text-green-600">Very Low</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delivery Risk</span>
                  <span className="text-sm font-medium text-amber-600">Moderate</span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Based on {party.stats.totalProofs} historical transactions and {party.stats.disputes} disputes.
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
