"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield, CheckCircle2, Clock, AlertCircle, Upload,
  Fingerprint, CreditCard, PenTool, Building2, Camera,
  ArrowRight, X, Eye, Lock, Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type VerificationStatus = "not-started" | "pending" | "verified" | "rejected"

interface VerificationItem {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: VerificationStatus
  verifiedAt?: string
  documentNumber?: string
  required: boolean
  strengthPoints: number
  // Bug fix: track whether this item uses OTP flow or file upload flow
  flow: "otp" | "upload" | "instant"
}

const verificationItems: VerificationItem[] = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    description: "12-digit unique identification number issued by UIDAI",
    icon: Fingerprint,
    status: "verified",
    verifiedAt: "2025-08-15",
    documentNumber: "XXXX XXXX 4523",
    required: true,
    strengthPoints: 30,
    flow: "otp",
  },
  {
    id: "pan",
    name: "PAN Card",
    description: "Permanent Account Number for tax identification",
    icon: CreditCard,
    status: "verified",
    verifiedAt: "2025-08-15",
    documentNumber: "ABCDE1234F",
    required: true,
    strengthPoints: 25,
    flow: "instant", // DigiLocker — no OTP step
  },
  {
    id: "esign",
    name: "Digital Signature (DSC)",
    description: "Class 2 or Class 3 Digital Signature Certificate",
    icon: PenTool,
    status: "pending",
    required: false,
    strengthPoints: 20,
    flow: "upload", // file upload — no OTP step
  },
  {
    id: "gst",
    name: "GST Registration",
    description: "Goods and Services Tax identification number",
    icon: Building2,
    status: "not-started",
    required: false,
    strengthPoints: 15,
    flow: "instant",
  },
  {
    id: "selfie",
    name: "Selfie Verification",
    description: "Live photo verification matching your ID documents",
    icon: Camera,
    status: "verified",
    verifiedAt: "2025-08-15",
    required: true,
    strengthPoints: 10,
    flow: "upload",
  },
]

function StatusBadge({ status }: { status: VerificationStatus }) {
  const config = {
    "not-started": { label: "Not Started", className: "bg-secondary text-muted-foreground border-border", Icon: AlertCircle },
    pending:        { label: "Pending",     className: "bg-amber-500/10 text-amber-700 border-amber-500/20", Icon: Clock },
    verified:       { label: "Verified",    className: "bg-green-500/10 text-green-700 border-green-500/20", Icon: CheckCircle2 },
    rejected:       { label: "Rejected",    className: "bg-destructive/10 text-destructive border-destructive/20", Icon: X },
  }
  const { label, className, Icon } = config[status]

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function StrengthMeter({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = (score / maxScore) * 100
  const level = percentage >= 80 ? "Excellent" : percentage >= 60 ? "Good" : percentage >= 40 ? "Fair" : "Low"
  const color = percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-accent" : percentage >= 40 ? "bg-amber-500" : "bg-destructive"
  const textColor = percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-accent" : percentage >= 40 ? "text-amber-600" : "text-destructive"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Verification Strength</span>
        <span className="text-sm text-muted-foreground">{score}/{maxScore} points</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${percentage}%` }} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={cn("font-medium", textColor)}>{level}</span>
        <span className="text-muted-foreground">
          {percentage >= 80 ? "Maximum legal protection" : percentage >= 60 ? "Strong legal standing" : "Add more verifications"}
        </span>
      </div>
    </div>
  )
}

function VerificationCard({ item, onVerify }: { item: VerificationItem; onVerify: (id: string) => void }) {
  const Icon = item.icon
  return (
    <Card className={cn("transition-all", item.status === "verified" && "border-green-500/30 bg-green-500/5")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              item.status === "verified" ? "bg-green-500/20" : "bg-secondary"
            )}>
              <Icon className={cn("h-6 w-6", item.status === "verified" ? "text-green-600" : "text-muted-foreground")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{item.name}</h3>
                {item.required && (
                  <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">Required</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {item.status === "verified" && (
          <div className="mb-4 p-3 bg-background rounded-lg">
            {item.documentNumber && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Document Number</span>
                <span className="font-mono">{item.documentNumber}</span>
              </div>
            )}
            {item.verifiedAt && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Verified On</span>
                <span>{item.verifiedAt}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>+{item.strengthPoints} strength points</span>
          </div>
          {item.status === "not-started" && (
            <Button size="sm" onClick={() => onVerify(item.id)} className="gap-2">
              Verify Now <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {item.status === "pending" && (
            <span className="text-sm text-amber-600">Verification in progress...</span>
          )}
          {item.status === "rejected" && (
            <Button size="sm" variant="destructive" onClick={() => onVerify(item.id)}>
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerificationPage() {
  const [items, setItems] = useState(verificationItems)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [documentInput, setDocumentInput] = useState("")
  const [otp, setOtp] = useState("")
  // Bug fix: step type now includes all valid values; OTP step only shown for otp-flow items
  const [step, setStep] = useState<"input" | "otp" | "processing" | "success">("input")

  const totalPoints = items.reduce((acc, item) => acc + item.strengthPoints, 0)
  const earnedPoints = items.filter((i) => i.status === "verified").reduce((acc, i) => acc + i.strengthPoints, 0)

  const activeItem = items.find((i) => i.id === activeModal)

  const handleVerify = (id: string) => {
    setActiveModal(id)
    setStep("input")
    setDocumentInput("")
    setOtp("")
  }

  const handleContinue = async () => {
    if (!activeItem) return

    // Bug fix: only go to OTP step for items with otp flow
    if (step === "input" && activeItem.flow === "otp") {
      setStep("otp")
      return
    }

    // For instant and upload flows, go straight to processing
    setStep("processing")
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setItems((prev) =>
      prev.map((item) =>
        item.id === activeModal ? { ...item, status: "pending" as const } : item
      )
    )
    setStep("success")
  }

  const handleOtpSubmit = async () => {
    setStep("processing")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setItems((prev) =>
      prev.map((item) =>
        item.id === activeModal ? { ...item, status: "pending" as const } : item
      )
    )
    setStep("success")
  }

  const closeModal = () => {
    setActiveModal(null)
    setStep("input")
    setDocumentInput("")
    setOtp("")
  }

  const verificationHistory = [
    { date: "2026-03-15", action: "Digital Signature upload", status: "pending" as const },
    { date: "2025-08-15", action: "Selfie verified", status: "success" as const },
    { date: "2025-08-15", action: "PAN verified via DigiLocker", status: "success" as const },
    { date: "2025-08-15", action: "Aadhaar verified via OTP", status: "success" as const },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Identity Verification</h1>
        <p className="text-muted-foreground">Verify your identity to strengthen the legal validity of your proofs</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {items.map((item) => (
              <VerificationCard key={item.id} item={item} onVerify={handleVerify} />
            ))}
          </div>

          {/* Legal Notice */}
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Lock className="h-6 w-6 text-accent shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Legal Validity</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Documents verified through TrustLayer are legally admissible under the Information Technology Act, 2000 and the Indian Evidence Act, 1872.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["IT Act 2000", "Evidence Act 1872", "DigiLocker Compliant"].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-background rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Verification Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StrengthMeter score={earnedPoints} maxScore={totalPoints} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why Verify?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Shield, text: "Legally binding proofs" },
                { icon: Award, text: "Higher trust score" },
                { icon: Lock, text: "Court admissible records" },
                { icon: Eye, text: "Transparent to parties" },
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <benefit.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">{benefit.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationHistory.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      activity.status === "success" ? "bg-green-500" :
                      activity.status === "pending" ? "bg-amber-500" : "bg-destructive"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Modal */}
      {activeModal && activeItem && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Verify {activeItem.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {step === "input" && (
                <div className="space-y-4">
                  {activeItem.flow === "upload" ? (
                    <div className="text-center py-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        {activeItem.id === "esign"
                          ? "Upload your Digital Signature Certificate (.pfx file)"
                          : "Upload a photo or scan of your document"}
                      </p>
                      <Button variant="outline">Select File</Button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {activeItem.id === "aadhaar" ? "Aadhaar Number" :
                         activeItem.id === "pan" ? "PAN Number" :
                         activeItem.id === "gst" ? "GSTIN" : "Document Number"}
                      </label>
                      <Input
                        placeholder={
                          activeItem.id === "aadhaar" ? "XXXX XXXX XXXX" :
                          activeItem.id === "pan" ? "ABCDE1234F" :
                          activeItem.id === "gst" ? "22AAAAA0000A1Z5" : ""
                        }
                        value={documentInput}
                        onChange={(e) => setDocumentInput(e.target.value)}
                      />
                      {activeItem.flow === "otp" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          An OTP will be sent to your Aadhaar-linked mobile number
                        </p>
                      )}
                      {activeItem.flow === "instant" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Verified instantly via DigiLocker
                        </p>
                      )}
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleContinue}
                    disabled={activeItem.flow !== "upload" && !documentInput.trim()}
                  >
                    {/* Bug fix: button label reflects actual next step */}
                    {activeItem.flow === "otp" ? "Send OTP" :
                     activeItem.flow === "upload" ? "Submit" : "Verify"}
                  </Button>
                </div>
              )}

              {/* Bug fix: OTP step only reachable for otp-flow items */}
              {step === "otp" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Enter OTP</label>
                    <Input
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    OTP sent to your Aadhaar-linked mobile number
                  </p>
                  <Button
                    className="w-full"
                    onClick={handleOtpSubmit}
                    disabled={otp.length !== 6}
                  >
                    Verify
                  </Button>
                </div>
              )}

              {step === "processing" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Verifying your document...</p>
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Verification Submitted</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your verification is being processed. This usually takes 1–2 business days.
                  </p>
                  <Button onClick={closeModal}>Done</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}