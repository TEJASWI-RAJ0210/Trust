"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, ArrowRight, ArrowLeft, FileCheck, Clock, Lock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const onboardingSteps = [
  {
    id: 1,
    title: "What is Proof?",
    subtitle: "Understanding tamper-proof records",
    icon: FileCheck,
    content: {
      heading: "Digital Evidence That Can't Be Changed",
      description: "A proof record is a timestamped, immutable document that captures the details of any agreement, transaction, or delivery. Once created, it cannot be altered by anyone — including us.",
      features: [
        "Every action is recorded with a precise timestamp",
        "All parties can access and verify the same record",
        "Documents and files are securely attached",
        "Changes are tracked in an unalterable timeline",
      ],
    },
  },
  {
    id: 2,
    title: "Why It Matters",
    subtitle: "Protection when you need it most",
    icon: Lock,
    content: {
      heading: "Disputes Happen. Be Prepared.",
      description: "Whether you're a freelancer, landlord, or business owner, disagreements about 'what was agreed' can cost you time, money, and relationships. TrustLayer gives you undeniable proof.",
      features: [
        "Freelancers: Prove deliverables matched specifications",
        "Payments: Verify transactions with timestamps",
        "Agreements: Document terms before they're forgotten",
        "Rentals: Record property conditions and agreements",
      ],
    },
  },
  {
    id: 3,
    title: "How It Protects You",
    subtitle: "Your safety net for every transaction",
    icon: Shield,
    content: {
      heading: "Simple Process. Powerful Protection.",
      description: "Creating proof takes minutes but provides protection that lasts forever. Here's how TrustLayer keeps you safe:",
      features: [
        "Create: Define your agreement and add parties",
        "Document: Upload files, add links, note terms",
        "Timestamp: Every action is permanently recorded",
        "Resolve: If disputes arise, the proof speaks for itself",
      ],
    },
  },
]

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all",
            i + 1 === currentStep ? "w-8 bg-accent" : "w-2 bg-border",
            i + 1 < currentStep && "bg-accent"
          )}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const step = onboardingSteps[currentStep - 1]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" />
            <span className="text-xl font-semibold tracking-tight">TrustLayer</span>
          </Link>
          <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Skip intro
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Step Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Icon className="h-8 w-8 text-accent" />
            </div>
            <p className="text-sm text-accent font-medium mb-2">{step.subtitle}</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{step.title}</h1>
          </div>

          {/* Content */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">{step.content.heading}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{step.content.description}</p>
            <ul className="space-y-3">
              {step.content.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <StepIndicator currentStep={currentStep} totalSteps={onboardingSteps.length} />

            {currentStep < onboardingSteps.length ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/create">
                <Button className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Takes less than 2 minutes to create your first proof</span>
        </div>
      </footer>
    </div>
  )
}
