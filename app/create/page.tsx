"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Shield, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Users, 
  CreditCard, 
  FileText, 
  Upload,
  X,
  FileIcon,
  Link2,
  Zap,
  Settings,
  RefreshCw,
  CheckCircle2,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ProofType = "freelance" | "payment" | "agreement"

interface FormData {
  type: ProofType | null
  title: string
  description: string
  parties: { name: string; email: string }[]
  files: { name: string; size: string }[]
  links: string[]
  integrations: string[]
  autoCapture: boolean
}

const steps = [
  { id: 1, title: "Type", description: "Select proof type" },
  { id: 2, title: "Details", description: "Enter information" },
  { id: 3, title: "Attachments", description: "Add files" },
  { id: 4, title: "Integrations", description: "Auto-capture" },
  { id: 5, title: "Review", description: "Confirm details" },
  { id: 6, title: "Complete", description: "Generate proof" },
]

const proofTypes = [
  {
    id: "freelance" as const,
    title: "Freelance Project",
    description: "Track deliverables, milestones, and payments for client work",
    icon: Users,
  },
  {
    id: "payment" as const,
    title: "Payment Record",
    description: "Create verifiable records for financial transactions",
    icon: CreditCard,
  },
  {
    id: "agreement" as const,
    title: "Agreement / Contract",
    description: "Document terms, conditions, and mutual agreements",
    icon: FileText,
  },
]

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  connected: boolean
  autoCapture: string[]
}

const availableIntegrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Auto-capture payment confirmations",
    icon: "💳",
    connected: true,
    autoCapture: ["Payment receipts", "Subscription changes", "Refunds"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync contracts and agreements",
    icon: "📝",
    connected: true,
    autoCapture: ["Contract signatures", "Document updates", "Page changes"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Capture important conversations",
    icon: "💬",
    connected: false,
    autoCapture: ["Message threads", "File shares", "Approvals"],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Track code deliverables",
    icon: "🐙",
    connected: false,
    autoCapture: ["Pull requests", "Releases", "Issues closed"],
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Sync docs and calendar events",
    icon: "📊",
    connected: true,
    autoCapture: ["Document edits", "Meeting recordings", "Email threads"],
  },
  {
    id: "figma",
    name: "Figma",
    description: "Design deliverable snapshots",
    icon: "🎨",
    connected: false,
    autoCapture: ["Version history", "Comments", "Export logs"],
  },
]

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                  currentStep > step.id
                    ? "bg-accent text-accent-foreground border-accent"
                    : currentStep === step.id
                    ? "bg-background text-accent border-accent"
                    : "bg-secondary text-muted-foreground border-border"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <p className={cn(
                  "text-sm font-medium",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  currentStep > step.id ? "bg-accent" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StepTypeSelection({ 
  selectedType, 
  onSelect 
}: { 
  selectedType: ProofType | null
  onSelect: (type: ProofType) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">What type of proof do you need?</h2>
        <p className="text-muted-foreground">Choose the category that best fits your transaction</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {proofTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={cn(
                "p-6 rounded-xl border-2 text-left transition-all hover:shadow-md",
                selectedType === type.id
                  ? "border-accent bg-accent/5"
                  : "border-border bg-card hover:border-accent/30"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                selectedType === type.id ? "bg-accent/20" : "bg-secondary"
              )}>
                <Icon className={cn(
                  "h-6 w-6",
                  selectedType === type.id ? "text-accent" : "text-foreground"
                )} />
              </div>
              <h3 className="font-semibold mb-2">{type.title}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepDetails({ 
  formData, 
  onChange 
}: { 
  formData: FormData
  onChange: (data: Partial<FormData>) => void 
}) {
  const addParty = () => {
    onChange({ parties: [...formData.parties, { name: "", email: "" }] })
  }

  const updateParty = (index: number, field: "name" | "email", value: string) => {
    const updated = [...formData.parties]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ parties: updated })
  }

  const removeParty = (index: number) => {
    if (formData.parties.length > 1) {
      onChange({ parties: formData.parties.filter((_, i) => i !== index) })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Enter the details</h2>
        <p className="text-muted-foreground">Provide information about your transaction</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g., Website Redesign Project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe the terms, deliverables, or agreement details..."
            rows={4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Parties Involved</label>
            <Button type="button" variant="ghost" size="sm" onClick={addParty}>
              Add Party
            </Button>
          </div>
          <div className="space-y-3">
            {formData.parties.map((party, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  value={party.name}
                  onChange={(e) => updateParty(index, "name", e.target.value)}
                  placeholder="Name"
                  className="flex-1"
                />
                <Input
                  value={party.email}
                  onChange={(e) => updateParty(index, "email", e.target.value)}
                  placeholder="Email"
                  className="flex-1"
                  type="email"
                />
                {formData.parties.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParty(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepAttachments({ 
  formData, 
  onChange 
}: { 
  formData: FormData
  onChange: (data: Partial<FormData>) => void 
}) {
  const [newLink, setNewLink] = useState("")

  const handleFileUpload = () => {
    const mockFile = { name: `document-${Date.now()}.pdf`, size: "2.4 MB" }
    onChange({ files: [...formData.files, mockFile] })
  }

  const removeFile = (index: number) => {
    onChange({ files: formData.files.filter((_, i) => i !== index) })
  }

  const addLink = () => {
    if (newLink.trim()) {
      onChange({ links: [...formData.links, newLink.trim()] })
      setNewLink("")
    }
  }

  const removeLink = (index: number) => {
    onChange({ links: formData.links.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Add attachments</h2>
        <p className="text-muted-foreground">Upload files or add links as supporting evidence</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Files</label>
        <div
          onClick={handleFileUpload}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">Click to upload files</p>
          <p className="text-sm text-muted-foreground">PDF, DOC, Images up to 10MB</p>
        </div>
        {formData.files.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">External Links</label>
        <div className="flex gap-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://example.com/document"
            onKeyDown={(e) => e.key === "Enter" && addLink()}
          />
          <Button type="button" onClick={addLink} variant="secondary">
            Add
          </Button>
        </div>
        {formData.links.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.links.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium truncate max-w-md">{link}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StepIntegrations({ 
  formData, 
  onChange 
}: { 
  formData: FormData
  onChange: (data: Partial<FormData>) => void 
}) {
  const toggleIntegration = (integrationId: string) => {
    const updated = formData.integrations.includes(integrationId)
      ? formData.integrations.filter(id => id !== integrationId)
      : [...formData.integrations, integrationId]
    onChange({ integrations: updated })
  }

  const connectedIntegrations = availableIntegrations.filter(i => i.connected)
  const disconnectedIntegrations = availableIntegrations.filter(i => !i.connected)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Enable Auto-Capture</h2>
        <p className="text-muted-foreground">Connect integrations to automatically capture proof from your tools</p>
      </div>

      {/* Auto-Capture Toggle */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Automatic Proof Capture</h3>
                <p className="text-sm text-muted-foreground">
                  When enabled, TrustLayer will automatically capture events from your connected integrations and add them as verified proof entries.
                </p>
              </div>
            </div>
            <button
              onClick={() => onChange({ autoCapture: !formData.autoCapture })}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors shrink-0",
                formData.autoCapture ? "bg-accent" : "bg-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-transform",
                  formData.autoCapture ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Connected Integrations
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {connectedIntegrations.map((integration) => (
            <button
              key={integration.id}
              onClick={() => toggleIntegration(integration.id)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                formData.integrations.includes(integration.id)
                  ? "border-accent bg-accent/5"
                  : "border-border bg-card hover:border-accent/30"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{integration.name}</h4>
                    {formData.integrations.includes(integration.id) && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{integration.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.autoCapture.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                        {item}
                      </span>
                    ))}
                    {integration.autoCapture.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{integration.autoCapture.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Available Integrations */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          Available Integrations
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {disconnectedIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="p-4 rounded-xl border-2 border-dashed border-border bg-secondary/30"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl opacity-50">{integration.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-muted-foreground">{integration.name}</h4>
                    <Link href="/profile" className="text-xs text-accent hover:underline">
                      Connect
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview of auto-captured events */}
      {formData.autoCapture && formData.integrations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="h-4 w-4 text-accent" />
              <h4 className="font-medium">Auto-capture Preview</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your selections, the following events will be automatically captured:
            </p>
            <div className="space-y-2">
              {formData.integrations.map((id) => {
                const integration = availableIntegrations.find(i => i.id === id)
                if (!integration) return null
                return integration.autoCapture.map((item, idx) => (
                  <div key={`${id}-${idx}`} className="flex items-center gap-2 text-sm">
                    <span>{integration.icon}</span>
                    <span>{item}</span>
                    <span className="text-xs text-muted-foreground">from {integration.name}</span>
                  </div>
                ))
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StepReview({ formData }: { formData: FormData }) {
  const typeLabel = proofTypes.find((t) => t.id === formData.type)?.title

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Review your proof</h2>
        <p className="text-muted-foreground">Make sure everything looks correct</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Type</p>
            <p className="font-medium">{typeLabel}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Title</p>
            <p className="font-medium">{formData.title || "Not provided"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-foreground">{formData.description || "Not provided"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Parties Involved</p>
            <div className="space-y-2">
              {formData.parties.map((party, index) => (
                <p key={index} className="font-medium">
                  {party.name || "Unnamed"} {party.email && `(${party.email})`}
                </p>
              ))}
            </div>
          </div>

          {(formData.files.length > 0 || formData.links.length > 0) && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Attachments</p>
              <div className="space-y-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{file.name}</span>
                  </div>
                ))}
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{link}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.integrations.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Connected Integrations</p>
              <div className="flex flex-wrap gap-2">
                {formData.integrations.map((id) => {
                  const integration = availableIntegrations.find(i => i.id === id)
                  if (!integration) return null
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full text-sm">
                      <span>{integration.icon}</span>
                      <span>{integration.name}</span>
                    </span>
                  )
                })}
              </div>
              {formData.autoCapture && (
                <div className="flex items-center gap-2 mt-2 text-xs text-accent">
                  <Zap className="h-3 w-3" />
                  <span>Auto-capture enabled</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">This record will be tamper-proof</p>
            <p className="text-sm text-muted-foreground">
              Once generated, this proof cannot be altered. A unique timestamp will be securely recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepComplete({ proofId, formData }: { proofId: string; formData: FormData }) {
  const selectedIntegrations = formData.integrations.map(id => 
    availableIntegrations.find(i => i.id === id)
  ).filter(Boolean)

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Proof Generated Successfully</h2>
      <p className="text-muted-foreground mb-8">
        Your tamper-proof record has been created and timestamped.
      </p>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Proof ID</span>
            <span className="font-mono text-sm">{proofId}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Timestamp</span>
            <span className="text-sm">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20">
              Verified
            </span>
          </div>
        </CardContent>
      </Card>

      {selectedIntegrations.length > 0 && formData.autoCapture && (
        <Card className="mb-6 border-accent/20 bg-accent/5 text-left">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-accent" />
              <h3 className="font-medium">Auto-Capture Active</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The following integrations will automatically add verified events to this proof:
            </p>
            <div className="space-y-3">
              {selectedIntegrations.map((integration) => integration && (
                <div key={integration.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-xl">{integration.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Capturing: {integration.autoCapture.join(", ")}
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/proof/${proofId}`}>
          <Button className="gap-2 w-full sm:w-auto">
            View Proof <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full sm:w-auto">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function CreateProofPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [proofId, setProofId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; email?: string } | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    type: null,
    title: "",
    description: "",
    parties: [{ name: "", email: "" }],
    files: [],
    links: [],
    integrations: [],
    autoCapture: true,
  })

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const createProof = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const meResponse = await fetch('/api/auth/me')
      if (!meResponse.ok) {
        throw new Error('You need to log in to create proof')
      }

      const me = await meResponse.json()
      const userId = me?.id
      if (!userId) {
        throw new Error('Unable to determine logged-in user')
      }

      const response = await fetch('/api/proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: 'active',
          userId,
          data: {
            type: formData.type,
            parties: formData.parties,
            files: formData.files,
            links: formData.links,
            integrations: formData.integrations,
          },
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Failed to create proof')
      }

      const proof = await response.json()
      setProofId(proof.id)
      setCurrentStep(6)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchMe = async () => {
      setIsLoadingUser(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          setCurrentUser(null)
        } else {
          const user = await res.json()
          setCurrentUser(user)
        }
      } catch {
        setCurrentUser(null)
      } finally {
        setIsLoadingUser(false)
      }
    }
    fetchMe()
  }, [])

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.type !== null
      case 2:
        return formData.title.trim() !== ""
      case 3:
        return true
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (!canProceed()) return

    if (currentStep === 5) {
      await createProof()
      return
    }

    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            <span className="font-semibold">TrustLayer</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <ProgressBar currentStep={currentStep} />

        {isLoadingUser ? (
          <p className="text-center py-20 text-sm text-muted-foreground">Checking authentication...</p>
        ) : !currentUser ? (
          <div className="min-h-[400px] border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-4">
            <p className="text-base font-medium">Please log in to create a proof.</p>
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <StepTypeSelection
                selectedType={formData.type}
                onSelect={(type) => updateFormData({ type })}
              />
            )}
          {currentStep === 2 && (
            <StepDetails formData={formData} onChange={updateFormData} />
          )}
          {currentStep === 3 && (
            <StepAttachments formData={formData} onChange={updateFormData} />
          )}
          {currentStep === 4 && (
            <StepIntegrations formData={formData} onChange={updateFormData} />
          )}
          {currentStep === 5 && <StepReview formData={formData} />}
          {currentStep === 6 && <StepComplete proofId={proofId ?? 'N/A'} formData={formData} />}
          {error && <p className="text-destructive mt-4">{error}</p>}
        </div>
        )}

        {currentStep < 6 && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Creating..." : currentStep === 5 ? "Generate Proof" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
