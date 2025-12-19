import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { LoadingSpinner } from '@/components/common'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to their default dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
