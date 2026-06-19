import Link from "next/link"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold mb-4">Account</h1>
        <p className="text-sm text-muted-foreground mb-6">Please choose an action.</p>
        <div className="flex gap-3">
          <Link href="/auth/login" className="w-full text-center rounded-md border border-border px-4 py-2 hover:bg-muted">
            Login
          </Link>
          <Link href="/auth/register" className="w-full text-center rounded-md border border-border px-4 py-2 hover:bg-muted">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
