"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft, ArrowRight, AlertTriangle, Upload, X,
  Search, Shield, FileIcon, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ProofRecord {
  id: string
  title: string
  status: string
  data?: { type?: string; parties?: { name: string; email?: string }[] }
  createdAt: string
}

const disputeReasons = [
  { id: "non-delivery",  label: "Non-Delivery",      description: "Work or payment was not delivered as agreed" },
  { id: "quality",       label: "Quality Issues",     description: "Deliverables do not meet agreed specifications" },
  { id: "timeline",      label: "Timeline Breach",    description: "Deadlines were not met without valid reason" },
  { id: "payment",       label: "Payment Dispute",    description: "Payment was not received or incorrect amount" },
  { id: "scope",         label: "Scope Disagreement", description: "Work performed differs from agreed scope" },
  { id: "other",         label: "Other",              description: "Dispute not covered by above categories" },
]

const steps = [
  { id: 1, title: "Select Proof",  description: "Choose record" },
  { id: 2, title: "Other Party",   description: "Name the party" },
  { id: 3, title: "Reason",        description: "Select category" },
  { id: 4, title: "Details",       description: "Describe issue" },
  { id: 5, title: "Evidence",      description: "Upload files" },
  { id: 6, title: "Review",        description: "Submit dispute" },
]

export default function RaiseDisputePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProofId = searchParams.get("proof")

  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Data
  const [proofs, setProofs] = useState<ProofRecord[]>([])
  const [proofsLoading, setProofsLoading] = useState(true)
  const [proofsError, setProofsError] = useState<string | null>(null)

  // Form state
  const [selectedProof, setSelectedProof] = useState<ProofRecord | null>(null)
  const [partyName, setPartyName] = useState("")       // Bug fix: collect party info
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [expectedResolution, setExpectedResolution] = useState("")
  const [files, setFiles] = useState<{ name: string; size: string }[]>([])

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedDisputeId, setSubmittedDisputeId] = useState<string | null>(null)

  // Bug fix: load real proofs from API
  useEffect(() => {
    const load = async () => {
      setProofsLoading(true)
      setProofsError(null)
      try {
        const res = await fetch("/api/proofs")
        if (!res.ok) throw new Error(`Failed to load proofs (${res.status})`)
        const data: ProofRecord[] = await res.json()
        setProofs(data)

        // Bug fix: pre-select proof if navigated from proof detail page
        if (preselectedProofId) {
          const match = data.find((p) => p.id === preselectedProofId)
          if (match) {
            setSelectedProof(match)
            setCurrentStep(2)
          }
        }
      } catch (err) {
        setProofsError(err instanceof Error ? err.message : "Failed to load proofs")
      } finally {
        setProofsLoading(false)
      }
    }
    load()
  }, [preselectedProofId])

  const filteredProofs = proofs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedProof !== null
      case 2: return partyName.trim().length >= 2
      case 3: return selectedReason !== null
      case 4: return description.trim().length >= 50
      case 5: return true
      case 6: return true
      default: return false
    }
  }

  // Bug fix: actual API submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Step 1: create or find the party
      const partyRes = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: partyName.trim() }),
      })
      if (!partyRes.ok) {
        const body = await partyRes.json().catch(() => null)
        throw new Error(body?.message || "Failed to create party")
      }
      const party = await partyRes.json()

      // Step 2: create the dispute linked to the party
      const disputeRes = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Dispute: ${selectedProof?.title}`,
          description: [
            `Reason: ${disputeReasons.find((r) => r.id === selectedReason)?.label}`,
            "",
            description,
            expectedResolution ? `\nExpected resolution: ${expectedResolution}` : "",
          ].join("\n").trim(),
          partyId: party.id,
          status: "open",
        }),
      })

      if (!disputeRes.ok) {
        const body = await disputeRes.json().catch(() => null)
        throw new Error(body?.message || "Failed to submit dispute")
      }

      const dispute = await disputeRes.json()
      setSubmittedDisputeId(dispute.id)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    if (!canProceed()) return
    if (currentStep === 6) {
      await handleSubmit()
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
  }

  const handleFileUpload = () => {
    setFiles((prev) => [...prev, { name: `evidence-${Date.now()}.pdf`, size: "1.2 MB" }])
  }

  // Success screen
  if (submittedDisputeId) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Dispute Submitted</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your dispute has been filed. The other party has been notified and you will receive updates as the review progresses.
          </p>
          <Card className="max-w-sm mx-auto mb-8">
            <CardContent className="p-6 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dispute ID</span>
                <span className="font-mono text-sm">{submittedDisputeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Related Proof</span>
                <span className="text-sm truncate max-w-[160px]">{selectedProof?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  Pending Review
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/disputes/${submittedDisputeId}`}>
              <Button className="w-full sm:w-auto">View Dispute</Button>
            </Link>
            <Link href="/disputes">
              <Button variant="outline" className="w-full sm:w-auto">All Disputes</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/disputes"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Disputes</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Raise a Dispute</h1>
        <p className="text-muted-foreground">File a formal dispute against a proof record</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep > step.id
                    ? "bg-amber-600 text-white"
                    : currentStep === step.id
                    ? "bg-amber-600 text-white"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 w-8 md:w-14 lg:w-20 mx-2",
                  currentStep > step.id ? "bg-amber-600" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">

        {/* Step 1: Select proof */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Select Proof Record</h2>
              <p className="text-muted-foreground">Choose the proof record you want to dispute</p>
            </div>
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or proof ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bug fix: real proofs with loading/error states */}
            {proofsLoading && (
              <p className="text-center text-sm text-muted-foreground py-8">Loading your proof records...</p>
            )}
            {proofsError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm text-center">
                {proofsError}
              </div>
            )}
            {!proofsLoading && proofs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-3">No proof records found.</p>
                <Link href="/create">
                  <Button variant="outline" size="sm">Create a Proof first</Button>
                </Link>
              </div>
            )}

            <div className="grid gap-3 max-w-2xl mx-auto">
              {filteredProofs.map((proof) => (
                <button
                  key={proof.id}
                  onClick={() => setSelectedProof(proof)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedProof?.id === proof.id
                      ? "border-amber-600 bg-amber-500/5"
                      : "border-border bg-card hover:border-amber-600/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium mb-1">{proof.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {proof.data?.type ?? "Proof"} · Created{" "}
                        {new Date(proof.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{proof.id}</p>
                    </div>
                    {selectedProof?.id === proof.id && (
                      <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Party name — Bug fix: this step was missing entirely */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Who are you disputing with?</h2>
              <p className="text-muted-foreground">Enter the name of the other party in this dispute</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Other Party Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="e.g. Acme Corp, John Smith"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This is the individual or company you are raising the dispute against.
              </p>
            </div>
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    The party name will appear on the formal dispute record and notifications sent to them.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Reason */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Reason for Dispute</h2>
              <p className="text-muted-foreground">Select the category that best describes your dispute</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {disputeReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedReason === reason.id
                      ? "border-amber-600 bg-amber-500/5"
                      : "border-border bg-card hover:border-amber-600/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium mb-1">{reason.label}</h3>
                      <p className="text-sm text-muted-foreground">{reason.description}</p>
                    </div>
                    {selectedReason === reason.id && (
                      <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Describe the Issue</h2>
              <p className="text-muted-foreground">Provide detailed information about your dispute</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Detailed Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Explain what happened, when it occurred, and how it differs from what was agreed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[180px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {description.length} characters
                {description.length < 50 && (
                  <span className="text-amber-600"> ({50 - description.length} more needed)</span>
                )}
                {description.length >= 50 && <span className="text-green-600"> ✓</span>}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expected Resolution</label>
              <Textarea
                placeholder="What outcome are you seeking? (e.g. refund, revised deliverables, contract termination...)"
                value={expectedResolution}
                onChange={(e) => setExpectedResolution(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    All information provided will be shared with the other party. Be factual and avoid emotional language for best results.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Evidence */}
        {currentStep === 5 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Upload Supporting Evidence</h2>
              <p className="text-muted-foreground">Add screenshots, documents, or files that support your claim</p>
            </div>
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Drag and drop files or click to browse</p>
                <Button variant="outline" onClick={handleFileUpload}>Select Files</Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Accepted: PDF, PNG, JPG, DOC (max 10MB each)
                </p>
              </CardContent>
            </Card>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFiles((f) => f.filter((_, i) => i !== index))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Evidence is optional but strongly recommended for faster resolution.
            </p>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Review Your Dispute</h2>
              <p className="text-muted-foreground">Confirm all details before submitting</p>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                {submitError}
              </div>
            )}

            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Proof Record</p>
                  <p className="font-medium">{selectedProof?.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedProof?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Other Party</p>
                  <p className="font-medium">{partyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dispute Reason</p>
                  <p className="font-medium">{disputeReasons.find((r) => r.id === selectedReason)?.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{description}</p>
                </div>
                {expectedResolution && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Resolution</p>
                    <p className="text-sm">{expectedResolution}</p>
                  </div>
                )}
                {files.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Evidence Files</p>
                    <p className="text-sm">{files.length} file(s) attached</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">What happens next?</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>1. The other party will be notified within 24 hours</li>
                      <li>2. They will have 7 days to respond with their side</li>
                      <li>3. A TrustLayer mediator will review both sides</li>
                      <li>4. Resolution typically takes 5–14 business days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className={cn("gap-2", currentStep === 6 && "bg-amber-600 hover:bg-amber-700 text-white")}
        >
          {isSubmitting ? "Submitting..." : currentStep === 6 ? (
            <><AlertTriangle className="h-4 w-4" /> Submit Dispute</>
          ) : (
            <>Continue <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  )
}