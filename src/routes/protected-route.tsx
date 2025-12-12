import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/use-user-store'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useUserStore()
  const location = useLocation()

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

