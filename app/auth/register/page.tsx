"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    
    // Bug 3 fix: client-side password length check
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Register
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "freelancer" }), // Bug 5 fix: send role
      })

      if (!registerRes.ok) {
        const body = await registerRes.json()
        throw new Error(body?.message || "Registration failed")
      }

      // Bug 1 fix: auto-login after successful registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!loginRes.ok) {
        // Account created but login failed — send to login page with a message
        router.push("/auth/login?registered=true")
        return
      }

      // Bug 2 fix: refresh so the cookie is picked up by server layouts
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
        <h1 className="text-2xl font-semibold mb-4">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Name</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              minLength={8}
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>

          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}