import { createContext, useContext, type ReactNode } from 'react'

interface DemoContextType {
  isDemoMode: boolean
}

const DemoContext = createContext<DemoContextType | null>(null)

interface DemoProviderProps {
  children: ReactNode
  isDemoMode: boolean
}

export function DemoProvider(props: DemoProviderProps) {
  const { children, isDemoMode } = props

  return <DemoContext.Provider value={{ isDemoMode }}>{children}</DemoContext.Provider>
}

/**
 * Hook to check if we're in demo mode
 * Returns false if used outside of DemoProvider (default behavior for real app)
 */
export function useDemoMode(): boolean {
  const context = useContext(DemoContext)

  // If not wrapped in DemoProvider, we're not in demo mode
  if (!context) return false

  return context.isDemoMode
}
