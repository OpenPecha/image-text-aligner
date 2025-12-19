import { GroupList } from '@/features/admin/components'

export function AdminGroupsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
        <p className="text-muted-foreground mt-1">
          Organize users into groups and manage their roles
        </p>
      </div>

      <GroupList />
    </div>
  )
}

