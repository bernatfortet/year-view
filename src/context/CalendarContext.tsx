import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

import { useAuth } from './AuthContext'
import type { GoogleCalendar } from '@/routes/api/calendar/list'

const SELECTED_CALENDARS_KEY = 'year-view:selected-calendars'

interface CalendarContextType {
  calendars: GoogleCalendar[]
  selectedCalendarIds: Set<string>
  isLoadingCalendars: boolean
  error: string | null
  toggleCalendar: (calendarId: string) => void
  selectAll: () => void
  deselectAll: () => void
  refreshCalendars: () => Promise<void>
}

const CalendarContext = createContext<CalendarContextType | null>(null)

interface CalendarProviderProps {
  children: ReactNode
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const { isAuthenticated } = useAuth()

  const [calendars, setCalendars] = useState<GoogleCalendar[]>([])
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<Set<string>>(new Set())
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Save selection to localStorage whenever it changes
  useEffect(() => {
    if (!hasInitialized) return

    saveSelectedCalendars(selectedCalendarIds)
  }, [selectedCalendarIds, hasInitialized])

  // Fetch calendar list
  const refreshCalendars = useCallback(async () => {
    if (!isAuthenticated) {
      setCalendars([])
      setSelectedCalendarIds(new Set())
      return
    }

    setIsLoadingCalendars(true)
    setError(null)

    try {
      const response = await fetch('/api/calendar/list', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch calendars')
      }

      const data = await response.json()
      const fetchedCalendars: GoogleCalendar[] = data.calendars || []

      setCalendars(fetchedCalendars)

      // On first load, try to restore from localStorage
      if (!hasInitialized) {
        const savedSelection = loadSelectedCalendars()
        const validCalendarIds = new Set(fetchedCalendars.map((c) => c.id))

        if (savedSelection) {
          // Filter saved selection to only include valid calendar IDs
          const restoredSelection = new Set(
            savedSelection.filter((id) => validCalendarIds.has(id))
          )

          // Use restored selection if it has any valid calendars
          if (restoredSelection.size > 0) {
            setSelectedCalendarIds(restoredSelection)
            setHasInitialized(true)
            return
          }
        }

        // Fallback: use Google's default selection or primary calendar
        const initialSelected = new Set<string>()
        const selectedByGoogle = fetchedCalendars.filter((c) => c.selected)

        if (selectedByGoogle.length > 0) {
          selectedByGoogle.forEach((c) => initialSelected.add(c.id))
        } else {
          const primary = fetchedCalendars.find((c) => c.primary)
          if (primary) initialSelected.add(primary.id)
        }

        setSelectedCalendarIds(initialSelected)
        setHasInitialized(true)
      }
    } catch (err) {
      console.error('🚨 Error fetching calendars:', err)
      setError('Failed to load calendars')
    } finally {
      setIsLoadingCalendars(false)
    }
  }, [isAuthenticated, hasInitialized])

  // Fetch calendars when auth state changes
  useEffect(() => {
    refreshCalendars()
  }, [refreshCalendars])

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCalendars([])
      setSelectedCalendarIds(new Set())
      setHasInitialized(false)
      setError(null)
    }
  }, [isAuthenticated])

  const toggleCalendar = useCallback((calendarId: string) => {
    setSelectedCalendarIds((prev) => {
      const next = new Set(prev)

      if (next.has(calendarId)) {
        next.delete(calendarId)
      } else {
        next.add(calendarId)
      }

      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedCalendarIds(new Set(calendars.map((c) => c.id)))
  }, [calendars])

  const deselectAll = useCallback(() => {
    setSelectedCalendarIds(new Set())
  }, [])

  const value: CalendarContextType = {
    calendars,
    selectedCalendarIds,
    isLoadingCalendars,
    error,
    toggleCalendar,
    selectAll,
    deselectAll,
    refreshCalendars,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendars(): CalendarContextType {
  const context = useContext(CalendarContext)

  if (!context) {
    throw new Error('useCalendars must be used within a CalendarProvider')
  }

  return context
}

/**
 * Hook to get selected calendar IDs as an array
 * Useful for passing to API calls
 */
export function useSelectedCalendarIds(): string[] {
  const { selectedCalendarIds } = useCalendars()
  return Array.from(selectedCalendarIds)
}

// Load selected calendars from localStorage
function loadSelectedCalendars(): string[] | null {
  try {
    const saved = localStorage.getItem(SELECTED_CALENDARS_KEY)
    if (!saved) return null

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return null

    return parsed
  } catch {
    return null
  }
}

// Save selected calendars to localStorage
function saveSelectedCalendars(selectedIds: Set<string>) {
  try {
    const idsArray = Array.from(selectedIds)
    localStorage.setItem(SELECTED_CALENDARS_KEY, JSON.stringify(idsArray))
  } catch (err) {
    console.warn('Failed to save calendar selection:', err)
  }
}
