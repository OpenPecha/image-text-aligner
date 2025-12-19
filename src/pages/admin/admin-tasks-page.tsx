import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskList } from '@/features/dashboard'
import { TaskAssigner, PipelineOverview } from '@/features/admin/components'
import { getTasks } from '@/services/api'
import { TaskStatus, STATUS_CONFIG } from '@/types'
import type { Task } from '@/types'

export function AdminTasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignTask, setAssignTask] = useState<Task | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'admin', statusFilter],
    queryFn: async () => {
      const filter = statusFilter !== 'all' 
        ? { status: [statusFilter as TaskStatus] }
        : undefined
      const response = await getTasks(filter)
      return response.data || []
    },
  })

  const handleAssignClick = (task: Task) => {
    setAssignTask(task)
    setAssignDialogOpen(true)
  }

  const pendingTasks = tasks?.filter(t => t.status === TaskStatus.Pending) || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            All Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all tasks in the pipeline
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Pipeline Overview */}
      <PipelineOverview />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pending Tasks that need assignment */}
      {statusFilter === 'all' && pendingTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-warning">
            Pending Assignment ({pendingTasks.length})
          </h2>
          <TaskList
            tasks={pendingTasks}
            isLoading={isLoading}
            actionLabel="Assign"
            onAction={handleAssignClick}
          />
        </div>
      )}

      {/* All Tasks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {statusFilter === 'all' ? 'All Tasks' : STATUS_CONFIG[statusFilter as TaskStatus]?.label}
          {tasks && ` (${tasks.length})`}
        </h2>
        <TaskList
          tasks={statusFilter === 'all' 
            ? tasks?.filter(t => t.status !== TaskStatus.Pending) || []
            : tasks || []
          }
          isLoading={isLoading}
          emptyMessage="No tasks found with the selected filter."
          actionLabel={statusFilter === TaskStatus.Pending ? 'Assign' : 'View'}
          onAction={statusFilter === TaskStatus.Pending ? handleAssignClick : undefined}
        />
      </div>

      {/* Task Assigner Dialog */}
      <TaskAssigner
        task={assignTask}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </div>
  )
}

