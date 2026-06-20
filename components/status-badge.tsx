import { AlertTriangle, Clock, CheckCircle2, Shield, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// All possible statuses across the whole app
export type ProofStatus = "active" | "delivered" | "disputed"
export type DisputeStatus = "pending" | "in-review" | "resolved" | "open"
export type AnyStatus = ProofStatus | DisputeStatus

interface StatusBadgeProps {
  status: AnyStatus
  className?: string
}

const statusConfig: Record<AnyStatus, {
  label: string
  styles: string
  icon?: React.ElementType
}> = {
  // Proof statuses
  active: {
    label: "Active",
    styles: "bg-accent/10 text-accent border-accent/20",
    icon: Zap,
  },
  delivered: {
    label: "Delivered",
    styles: "bg-green-500/10 text-green-700 border-green-500/20",
    icon: Shield,
  },
  disputed: {
    label: "Disputed",
    styles: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertTriangle,
  },
  // Dispute statuses
  open: {
    label: "Open",
    styles: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    icon: AlertTriangle,
  },
  pending: {
    label: "Pending",
    styles: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    icon: AlertTriangle,
  },
  "in-review": {
    label: "In Review",
    styles: "bg-accent/10 text-accent border-accent/20",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    styles: "bg-green-500/10 text-green-700 border-green-500/20",
    icon: CheckCircle2,
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.styles,
      className
    )}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </span>
  )
}