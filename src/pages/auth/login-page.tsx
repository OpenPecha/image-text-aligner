import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth'
import { useUserStore } from '@/store/use-user-store'

export function LoginPage() {
  const { isAuthenticated } = useUserStore()

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginForm />
}

