import { cn } from '@/lib/utils'
import { TaskStatus, STATUS_CONFIG } from '@/types'

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}

