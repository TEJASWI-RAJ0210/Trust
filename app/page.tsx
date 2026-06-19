import Link from "next/link"
import { Shield, FileCheck, Clock, Link2, ArrowRight, CheckCircle2, Users, Building2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-accent" />
          <span className="text-xl font-semibold tracking-tight">TrustLayer</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </Link>
          <Link href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Use Cases
          </Link>
          <Link href="/api-docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            API
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/create">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
          <Shield className="h-4 w-4" />
          Trusted by 10,000+ professionals
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-balance leading-tight mb-6">
          Capture Proof.<br />
          <span className="text-muted-foreground">Prevent Disputes.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
          Automatically generate tamper-proof records for every transaction. 
          Protect yourself in freelancing, payments, and agreements with immutable timestamps.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/create">
            <Button size="lg" className="gap-2 px-8">
              Create Proof <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button variant="outline" size="lg" className="px-8">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function TimelineVisual() {
  const steps = [
    { icon: FileCheck, label: "Agreement", description: "Define terms" },
    { icon: Clock, label: "Work", description: "Track progress" },
    { icon: Shield, label: "Proof", description: "Generate record" },
    { icon: CheckCircle2, label: "Resolved", description: "Stay protected" },
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.label} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">{step.label}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[2px] bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create an Agreement",
      description: "Define your terms, upload relevant documents, and set clear deliverables. TrustLayer captures everything with precision.",
    },
    {
      number: "02",
      title: "Track Your Progress",
      description: "Every action is recorded with immutable timestamps. Deliveries, messages, and file transfers are all logged automatically.",
    },
    {
      number: "03",
      title: "Generate Proof",
      description: "When the project completes, receive a tamper-proof proof record that serves as undeniable evidence if disputes arise.",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps to protect every transaction
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-card rounded-xl border border-border p-8 hover:shadow-md transition-shadow">
              <span className="text-4xl font-semibold text-accent/30 mb-4 block">{step.number}</span>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  const useCases = [
    {
      icon: Users,
      title: "Freelancers",
      description: "Protect yourself from scope creep and payment disputes. Every deliverable is timestamped and verified.",
    },
    {
      icon: Building2,
      title: "Rentals & Leases",
      description: "Document property conditions, agreements, and transactions with indisputable proof.",
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Create verifiable records for every payment milestone. Never argue about what was paid and when.",
    },
  ]

  return (
    <section id="use-cases" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Built For</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Wherever trust matters, TrustLayer protects
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="group p-8 rounded-xl border border-border bg-card hover:border-accent/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <useCase.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustIndicators() {
  const indicators = [
    { icon: Shield, label: "Tamper-Proof", description: "Records cannot be altered" },
    { icon: Clock, label: "Timestamped", description: "Precise moment captured" },
    { icon: Link2, label: "Shareable", description: "One link for verification" },
    { icon: FileCheck, label: "Legally Sound", description: "Court-admissible proof" },
  ]

  return (
    <section className="py-24 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Why Trust Us</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Enterprise-grade security for everyone
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {indicators.map((indicator) => (
            <div key={indicator.label} className="text-center p-6">
              <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
                <indicator.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">{indicator.label}</h3>
              <p className="text-sm text-muted-foreground">{indicator.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
          Ready to protect your transactions?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Start creating tamper-proof records today. No credit card required.
        </p>
        <Link href="/create">
          <Button size="lg" className="gap-2 px-8">
            Create Your First Proof <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <span className="font-semibold">TrustLayer</span>
        </div>
        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/api-docs" className="hover:text-foreground transition-colors">API</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TrustLayer. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TimelineVisual />
        <HowItWorksSection />
        <UseCasesSection />
        <TrustIndicators />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
