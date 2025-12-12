import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { assignTask, getUsersByRole } from '@/services/api'
import { useUserStore } from '@/store/use-user-store'
import { useUIStore } from '@/store/use-ui-store'
import { UserRole } from '@/types'
import type { Task } from '@/types'

interface TaskAssignerProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskAssigner({ task, open, onOpenChange }: TaskAssignerProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  const { addToast } = useUIStore()

  const { data: transcribers, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', UserRole.Transcriber],
    queryFn: async () => {
      const response = await getUsersByRole(UserRole.Transcriber)
      return response.data || []
    },
    enabled: open,
  })

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!task || !selectedUserId || !user) {
        throw new Error('Missing required data')
      }
      const response = await assignTask(task.id, selectedUserId, user.id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to assign task')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      addToast({
        title: 'Task assigned',
        description: 'The task has been assigned successfully',
        variant: 'success',
      })
      onOpenChange(false)
      setSelectedUserId('')
    },
    onError: (error: Error) => {
      addToast({
        title: 'Assignment failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Task
          </DialogTitle>
          <DialogDescription>
            Select a transcriber to assign this task to. They will be notified
            and can start working on it immediately.
          </DialogDescription>
        </DialogHeader>

        {task && (
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm font-medium">Task #{task.id.slice(-8)}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {task.noisyText.slice(0, 100)}...
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="transcriber">Assign to</Label>
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            disabled={loadingUsers}
          >
            <SelectTrigger id="transcriber">
              <SelectValue placeholder="Select a transcriber..." />
            </SelectTrigger>
            <SelectContent>
              {transcribers?.map((transcriber) => (
                <SelectItem key={transcriber.id} value={transcriber.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={transcriber.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(transcriber.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{transcriber.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => assignMutation.mutate()}
            disabled={!selectedUserId || assignMutation.isPending}
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

