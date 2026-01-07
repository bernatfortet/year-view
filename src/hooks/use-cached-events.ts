import { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '@nanostores/react'

import type { CalendarEvent } from '../components/calendar/types'
import { $eventsRefreshTrigger, $isSyncingEvents } from '../stores/events.store'
import { $excludeTerms } from '../stores/settings.store'

const CACHE_KEY_PREFIX = 'year-view:events:'
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 // 24 hours

interface CachedData {
  events: CalendarEvent[]
  timestamp: number
  year: number
}

interface UseCachedEventsParams {
  year: number
  allCalendarIds: string[] // All available calendars to fetch
  selectedCalendarIds: string[] // Currently selected calendars to display
  isAuthenticated: boolean
}

interface UseCachedEventsResult {
  events: CalendarEvent[] // Filtered events based on selection
  allEvents: CalendarEvent[] // All fetched events
  isLoading: boolean
  isSyncing: boolean // True while fetching fresh data from Google Calendar
  error: string | null
  refetch: () => void
}

export function useCachedEvents(params: UseCachedEventsParams): UseCachedEventsResult {
  const { year, allCalendarIds, selectedCalendarIds, isAuthenticated } = params

  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use global store for sync state so other components can access it
  const isSyncing = useStore($isSyncingEvents)

  // Use ref to track if we have cached data
  const hasCachedDataRef = useRef(false)

  // Listen for manual refresh trigger from sidebar
  const refreshTrigger = useStore($eventsRefreshTrigger)

  // Get exclude terms for filtering
  const excludeTerms = useStore($excludeTerms)

  // Generate cache key based on year only (we fetch all calendars)
  const cacheKey = `${CACHE_KEY_PREFIX}${year}`

  // Fetch events when year changes or calendars list changes
  const calendarIdsKey = [...allCalendarIds].sort().join(',')

  useEffect(() => {
    if (!isAuthenticated) {
      setAllEvents([])
      setError(null)
      hasCachedDataRef.current = false
      return
    }

    if (allCalendarIds.length === 0) {
      setAllEvents([])
      setError(null)
      hasCachedDataRef.current = false
      return
    }

    // Try to load from cache first
    const cached = loadFromCache(cacheKey)
    const hasCache = cached !== null

    hasCachedDataRef.current = hasCache

    if (hasCache) {
      console.log('📦 Loaded from cache:', cached.events.length, 'events')
      setAllEvents(cached.events)
    }

    // Always fetch fresh data in background
    console.log('🔄 Fetching fresh data...', { hasCache, showLoading: !hasCache })

    fetchEventsFromApi({
      year,
      calendarIds: allCalendarIds,
      cacheKey,
      showLoading: !hasCache,
      setAllEvents,
      setIsLoading,
      setError,
      hasCachedDataRef,
    })
  }, [isAuthenticated, year, calendarIdsKey, cacheKey])

  // Handle manual refresh trigger from sidebar
  const initialTriggerRef = useRef(refreshTrigger)

  useEffect(() => {
    // Skip initial mount - only respond to actual refresh requests
    if (refreshTrigger === initialTriggerRef.current) return
    if (!isAuthenticated || allCalendarIds.length === 0) return

    console.log('🔄 Manual refresh triggered')

    fetchEventsFromApi({
      year,
      calendarIds: allCalendarIds,
      cacheKey,
      showLoading: false,
      setAllEvents,
      setIsLoading,
      setError,
      hasCachedDataRef,
    })
  }, [refreshTrigger, isAuthenticated, year, allCalendarIds, cacheKey])

  // Filter events client-side based on selected calendars (instant!)
  const selectedCalendarIdsSet = useMemo(() => new Set(selectedCalendarIds), [selectedCalendarIds])

  const filteredEvents = useMemo(() => {
    if (selectedCalendarIds.length === 0) return []

    const calendarFiltered = allEvents.filter((event) => selectedCalendarIdsSet.has(event.calendarId))

    // Apply exclusion filter
    if (excludeTerms.length === 0) return calendarFiltered

    const result = calendarFiltered.filter((event) => {
      const summaryLower = event.summary.toLowerCase()
      const matchesExcludeTerm = excludeTerms.some((term) => summaryLower.includes(term.toLowerCase()))

      return !matchesExcludeTerm
    })

    return result
  }, [allEvents, selectedCalendarIdsSet, selectedCalendarIds.length, excludeTerms])

  // Manual refetch
  function refetch() {
    if (!isAuthenticated || allCalendarIds.length === 0) return

    fetchEventsFromApi({
      year,
      calendarIds: allCalendarIds,
      cacheKey,
      showLoading: false,
      setAllEvents,
      setIsLoading,
      setError,
      hasCachedDataRef,
    })
  }

  return {
    events: filteredEvents,
    allEvents,
    isLoading,
    isSyncing,
    error,
    refetch,
  }
}

// Pure function to load from cache
function loadFromCache(cacheKey: string): CachedData | null {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const data: CachedData = JSON.parse(cached)

    // Check if cache is expired
    const isExpired = Date.now() - data.timestamp > CACHE_EXPIRY_MS
    if (isExpired) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return data
  } catch {
    return null
  }
}

// Pure function to save to cache
function saveToCache(params: { cacheKey: string; events: CalendarEvent[]; year: number }) {
  const { cacheKey, events, year } = params

  try {
    const data: CachedData = {
      events,
      timestamp: Date.now(),
      year,
    }

    localStorage.setItem(cacheKey, JSON.stringify(data))
  } catch (err) {
    console.warn('Failed to cache events:', err)
  }
}

// Fetch events from API
async function fetchEventsFromApi(params: {
  year: number
  calendarIds: string[]
  cacheKey: string
  showLoading: boolean
  setAllEvents: (events: CalendarEvent[]) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  hasCachedDataRef: React.MutableRefObject<boolean>
}) {
  const {
    year,
    calendarIds,
    cacheKey,
    showLoading,
    setAllEvents,
    setIsLoading,
    setError,
    hasCachedDataRef,
  } = params

  if (showLoading) {
    setIsLoading(true)
  }

  // Always set syncing state via store (accessible globally)
  $isSyncingEvents.set(true)

  setError(null)

  try {
    const calendarIdsParam = calendarIds.join(',')

    const response = await fetch(
      `/api/calendar/events?year=${year}&calendarIds=${encodeURIComponent(calendarIdsParam)}`,
      { credentials: 'include' }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch events')
    }

    const fetchedEvents = data.events || []

    console.log('✅ Fetched fresh data:', fetchedEvents.length, 'events')

    setAllEvents(fetchedEvents)
    hasCachedDataRef.current = true

    saveToCache({ cacheKey, events: fetchedEvents, year })
  } catch (err) {
    console.error('🚨 Failed to fetch events:', err)

    // Only set error if we don't have cached data
    if (!hasCachedDataRef.current) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    }
  } finally {
    setIsLoading(false)
    $isSyncingEvents.set(false)
  }
}
