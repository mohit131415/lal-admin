import { cn } from "@/lib/utils"

export function LogItem({ action, time, type = 'info' }) {
  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-primary'
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", dotColors[type])} />
        <span className="text-sm text-foreground">{action}</span>
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  )
}

