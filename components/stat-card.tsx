import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardColor = "default" | "accent" | "success" | "warning" | "danger"

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ElementType
  description?: string
  color?: StatCardColor
}

const colorStyles: Record<StatCardColor, { bg: string; icon: string }> = {
  default:  { bg: "bg-secondary",        icon: "text-foreground" },
  accent:   { bg: "bg-accent/10",        icon: "text-accent" },
  success:  { bg: "bg-green-500/10",     icon: "text-green-600" },
  warning:  { bg: "bg-amber-500/10",     icon: "text-amber-600" },
  danger:   { bg: "bg-destructive/10",   icon: "text-destructive" },
}

export function StatCard({ title, value, icon: Icon, description, color = "default" }: StatCardProps) {
  const styles = colorStyles[color]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", styles.bg)}>
            <Icon className={cn("h-6 w-6", styles.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}