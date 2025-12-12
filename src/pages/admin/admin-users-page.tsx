import { UserTable } from '@/features/admin'

export function AdminUsersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all users in the system
        </p>
      </div>

      <UserTable />
    </div>
  )
}

