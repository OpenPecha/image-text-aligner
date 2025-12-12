import { useQuery } from '@tanstack/react-query'
import { StatsOverview, TaskList } from '@/features/dashboard'
import { getTasks } from '@/services/api'
import { useUserStore } from '@/store/use-user-store'
import { UserRole, TaskStatus, ROLE_CONFIG } from '@/types'

export function DashboardPage() {
  const { user } = useUserStore()

  const { data: recentTasks, isLoading } = useQuery({
    queryKey: ['tasks', 'recent'],
    queryFn: async () => {
      const response = await getTasks()
      return response.data?.slice(0, 8) || []
    },
  })

  if (!user) return null

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ROLE_CONFIG[user.role].description}
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Quick Actions based on role */}
      {user.role === UserRole.Transcriber && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Active Tasks</h2>
          <TaskList
            tasks={recentTasks?.filter(t => 
              t.assignedTo === user.id && 
              (t.status === TaskStatus.InProgress || t.status === TaskStatus.Rejected)
            ) || []}
            isLoading={isLoading}
            emptyMessage="No active tasks. Check with your admin for new assignments."
            actionLabel="Continue"
          />
        </div>
      )}

      {user.role === UserRole.Reviewer && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tasks Awaiting Review</h2>
          <TaskList
            tasks={recentTasks?.filter(t => 
              t.status === TaskStatus.AwaitingReview || 
              (t.status === TaskStatus.InReview && t.reviewerId === user.id)
            ) || []}
            isLoading={isLoading}
            emptyMessage="No tasks awaiting review."
            actionLabel="Review"
          />
        </div>
      )}

      {user.role === UserRole.FinalReviewer && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tasks Awaiting Final Review</h2>
          <TaskList
            tasks={recentTasks?.filter(t => 
              t.status === TaskStatus.AwaitingFinalReview || 
              (t.status === TaskStatus.FinalReview && t.finalReviewerId === user.id)
            ) || []}
            isLoading={isLoading}
            emptyMessage="No tasks awaiting final review."
            actionLabel="Final Review"
          />
        </div>
      )}

      {user.role === UserRole.Admin && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <TaskList
            tasks={recentTasks || []}
            isLoading={isLoading}
            emptyMessage="No tasks in the system yet."
            actionLabel="View"
          />
        </div>
      )}
    </div>
  )
}

