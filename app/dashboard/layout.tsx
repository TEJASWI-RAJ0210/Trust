"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, LayoutDashboard, FilePlus, User, Code2, AlertTriangle, LogOut, Fingerprint } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/create", icon: FilePlus, label: "Create Proof" },
  { href: "/disputes", icon: AlertTriangle, label: "Disputes" },
  { href: "/verification", icon: Fingerprint, label: "ID Verification" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/api-docs", icon: Code2, label: "API" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" />
            <span className="text-xl font-semibold tracking-tight">TrustLayer</span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            <span className="text-lg font-semibold">TrustLayer</span>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
