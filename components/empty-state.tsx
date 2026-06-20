import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  message: string
  icon?: React.ElementType
  className?: string
}

interface ErrorStateProps {
  message: string
  className?: string
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function EmptyState({ message, icon: Icon, className }: EmptyStateProps) {
  return (
    <Card className={cn("text-center py-16", className)}>
      <CardContent className="flex flex-col items-center gap-3">
        {Icon && <Icon className="h-10 w-10 text-muted-foreground/50" />}
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

export function ErrorState({ message, className }: ErrorStateProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm",
      className
    )}>
      {message}
    </div>
  )
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center py-16 text-sm text-muted-foreground", className)}>
      {message}
    </div>
  )
}