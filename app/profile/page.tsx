"use client" // Bug fix: was a server component, needs hooks for real data

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield, FileCheck, Clock, AlertTriangle, Mail, Calendar,
  Fingerprint, CreditCard, PenTool, CheckCircle2, ArrowRight, Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface UserProfile {
  id: string
  email: string
  name: string | null
  phone: string | null
  country: string | null
  role: string
  emailVerified: boolean
  createdAt: string
  _count: {
    proofs: number
    disputes: number
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  })
}

// Derived from real data — total proofs and their statuses come from /api/proofs
function computeTrustScore(user: UserProfile, disputeRate: number): number {
  let score = 60
  if (user.emailVerified) score += 15
  if (user._count.proofs > 5) score += 10
  if (user._count.proofs > 20) score += 5
  if (disputeRate < 10) score += 10
  const ageMonths = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (ageMonths > 3) score += 5
  if (ageMonths > 12) score += 5
  return Math.min(score, 100)
}

function StatCard({
  title, value, icon: Icon,
  color = "default",
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
  const router = useRouter()

  // Bug fix: real user data instead of mockUser
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")

  // Real proof stats
  const [activeProofs, setActiveProofs] = useState(0)
  const [completedProofs, setCompletedProofs] = useState(0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Load user from auth cookie
        const meRes = await fetch("/api/auth/me")
        if (!meRes.ok) {
          router.push("/auth/login")
          return
        }
        const me = await meRes.json()

        // Load full profile with counts
        const profileRes = await fetch(`/api/users/${me.id}`)
        if (!profileRes.ok) throw new Error("Failed to load profile")
        const profile: UserProfile = await profileRes.json()

        setUser(profile)
        setName(profile.name ?? "")
        setEmail(profile.email)
        setPhone(profile.phone ?? "")
        setCountry(profile.country ?? "")

        // Load real proof stats
        const proofsRes = await fetch("/api/proofs")
        if (proofsRes.ok) {
          const proofs = await proofsRes.json()
          setActiveProofs(proofs.filter((p: any) => p.status === "active").length)
          setCompletedProofs(proofs.filter((p: any) => p.status === "delivered").length)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Bug fix: Save Changes now actually calls the API
  const handleSave = async () => {
    if (!user) return
    setSaveLoading(true)
    setSaveSuccess(false)
    setError(null)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, country }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.message || "Failed to save")
      }
      const updated: UserProfile = await res.json()
      setUser(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaveLoading(false)
    }
  }

  // Bug fix: Delete Account now actually calls the API
  const handleDelete = async () => {
    if (!user) return
    const confirmed = window.confirm(
      "Are you sure? This will permanently delete your account and all your proof records. This cannot be undone."
    )
    if (!confirmed) return

    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete account")
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          Loading profile...
        </div>
      </div>
    )
  }

  if (!user) return null

  const disputeRate = user._count.proofs > 0
    ? Math.round((user._count.disputes / user._count.proofs) * 100)
    : 0
  const trustScore = computeTrustScore(user, disputeRate)
  const accountAgeMonths = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  const completionRate = user._count.proofs > 0
    ? Math.round((completedProofs / user._count.proofs) * 100)
    : 0

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your activity</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  {/* Bug fix: controlled inputs bound to state */}
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                  {!user.emailVerified && (
                    <p className="text-xs text-amber-600 mt-1">Email not verified</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  {/* Bug fix: company → phone (company doesn't exist in schema) */}
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Input value={user.role} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Member Since</label>
                  <Input value={formatDate(user.createdAt)} disabled />
                </div>
              </div>

              {saveSuccess && (
                <p className="text-sm text-green-600">Profile saved successfully.</p>
              )}

              <div className="pt-4 flex justify-end">
                {/* Bug fix: onClick handler actually saves */}
                <Button onClick={handleSave} disabled={saveLoading}>
                  {saveLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real stats from API */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Total Proofs" value={user._count.proofs} icon={FileCheck} color="accent" />
            <StatCard title="Active" value={activeProofs} icon={Clock} color="default" />
            <StatCard title="Completed" value={completedProofs} icon={Shield} color="success" />
            <StatCard title="Disputes" value={user._count.disputes} icon={AlertTriangle} color="warning" />
          </div>

          {/* Recent Activity — placeholder until an activity log endpoint exists */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <FileCheck className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Activity log coming soon.{" "}
                  <Link href="/dashboard" className="text-accent hover:underline">
                    View your proofs
                  </Link>{" "}
                  in the meantime.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Trust Score — computed from real data */}
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold text-accent">{trustScore}</p>
                <p className="text-sm text-muted-foreground">
                  {trustScore >= 80 ? "Excellent Standing" : trustScore >= 60 ? "Good Standing" : "Building Trust"}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verified Email</span>
                  <span className={`text-sm font-medium ${user.emailVerified ? "text-green-600" : "text-amber-600"}`}>
                    {user.emailVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Age</span>
                  <span className="text-sm font-medium">
                    {accountAgeMonths < 1 ? "New" : `${accountAgeMonths} month${accountAgeMonths !== 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dispute Rate</span>
                  <span className="text-sm font-medium">{disputeRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className={`text-sm font-medium ${completionRate >= 80 ? "text-green-600" : ""}`}>
                    {completionRate}%
                  </span>
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
                { name: "Aadhaar", icon: Fingerprint, verified: false },
                { name: "PAN Card", icon: CreditCard, verified: false },
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

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
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
              {/* Bug fix: onClick handler actually deletes */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}