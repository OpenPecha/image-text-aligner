import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { loginUser } from '@/services/api'
import { useUserStore } from '@/store/use-user-store'
import { useUIStore } from '@/store/use-ui-store'

export function useAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, logout, setLoading } = useUserStore()
  const { addToast } = useUIStore()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const loginMutation = useMutation({
    mutationFn: async (email: string) => {
      setLoading(true)
      const response = await loginUser(email)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed')
      }
      return response.data
    },
    onSuccess: (user) => {
      login(user)
      addToast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
        variant: 'success',
      })
      navigate(from, { replace: true })
    },
    onError: (error: Error) => {
      setLoading(false)
      addToast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleLogout = () => {
    logout()
    addToast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    })
    navigate('/login')
  }

  return {
    login: loginMutation.mutate,
    logout: handleLogout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  }
}

