import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { GripHorizontal } from 'lucide-react'
import { ImageCanvas } from './image-canvas'
import { TextPanel } from './text-panel'
import { FooterActions } from './footer-actions'
import { RejectionDialog } from './rejection-dialog'
import { useWorkspace } from './use-workspace'
import { StatusBadge } from '@/components/common/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  saveTaskProgress,
  submitTask,
  approveTask,
  rejectTask,
  finalApproveTask,
  claimForReview,
  claimForFinalReview,
} from '@/services/api'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/store/use-ui-store'
import { TaskStatus, UserRole } from '@/types'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

interface WorkspaceViewProps {
  task: Task | null
  isLoading?: boolean
}

export function WorkspaceView({ task, isLoading }: WorkspaceViewProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()
  const { addToast } = useUIStore()
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { text, setText, splitPosition, setSplitPosition, unsavedChanges } = useWorkspace({
    initialText: task?.correctedText || '',
  })

  // Determine if user can edit based on role and task status
  const canEdit = currentUser && task && (
    (currentUser.role === UserRole.Annotator && 
      (task.status === TaskStatus.InProgress || task.status === TaskStatus.Rejected) &&
      task.assignedTo === currentUser.id) ||
    (currentUser.role === UserRole.Admin)
  )

  const isReviewer = currentUser?.role === UserRole.Reviewer
  const isFinalReviewer = currentUser?.role === UserRole.FinalReviewer

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!task || !currentUser) throw new Error('Missing data')
      const response = await saveTaskProgress(task.id, text, currentUser.id)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task?.id] })
      addToast({ title: 'Progress saved', variant: 'success' })
    },
    onError: (error: Error) => {
      addToast({ title: 'Save failed', description: error.message, variant: 'destructive' })
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!task || !currentUser) throw new Error('Missing data')
      const response = await submitTask(task.id, text, currentUser.id)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      addToast({ title: 'Task submitted', description: 'Your work has been submitted for review', variant: 'success' })
      navigate('/tasks')
    },
    onError: (error: Error) => {
      addToast({ title: 'Submit failed', description: error.message, variant: 'destructive' })
    },
  })

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!task || !currentUser) throw new Error('Missing data')
      if (isReviewer) {
        const response = await claimForReview(task.id, currentUser.id)
        if (!response.success) throw new Error(response.error)
        return response.data
      } else if (isFinalReviewer) {
        const response = await claimForFinalReview(task.id, currentUser.id)
        if (!response.success) throw new Error(response.error)
        return response.data
      }
      throw new Error('Invalid role for claiming')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task?.id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      addToast({ title: 'Task claimed', description: 'You can now review this task', variant: 'success' })
    },
    onError: (error: Error) => {
      addToast({ title: 'Claim failed', description: error.message, variant: 'destructive' })
    },
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!task || !currentUser) throw new Error('Missing data')
      if (task.status === TaskStatus.InReview) {
        const response = await approveTask(task.id, currentUser.id)
        if (!response.success) throw new Error(response.error)
        return response.data
      } else if (task.status === TaskStatus.FinalReview) {
        const response = await finalApproveTask(task.id, currentUser.id)
        if (!response.success) throw new Error(response.error)
        return response.data
      }
      throw new Error('Invalid status for approval')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      addToast({ title: 'Task approved', variant: 'success' })
      navigate(-1)
    },
    onError: (error: Error) => {
      addToast({ title: 'Approval failed', description: error.message, variant: 'destructive' })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!task || !currentUser) throw new Error('Missing data')
      const response = await rejectTask(task.id, currentUser.id, reason)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setRejectionDialogOpen(false)
      addToast({ title: 'Task rejected', description: 'The annotator has been notified', variant: 'default' })
      navigate(-1)
    },
    onError: (error: Error) => {
      addToast({ title: 'Rejection failed', description: error.message, variant: 'destructive' })
    },
  })

  // Handle split pane dragging
  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const container = e.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    const position = ((e.clientY - rect.top) / rect.height) * 100
    setSplitPosition(position)
  }, [isDragging, setSplitPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Check if reviewer needs to claim the task
  const needsToClaim = task && currentUser && (
    (isReviewer && task.status === TaskStatus.AwaitingReview) ||
    (isFinalReviewer && task.status === TaskStatus.AwaitingFinalReview)
  )

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-1">
          <div className="w-1/2 border-r border-border">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="w-1/2">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <p className="text-muted-foreground">Task not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.5))] flex-col -m-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Task #{task.id.slice(-8)}</h1>
          <StatusBadge status={task.status} />
        </div>
        {needsToClaim && (
          <button
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            className="text-sm text-primary hover:underline"
          >
            {claimMutation.isPending ? 'Claiming...' : 'Claim this task to review'}
          </button>
        )}
      </div>

      {/* Split Pane */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Image Panel */}
        <div
          className="overflow-hidden border-r border-border"
          style={{ height: `${splitPosition}%` }}
        >
          <ImageCanvas imageUrl={task.imageUrl} />
        </div>

        {/* Resize Handle */}
        <div
          className={cn(
            'flex h-1 cursor-row-resize items-center justify-center bg-border hover:bg-primary/50 transition-colors',
            isDragging && 'bg-primary'
          )}
          onMouseDown={handleMouseDown}
        >
          <GripHorizontal className="h-2 w-4 text-muted-foreground" />
        </div>

        {/* Text Panel */}
        <div
          className="overflow-hidden"
          style={{ height: `${100 - splitPosition}%` }}
        >
          <TextPanel
            noisyText={task.noisyText}
            correctedText={text}
            onTextChange={setText}
            readOnly={!canEdit}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <FooterActions
        taskStatus={task.status}
        isSaving={saveMutation.isPending}
        isSubmitting={submitMutation.isPending || approveMutation.isPending}
        unsavedChanges={unsavedChanges}
        onSave={canEdit ? () => saveMutation.mutate() : undefined}
        onSubmit={canEdit ? () => submitMutation.mutate() : undefined}
        onApprove={
          (task.status === TaskStatus.InReview || task.status === TaskStatus.FinalReview) &&
          (task.reviewerId === currentUser?.id || task.finalReviewerId === currentUser?.id)
            ? () => approveMutation.mutate()
            : undefined
        }
        onReject={
          (task.status === TaskStatus.InReview || task.status === TaskStatus.FinalReview) &&
          (task.reviewerId === currentUser?.id || task.finalReviewerId === currentUser?.id)
            ? () => setRejectionDialogOpen(true)
            : undefined
        }
      />

      {/* Rejection Dialog */}
      <RejectionDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
        onConfirm={(reason) => rejectMutation.mutate(reason)}
        isLoading={rejectMutation.isPending}
      />
    </div>
  )
}
