import { useQuery } from '@tanstack/react-query'
import { User, Mail, Calendar } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllUsers } from '@/services/api'
import { ROLE_CONFIG, UserRole } from '@/types'
import { formatDate } from '@/lib/date-utils'

const roleVariant: Record<UserRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [UserRole.Admin]: 'destructive',
  [UserRole.Transcriber]: 'default',
  [UserRole.Reviewer]: 'secondary',
  [UserRole.FinalReviewer]: 'outline',
}

function UserRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  )
}

export function UserTable() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await getAllUsers()
      return response.data || []
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          View and manage all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <UserRowSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={roleVariant[user.role]}>
                  {ROLE_CONFIG[user.role].label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

