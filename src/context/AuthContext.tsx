import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: () => void
  signOut: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
  initialUser?: User | null
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(!initialUser)

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()

        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check session on mount
  useEffect(() => {
    if (!initialUser) {
      refreshSession()
    }
  }, [initialUser, refreshSession])

  const signIn = useCallback(() => {
    // Redirect to the OAuth initiation endpoint
    window.location.href = '/api/auth/google'
  }, [])

  const signOut = useCallback(() => {
    // Clear local state immediately for better UX
    setUser(null)

    // Redirect to sign out endpoint to clear cookies
    window.location.href = '/api/auth/signout'
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Hook to check if user is authenticated
 * Useful for protecting routes or conditional rendering
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * Hook to get the current user
 * Returns null if not authenticated
 */
export function useUser(): User | null {
  const { user } = useAuth()
  return user
}

