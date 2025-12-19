import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Shield, Clock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from '@/features/dashboard'
import { getTasksForFinalReviewer, claimForFinalReview } from '@/services/api'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/store/use-ui-store'
import { TaskStatus } from '@/types'
import type { Task } from '@/types'

export function FinalReviewerQueuePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()
  const { addToast } = useUIStore()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'final-reviewer', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return []
      const response = await getTasksForFinalReviewer(currentUser.id)
      return response.data || []
    },
    enabled: !!currentUser,
  })

  const claimMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!currentUser) throw new Error('Not authenticated')
      const response = await claimForFinalReview(taskId, currentUser.id)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      addToast({ title: 'Task claimed for final review', variant: 'success' })
      if (task) {
        navigate(`/editor/${task.id}`)
      }
    },
    onError: (error: Error) => {
      addToast({ title: 'Failed to claim task', description: error.message, variant: 'destructive' })
    },
  })

  const awaitingTasks = tasks?.filter(t => t.status === TaskStatus.AwaitingFinalReview) || []
  const myReviewTasks = tasks?.filter(t => 
    t.status === TaskStatus.FinalReview && t.finalReviewerId === currentUser?.id
  ) || []

  const handleClaimAndOpen = (task: Task) => {
    if (task.status === TaskStatus.AwaitingFinalReview) {
      claimMutation.mutate(task.id)
    } else {
      navigate(`/editor/${task.id}`)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Final Review
        </h1>
        <p className="text-muted-foreground mt-1">
          Perform final quality check for gold standard approval
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available" className="gap-2">
            <Clock className="h-4 w-4" />
            Available
            {awaitingTasks.length > 0 && (
              <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
                {awaitingTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-reviews" className="gap-2">
            My Final Reviews
            {myReviewTasks.length > 0 && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                {myReviewTasks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <TaskList
            tasks={awaitingTasks}
            isLoading={isLoading}
            emptyMessage="No tasks awaiting final review."
            actionLabel="Claim & Review"
            onAction={handleClaimAndOpen}
          />
        </TabsContent>

        <TabsContent value="my-reviews">
          <TaskList
            tasks={myReviewTasks}
            isLoading={isLoading}
            emptyMessage="No tasks in your final review queue."
            actionLabel="Continue Review"
            onAction={handleClaimAndOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
