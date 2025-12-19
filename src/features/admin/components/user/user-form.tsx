import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { userSchema, type UserFormData } from '@/schema/user-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRole, ROLE_CONFIG, type Group } from '@/types'

export interface UserFormProps {
  defaultValues?: Partial<UserFormData>
  groups: Group[]
  onSubmit: (data: UserFormData) => void
  isSubmitting?: boolean
  submitLabel?: string
  isEditMode?: boolean
}

export function UserForm({
  defaultValues,
  groups,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Create',
  isEditMode = false,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      role: defaultValues?.role ?? UserRole.Annotator,
      groupId: defaultValues?.groupId ?? '',
    },
  })

  const selectedRole = watch('role')
  const selectedGroupId = watch('groupId')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">User name</Label>
        <Input
          id="name"
          placeholder="Enter user name"
          {...register('name')}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter user email"
          {...register('email')}
          disabled={isSubmitting || isEditMode}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setValue('role', value as UserRole)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="group">Group</Label>
        <Select
          value={selectedGroupId}
          onValueChange={(value) => setValue('groupId', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="group">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.groupId && (
          <p className="text-sm text-destructive">{errors.groupId.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

