import Link from "next/link"
import { Shield, FileCheck, Clock, AlertTriangle, Mail, Calendar, Building2, Fingerprint, CreditCard, PenTool, CheckCircle2, ArrowRight, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const mockUser = {
  name: "Alex Chen",
  email: "alex@example.com",
  company: "Chen Design Studio",
  joinedAt: "2025-06-15T00:00:00Z",
  stats: {
    totalProofs: 47,
    activeProjects: 3,
    completedProofs: 42,
    disputes: 2,
  },
  recentActivity: [
    { action: "Created proof", title: "Website Redesign Project", timestamp: "2026-03-15T10:30:00Z" },
    { action: "Completed proof", title: "Monthly Retainer - March 2026", timestamp: "2026-03-12T14:45:00Z" },
    { action: "Updated profile", title: "Email address changed", timestamp: "2026-03-10T09:00:00Z" },
    { action: "Resolved dispute", title: "Logo Design Delivery", timestamp: "2026-03-08T16:20:00Z" },
  ],
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  color = "default"
}: { 
  title: string
  value: number
  icon: React.ElementType
  color?: "default" | "accent" | "success" | "warning"
}) {
  const colors = {
    default: "bg-secondary",
    accent: "bg-accent/10",
    success: "bg-green-500/10",
    warning: "bg-amber-500/10",
  }

  const iconColors = {
    default: "text-foreground",
    accent: "text-accent",
    success: "text-green-600",
    warning: "text-amber-600",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconColors[color]}`} />
          </div>
          <div>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your activity</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input defaultValue={mockUser.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input defaultValue={mockUser.email} type="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input defaultValue={mockUser.company} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Member Since</label>
                  <Input value={formatDate(mockUser.joinedAt)} disabled />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard 
              title="Total Proofs" 
              value={mockUser.stats.totalProofs} 
              icon={FileCheck}
              color="accent"
            />
            <StatCard 
              title="Active" 
              value={mockUser.stats.activeProjects} 
              icon={Clock}
              color="default"
            />
            <StatCard 
              title="Completed" 
              value={mockUser.stats.completedProofs} 
              icon={Shield}
              color="success"
            />
            <StatCard 
              title="Disputes" 
              value={mockUser.stats.disputes} 
              icon={AlertTriangle}
              color="warning"
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUser.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <FileCheck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trust Score */}
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold text-accent">92</p>
                <p className="text-sm text-muted-foreground">Excellent Standing</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verified Email</span>
                  <span className="text-sm font-medium text-green-600">Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Age</span>
                  <span className="text-sm font-medium">9 months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dispute Rate</span>
                  <span className="text-sm font-medium">4.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-medium text-green-600">89%</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-accent/20">
                <p className="text-xs text-muted-foreground">
                  Trust score is visible to all parties you interact with.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Identity Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Aadhaar", icon: Fingerprint, verified: true },
                { name: "PAN Card", icon: CreditCard, verified: true },
                { name: "Digital Signature", icon: PenTool, verified: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {item.verified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Not verified</span>
                  )}
                </div>
              ))}
              <Link href="/verification">
                <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                  Manage Verifications <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{mockUser.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{mockUser.company}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Joined {formatDate(mockUser.joinedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
