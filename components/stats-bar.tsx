import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StatsBarProps {
  completed: number
  total: number
  percentage: number
}

export function StatsBar({ completed, total, percentage }: StatsBarProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500">{completed}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{percentage}%</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Progress</div>
        </div>
      </div>

      <div>
        <Progress value={percentage} className="h-2" />
        <div className="text-xs text-muted-foreground text-center mt-2">Overall Progress</div>
      </div>
    </Card>
  )
}
