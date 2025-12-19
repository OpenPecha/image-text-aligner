import { Navigate } from 'react-router-dom'
import { LoginForm, useAuth } from '@/features/auth'

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show nothing while checking auth status
  if (isLoading) {
    return null
  }

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginForm />
}
