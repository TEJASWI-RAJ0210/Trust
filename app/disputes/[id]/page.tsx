import Link from "next/link"
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Users, 
  FileIcon,
  Send,
  AlertCircle
} from "lucide-react"
import { prisma } from "../../../lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusBadge({ status }: { status: "pending" | "in-review" | "resolved" }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    "in-review": "bg-accent/10 text-accent border-accent/20",
    resolved: "bg-green-500/10 text-green-700 border-green-500/20",
  }

  const labels = {
    pending: "Pending Review",
    "in-review": "In Review",
    resolved: "Resolved",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${styles[status]}`}>
      {status === "pending" && <AlertTriangle className="h-4 w-4" />}
      {status === "in-review" && <Clock className="h-4 w-4" />}
      {status === "resolved" && <CheckCircle2 className="h-4 w-4" />}
      {labels[status]}
    </span>
  )
}

export default async function DisputeDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = params

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: { user: true, party: true },
  })

  if (!dispute) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">Dispute not found</h1>
        <p className="text-muted-foreground">No record exists for this dispute ID.</p>
      </div>
    )
  }

  const parties = [
    {
      name: dispute.user?.name ?? dispute.user?.email ?? 'Claimant',
      role: 'Claimant',
      claim: dispute.description ?? 'No claim given',
    },
    {
      name: dispute.party?.name ?? 'Respondent',
      role: 'Respondent',
      claim: 'Response pending',
    },
  ]

  const mismatches = dispute.description ? [{ field: 'Description', agreed: 'As agreed', delivered: dispute.description }] : []
  const timeline = [
    { event: 'Dispute submitted', timestamp: dispute.createdAt.toISOString(), party: dispute.user?.name ?? 'Unknown', highlight: true },
    { event: `Status: ${dispute.status}`, timestamp: dispute.updatedAt?.toISOString() ?? dispute.createdAt.toISOString(), party: 'System', highlight: dispute.status !== 'pending' },
  ]
  const attachments: { name: string; party: string }[] = []

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/disputes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Disputes</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{dispute.title}</h1>
          <StatusBadge status={dispute.status} />
        </div>
        <p className="text-muted-foreground mt-2">Dispute ID: {dispute.id} | Proof: {dispute.proofId}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Party 1 Claim */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {parties[0].name}
              <span className="text-xs font-normal text-muted-foreground ml-1">({parties[0].role})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm leading-relaxed">{dispute.parties[0].claim}</p>
            </div>
          </CardContent>
        </Card>

        {/* Party 2 Claim */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {parties[1].name}
              <span className="text-xs font-normal text-muted-foreground ml-1">({parties[1].role})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm leading-relaxed">{dispute.parties[1].claim}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mismatches */}
      <Card className="mb-8 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Identified Mismatches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Field</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Agreed</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {mismatches.map((mismatch, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{mismatch.field}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{mismatch.agreed}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={mismatch.agreed !== mismatch.delivered ? "text-amber-600 font-medium" : ""}>
                        {mismatch.delivered}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                    className={`flex gap-4 ${item.highlight ? "bg-amber-500/5 -mx-4 px-4 py-2 rounded-lg border-l-2 border-amber-500" : ""}`}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        item.highlight ? "bg-amber-500/20" : "bg-secondary"
                      }`}>
                        {item.highlight ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        )}
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

        {/* Attachments & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attachments.length > 0 ? (
                  attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.party}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No attachments added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Response</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Add your response or additional evidence..."
                className="mb-4"
                rows={4}
              />
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                Submit for Review
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Your response will be added to the official record
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
