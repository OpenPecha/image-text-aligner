import { useQuery } from '@tanstack/react-query'
import { FileText, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from '@/features/dashboard'
import { getTasksForAnnotator } from '@/services/api'
import { useAuth } from '@/features/auth'
import { TaskStatus } from '@/types'

export function AnnotatorTasksPage() {
  const { currentUser } = useAuth()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'annotator', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return []
      const response = await getTasksForAnnotator(currentUser.id)
      return response.data || []
    },
    enabled: !!currentUser,
  })

  const inProgressTasks = tasks?.filter(t => t.status === TaskStatus.InProgress) || []
  const rejectedTasks = tasks?.filter(t => t.status === TaskStatus.Rejected) || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8" />
          My Tasks
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your assigned annotation tasks
        </p>
      </div>

      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in-progress" className="gap-2">
            In Progress
            {inProgressTasks.length > 0 && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                {inProgressTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Needs Rework
            {rejectedTasks.length > 0 && (
              <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">
                {rejectedTasks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress">
          <TaskList
            tasks={inProgressTasks}
            isLoading={isLoading}
            emptyMessage="No tasks in progress. Check with your admin for new assignments."
            actionLabel="Continue"
          />
        </TabsContent>

        <TabsContent value="rejected">
          <TaskList
            tasks={rejectedTasks}
            isLoading={isLoading}
            emptyMessage="No rejected tasks. Great work!"
            actionLabel="Fix Issues"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

