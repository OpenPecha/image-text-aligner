import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserForm } from './user-form'
import { useCreateUser, useUpdateUser } from '../../api/user'
import { useGetGroups } from '../../api/group'
import type { User } from '@/types'
import type { UserFormData } from '@/schema/user-schema'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const { data: groups = [] } = useGetGroups()

  const isEditing = !!user
  const isSubmitting = createUser.isPending || updateUser.isPending

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && user) {
        await updateUser.mutateAsync({
          id: user.id,
          data: {
            name: data.name,
            role: data.role,
            groupId: data.groupId || undefined,
          },
        })
      } else {
        await createUser.mutateAsync({
          name: data.name,
          email: data.email,
          role: data.role,
          groupId: data.groupId || undefined,
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  const defaultValues: Partial<UserFormData> | undefined = user
    ? {
        name: user.name,
        email: user.email,
        role: user.role,
        groupId: user.groupId ?? '',
      }
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the user details below.'
              : 'Fill in the details to add a new user.'}
          </DialogDescription>
        </DialogHeader>

        <UserForm
          key={user?.id ?? 'new'}
          defaultValues={defaultValues}
          groups={groups}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? 'Update' : '+ Create'}
          isEditMode={isEditing}
        />
      </DialogContent>
    </Dialog>
  )
}

