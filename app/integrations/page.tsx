"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Shield, 
  ArrowLeft, 
  Check, 
  ExternalLink,
  Settings,
  Zap,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  connected: boolean
  autoCapture: string[]
  lastSync?: string
  eventsToday?: number
}

const integrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Auto-capture payment confirmations, subscriptions, and refunds",
    icon: "S",
    connected: true,
    autoCapture: ["Payment receipts", "Subscription changes", "Refunds", "Invoices"],
    lastSync: "2 minutes ago",
    eventsToday: 12,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync contracts, agreements, and document signatures",
    icon: "N",
    connected: true,
    autoCapture: ["Contract signatures", "Document updates", "Page changes", "Database edits"],
    lastSync: "5 minutes ago",
    eventsToday: 8,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Capture important conversations and approvals",
    icon: "S",
    connected: false,
    autoCapture: ["Message threads", "File shares", "Approvals", "Channel mentions"],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Track code deliverables, releases, and pull requests",
    icon: "G",
    connected: false,
    autoCapture: ["Pull requests", "Releases", "Issues closed", "Commits"],
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Sync docs, calendar events, and email threads",
    icon: "G",
    connected: true,
    autoCapture: ["Document edits", "Meeting recordings", "Email threads", "Calendar events"],
    lastSync: "1 minute ago",
    eventsToday: 24,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Design deliverable snapshots and version history",
    icon: "F",
    connected: false,
    autoCapture: ["Version history", "Comments", "Export logs", "Component changes"],
  },
  {
    id: "linear",
    name: "Linear",
    description: "Track project issues and milestone completions",
    icon: "L",
    connected: false,
    autoCapture: ["Issue updates", "Cycle completions", "Project changes"],
  },
  {
    id: "docusign",
    name: "DocuSign",
    description: "Capture signed agreements and contract completions",
    icon: "D",
    connected: false,
    autoCapture: ["Signed documents", "Envelope status", "Recipient actions"],
  },
]

function IntegrationCard({ 
  integration,
  onToggle 
}: { 
  integration: Integration
  onToggle: (id: string) => void
}) {
  return (
    <Card className={cn(
      "transition-all",
      integration.connected ? "border-accent/20" : "border-border"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold",
              integration.connected 
                ? "bg-accent/10 text-accent" 
                : "bg-secondary text-muted-foreground"
            )}>
              {integration.icon}
            </div>
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          <Button
            variant={integration.connected ? "outline" : "default"}
            size="sm"
            onClick={() => onToggle(integration.id)}
          >
            {integration.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        {integration.connected && (
          <>
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Connected</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Last sync: {integration.lastSync}</span>
              </div>
              {integration.eventsToday !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{integration.eventsToday} events today</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Auto-capturing:</p>
              <div className="flex flex-wrap gap-2">
                {integration.autoCapture.map((item, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs px-2 py-1 bg-secondary rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {!integration.connected && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Will capture:</p>
            <div className="flex flex-wrap gap-2">
              {integration.autoCapture.slice(0, 3).map((item, idx) => (
                <span 
                  key={idx} 
                  className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground"
                >
                  {item}
                </span>
              ))}
              {integration.autoCapture.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{integration.autoCapture.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function IntegrationsPage() {
  const [integrationsState, setIntegrationsState] = useState(integrations)

  const handleToggle = (id: string) => {
    setIntegrationsState(prev => 
      prev.map(i => 
        i.id === id 
          ? { 
              ...i, 
              connected: !i.connected,
              lastSync: !i.connected ? "Just now" : undefined,
              eventsToday: !i.connected ? 0 : undefined
            } 
          : i
      )
    )
  }

  const connectedCount = integrationsState.filter(i => i.connected).length
  const totalEvents = integrationsState.reduce((sum, i) => sum + (i.eventsToday || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
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
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your tools to automatically capture proof from your daily workflow
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{connectedCount}</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Zap className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Events Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Clock className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">Real-time</p>
                  <p className="text-sm text-muted-foreground">Sync Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Auto-Capture Toggle */}
        <Card className="mb-10 border-accent/20 bg-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Global Auto-Capture</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically add events from connected integrations to your active proofs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Configure Rules
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Integrations */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Connected Integrations
          </h2>
          <div className="space-y-4">
            {integrationsState.filter(i => i.connected).map((integration) => (
              <IntegrationCard 
                key={integration.id} 
                integration={integration}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </section>

        {/* Available Integrations */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Available Integrations
          </h2>
          <div className="space-y-4">
            {integrationsState.filter(i => !i.connected).map((integration) => (
              <IntegrationCard 
                key={integration.id} 
                integration={integration}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </section>

        {/* Request Integration */}
        <Card className="mt-10 border-dashed">
          <CardContent className="p-6 text-center">
            <h3 className="font-medium mb-2">Need a different integration?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We are constantly adding new integrations. Let us know what you need.
            </p>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Request Integration
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
