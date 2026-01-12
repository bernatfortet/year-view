import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

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

export const AUTH_STORAGE_KEY = 'yeartrips_was_authenticated'

export function getWasAuthenticated(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function setWasAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') return

  try {
    if (value) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  // Only show loading if user was previously authenticated (or we have initialUser)
  const [isLoading, setIsLoading] = useState(() => {
    if (initialUser) return false
    return getWasAuthenticated()
  })
  const hasCheckedRef = useRef(false)

  const refreshSession = useCallback(async () => {
    const wasAuthenticated = getWasAuthenticated()

    // Only show loading spinner if user was previously authenticated
    if (wasAuthenticated) setIsLoading(true)

    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const newUser = data.user || null
        setUser(newUser)
        setWasAuthenticated(!!newUser)
      } else {
        setUser(null)
        setWasAuthenticated(false)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
      setUser(null)
      setWasAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sync localStorage when initialUser is provided (from SSR)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (initialUser) setWasAuthenticated(true)
  }, [initialUser])

  // Check session ONCE on mount - client only
  // Skip if we have initialUser from SSR (already authenticated)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasCheckedRef.current) return
    if (initialUser) return

    hasCheckedRef.current = true
    refreshSession()
  }, [initialUser, refreshSession])

  const signIn = useCallback(() => {
    // Redirect to the OAuth initiation endpoint
    window.location.href = '/api/auth/google'
  }, [])

  const signOut = useCallback(() => {
    // Clear local state and localStorage immediately for better UX
    setUser(null)
    setWasAuthenticated(false)

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
