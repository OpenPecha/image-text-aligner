import { Loader2, Save, Send, XCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/use-user-store'
import { TaskStatus, UserRole } from '@/types'

interface FooterActionsProps {
  taskStatus: TaskStatus
  isSaving?: boolean
  isSubmitting?: boolean
  unsavedChanges?: boolean
  onSave?: () => void
  onSubmit?: () => void
  onApprove?: () => void
  onReject?: () => void
}

export function FooterActions({
  taskStatus,
  isSaving,
  isSubmitting,
  unsavedChanges,
  onSave,
  onSubmit,
  onApprove,
  onReject,
}: FooterActionsProps) {
  const navigate = useNavigate()
  const { user } = useUserStore()

  if (!user) return null

  const isTranscriber = user.role === UserRole.Transcriber
  const isReviewer = user.role === UserRole.Reviewer
  const isFinalReviewer = user.role === UserRole.FinalReviewer
  const isAdmin = user.role === UserRole.Admin

  // Determine which actions to show based on role and task status
  const canEdit = 
    (isTranscriber && (taskStatus === TaskStatus.InProgress || taskStatus === TaskStatus.Rejected)) ||
    isAdmin

  const canSubmit = 
    (isTranscriber && (taskStatus === TaskStatus.InProgress || taskStatus === TaskStatus.Rejected)) ||
    isAdmin

  const canReview = 
    (isReviewer && taskStatus === TaskStatus.InReview) ||
    (isFinalReviewer && taskStatus === TaskStatus.FinalReview) ||
    isAdmin

  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {unsavedChanges && (
          <span className="text-xs text-warning">Unsaved changes</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Save button - for transcribers editing */}
        {canEdit && onSave && (
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving || !unsavedChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
        )}

        {/* Submit button - for transcribers */}
        {canSubmit && onSubmit && (
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </>
            )}
          </Button>
        )}

        {/* Review actions - for reviewers */}
        {canReview && (
          <>
            <Button
              variant="destructive"
              onClick={onReject}
              disabled={isSubmitting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="success"
              onClick={onApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

