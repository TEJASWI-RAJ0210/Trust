"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get("registered") === "true"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")           // clear before submit, not during
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body?.message || "Login failed")
      }

      // Bug 2 fix: refresh server state so cookie is picked up by layouts
      router.refresh()
      router.push("/dashboard")
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        {/* Bug 1 fix: show success message if redirected after registration */}
        {justRegistered && (
          <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md px-3 py-2 mb-2">
            Account created! Please log in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>

          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">Register</Link>
          </div>
        </form>
      </div>
    </div>
  )
}