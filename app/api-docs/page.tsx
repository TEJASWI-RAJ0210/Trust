import Link from "next/link"
import { Shield, Copy, Key, Webhook, Code2, ExternalLink, ArrowRight, Eye, EyeOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const codeExamples = {
  createProof: `// Create a new proof record
const response = await fetch('https://api.trustlayer.app/v1/proofs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'freelance',
    title: 'Website Redesign Project',
    description: 'Complete website redesign with 3 pages',
    parties: [
      { name: 'Alex Chen', email: 'alex@example.com', role: 'provider' },
      { name: 'Acme Corp', email: 'contact@acme.com', role: 'client' }
    ]
  })
});

const proof = await response.json();
console.log(proof.id); // TL-M3X7K9P`,

  getProof: `// Retrieve a proof record
const response = await fetch('https://api.trustlayer.app/v1/proofs/TL-M3X7K9P', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const proof = await response.json();`,

  webhook: `// Webhook payload example
{
  "event": "proof.completed",
  "timestamp": "2026-03-15T14:30:00Z",
  "data": {
    "proof_id": "TL-M3X7K9P",
    "title": "Website Redesign Project",
    "status": "delivered",
    "parties": ["alex@example.com", "contact@acme.com"]
  }
}`,
}

const endpoints = [
  { method: "POST", path: "/v1/proofs", description: "Create a new proof record" },
  { method: "GET", path: "/v1/proofs/:id", description: "Retrieve a specific proof" },
  { method: "GET", path: "/v1/proofs", description: "List all proofs for your account" },
  { method: "PATCH", path: "/v1/proofs/:id", description: "Update a proof record" },
  { method: "POST", path: "/v1/proofs/:id/complete", description: "Mark a proof as complete" },
  { method: "POST", path: "/v1/proofs/:id/dispute", description: "File a dispute" },
  { method: "GET", path: "/v1/disputes", description: "List all disputes" },
  { method: "POST", path: "/v1/webhooks", description: "Create a webhook endpoint" },
]

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-700 border-green-500/20",
    POST: "bg-accent/10 text-accent border-accent/20",
    PATCH: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    DELETE: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  )
}

function CodeBlock({ code, title }: { code: string; title: string }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
        <span className="text-sm font-medium">{title}</span>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-card">
        <code className="text-muted-foreground">{code}</code>
      </pre>
    </div>
  )
}

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" />
            <span className="text-xl font-semibold tracking-tight">TrustLayer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Button size="sm">Get API Key</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <Code2 className="h-4 w-4" />
            Developer API
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Integrate TrustLayer into Your Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build trust into your applications with our simple REST API. Create tamper-proof records, manage disputes, and verify transactions programmatically.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Start */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Quick Start</h2>
              <div className="space-y-6">
                <CodeBlock title="Create a Proof" code={codeExamples.createProof} />
                <CodeBlock title="Retrieve a Proof" code={codeExamples.getProof} />
              </div>
            </section>

            {/* Endpoints */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">API Endpoints</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
                        <MethodBadge method={endpoint.method} />
                        <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                        <span className="text-sm text-muted-foreground hidden sm:block">{endpoint.description}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Webhooks */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Webhooks</h2>
              <p className="text-muted-foreground mb-4">
                Receive real-time notifications when events occur on your proofs. Configure webhook endpoints to stay in sync.
              </p>
              <CodeBlock title="Webhook Payload" code={codeExamples.webhook} />
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <h4 className="font-medium mb-2">Available Events</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="text-foreground">proof.created</code> - New proof record created</li>
                  <li><code className="text-foreground">proof.updated</code> - Proof record updated</li>
                  <li><code className="text-foreground">proof.completed</code> - Proof marked as complete</li>
                  <li><code className="text-foreground">dispute.filed</code> - Dispute filed on a proof</li>
                  <li><code className="text-foreground">dispute.resolved</code> - Dispute resolved</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Production Key</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input 
                        type="password" 
                        value="tl_live_xxxxxxxxxxxxxxxxxxxxx" 
                        readOnly 
                        className="font-mono text-sm pr-10"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Test Key</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input 
                        type="password" 
                        value="tl_test_xxxxxxxxxxxxxxxxxxxxx" 
                        readOnly 
                        className="font-mono text-sm pr-10"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <EyeOff className="h-4 w-4" />
                      </button>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Keys
                </Button>
              </CardContent>
            </Card>

            {/* Webhooks Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium mb-1">Production</p>
                  <code className="text-xs text-muted-foreground break-all">https://your-app.com/webhooks/trustlayer</code>
                </div>
                <Button variant="outline" className="w-full">
                  Add Endpoint
                </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <span className="text-sm font-medium">Full API Reference</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <span className="text-sm font-medium">SDK Libraries</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <span className="text-sm font-medium">Postman Collection</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
