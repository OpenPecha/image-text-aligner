import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { setAuthTokenGetter } from '@/lib/auth'
import { AuthContext } from './auth-context'
import { UserRole } from '@/types'
import type { User, CreateUserDTO } from '@/types'

interface AuthProviderProps {
  children: ReactNode
}

// API call to create or fetch user
async function syncUserWithBackend(userData: CreateUserDTO, token: string): Promise<User> {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error('Failed to sync user with backend')
  }

  return response.json()
}

// Inner provider that uses Auth0 hooks
const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
    error,
  } = useAuth0()

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(false)

  // Combined loading state
  const isLoading = auth0Loading || isUserLoading

  // Set up API token getter when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setAuthTokenGetter(getAccessTokenSilently)
    }
  }, [isAuthenticated, getAccessTokenSilently])

  // Sync user with backend when authenticated
  useEffect(() => {
    async function syncUser() {
      if (!isAuthenticated || !auth0User?.email || auth0Loading) {
        return
      }

      setIsUserLoading(true)

      try {
        const token = await getAccessTokenSilently()

        const userData: CreateUserDTO = {
          name: auth0User.name || auth0User.nickname || auth0User.email,
          email: auth0User.email,
          picture: auth0User.picture,
        }

        const user = await syncUserWithBackend(userData, token)
        setCurrentUser(user)

        // Store token for API calls
        localStorage.setItem('auth_token', token)
      } catch (err) {
        console.error('Failed to sync user:', err)
        // Still set a basic user from Auth0 data
        setCurrentUser({
          id: auth0User.sub || '',
          name: auth0User.name || auth0User.nickname || auth0User.email,
          email: auth0User.email,
          role: UserRole.Admin, // Default role
          picture: auth0User.picture,
        })
      } finally {
        setIsUserLoading(false)
      }
    }

    syncUser()
  }, [isAuthenticated, auth0User, auth0Loading, getAccessTokenSilently])

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessTokenSilently()
      if (token) {
        localStorage.setItem('auth_token', token)
      }
      return token
    } catch (err) {
      console.error('Error getting Auth0 token:', err)
      return null
    }
  }, [getAccessTokenSilently])

  const login = useCallback(() => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/callback`,
      },
    })
  }, [loginWithRedirect])

  const logout = useCallback(() => {
    // Clear stored tokens and user
    localStorage.removeItem('auth_token')
    setCurrentUser(null)

    auth0Logout({
      logoutParams: {
        returnTo: `${window.location.origin}/login`,
      },
    })
  }, [auth0Logout])

  const contextValue = useMemo(() => ({
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout,
    getToken,
    error: error?.message || null,
  }), [isAuthenticated, isLoading, currentUser, login, logout, getToken, error])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Main provider that wraps everything with Auth0
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}/callback`

  // Validate required env vars
  if (!domain || !clientId) {
    console.error('Auth0 configuration missing. Please set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID')
    return <>{children}</>
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        audience: audience,
      }}
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      cacheLocation="localstorage"
    >
      <AuthContextProvider>{children}</AuthContextProvider>
    </Auth0Provider>
  )
}

export default AuthProvider
