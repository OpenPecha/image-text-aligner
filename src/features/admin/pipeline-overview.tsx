import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getDashboardStats } from '@/services/api'
import { cn } from '@/lib/utils'

interface PipelineStageProps {
  label: string
  count: number
  color: string
  isLast?: boolean
}

function PipelineStage({ label, count, color, isLast }: PipelineStageProps) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold',
            color
          )}
        >
          {count}
        </div>
        <p className="mt-2 text-sm font-medium text-center">{label}</p>
      </div>
      {!isLast && (
        <ArrowRight className="mx-4 h-6 w-6 text-muted-foreground" />
      )}
    </div>
  )
}

export function PipelineOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await getDashboardStats()
      return response.data
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="mt-2 h-4 w-16" />
                </div>
                {i < 4 && <Skeleton className="mx-4 h-6 w-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const stages = [
    { label: 'Pending', count: stats.pending, color: 'bg-muted text-muted-foreground' },
    { label: 'In Progress', count: stats.inProgress, color: 'bg-primary/20 text-primary' },
    { label: 'In Review', count: stats.awaitingReview, color: 'bg-warning/20 text-warning' },
    { label: 'Rejected', count: stats.rejected, color: 'bg-destructive/20 text-destructive' },
    { label: 'Completed', count: stats.completed, color: 'bg-success/20 text-success' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center flex-wrap gap-y-4">
          {stages.map((stage, index) => (
            <PipelineStage
              key={stage.label}
              {...stage}
              isLast={index === stages.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

