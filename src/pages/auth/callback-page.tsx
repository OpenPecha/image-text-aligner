import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { Loader2 } from 'lucide-react'

export function CallbackPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, error } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true })
      } else if (error) {
        navigate('/login', { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, error, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {error ? 'Authentication failed. Redirecting...' : 'Completing sign in...'}
        </p>
      </div>
    </div>
  )
}

