import Link from "next/link"
import { AlertTriangle, Clock, CheckCircle2, ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DisputeStatus = "pending" | "in-review" | "resolved"

interface Dispute {
  id: string
  proofId: string
  title: string
  status: DisputeStatus
  createdAt: string
  parties: string[]
  summary: string
}

function StatusBadge({ status }: { status: DisputeStatus }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    "in-review": "bg-accent/10 text-accent border-accent/20",
    resolved: "bg-green-500/10 text-green-700 border-green-500/20",
  }

  const labels = {
    pending: "Pending",
    "in-review": "In Review",
    resolved: "Resolved",
  }

  const icons = {
    pending: AlertTriangle,
    "in-review": Clock,
    resolved: CheckCircle2,
  }

  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="h-3.5 w-3.5" />
      {labels[status]}
    </span>
  )
}

function DisputeCard({ dispute }: { dispute: Dispute }) {
  const formattedDate = new Date(dispute.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{dispute.title}</h3>
            <p className="text-sm text-muted-foreground">{dispute.parties.join(" vs. ")}</p>
          </div>
          <StatusBadge status={dispute.status} />
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{dispute.summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Filed: {formattedDate}</span>
          <Link href={`/disputes/${dispute.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              Review <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/disputes')
        if (!response.ok) throw new Error(`Failed to load disputes: ${response.status}`)
        const data = await response.json()
        setDisputes(data.map((d: any) => ({
          id: d.id,
          proofId: d.id,
          title: d.title,
          status: d.status as DisputeStatus,
          createdAt: d.createdAt,
          parties: [d.user?.name ?? 'Unknown', d.party?.name ?? 'Unknown'],
          summary: d.description ?? 'No description available',
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDisputes()
  }, [])

  const pendingDisputes = useMemo(() => disputes.filter((d) => d.status === 'pending'), [disputes])
  const inReviewDisputes = useMemo(() => disputes.filter((d) => d.status === 'in-review'), [disputes])
  const resolvedDisputes = useMemo(() => disputes.filter((d) => d.status === 'resolved'), [disputes])

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Disputes</h1>
          <p className="text-muted-foreground">Review and resolve disputes on your proof records</p>
        </div>
        <Link href="/disputes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Raise Dispute
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{pendingDisputes.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{inReviewDisputes.length}</p>
                <p className="text-sm text-muted-foreground">In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{resolvedDisputes.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Disputes */}
      {pendingDisputes.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Pending Review
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        </section>
      )}

      {/* In Review */}
      {inReviewDisputes.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            In Review
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {inReviewDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        </section>
      )}

      {/* Resolved */}
      {resolvedDisputes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Resolved
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {resolvedDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        </section>
      )}

      {disputes.length === 0 && !loading && (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-muted-foreground">No disputes found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
