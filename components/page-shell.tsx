import { cn } from "@/lib/utils"

interface PageShellProps {
  children: React.ReactNode
  className?: string
  narrow?: boolean // max-w-5xl instead of max-w-7xl (for profile-style pages)
}

export function PageShell({ children, className, narrow = false }: PageShellProps) {
  return (
    <div className={cn(
      "p-6 lg:p-10 mx-auto",
      narrow ? "max-w-5xl" : "max-w-7xl",
      className
    )}>
      {children}
    </div>
  )
}