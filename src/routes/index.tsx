import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@nanostores/react'

import { YearView } from '../components/calendar/YearView'
import { LinearYearView } from '../components/calendar/LinearYearView'
import { TripsView } from '../components/trips/TripsView'
import { LandingPage } from '../components/landing/LandingPage'
import { LoadingEventsOverlay } from '../components/states/LoadingEventsOverlay'
import { ErrorState } from '../components/states/ErrorState'
import { NoCalendarsState } from '../components/states/NoCalendarsState'
import { useAuth, getWasAuthenticated } from '../context/AuthContext'
import { useCalendars } from '../context/CalendarContext'
import { useCachedEvents } from '../hooks/use-cached-events'
import { $year } from '../components/calendar/calendar.store'
import { $activeView } from '../stores/view.store'

// Read localStorage IMMEDIATELY at module load to avoid flash
const INITIAL_WAS_AUTHENTICATED = getWasAuthenticated()

// Check if we have cached events for current year (read at module load)
function hasCachedEventsForYear(year: number): boolean {
  if (typeof window === 'undefined') return false
  try {
    const cacheKey = `year-view:events:${year}`
    return localStorage.getItem(cacheKey) !== null
  } catch {
    return false
  }
}

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const year = useStore($year)
  const activeView = useStore($activeView)

  const { isAuthenticated, isLoading: authLoading, signIn } = useAuth()
  const { calendars, selectedCalendarIds, isLoadingCalendars, hasInitialized: calendarsInitialized } = useCalendars()

  // Use module-level constant - read at module load time on client
  // This ensures localStorage is checked BEFORE first render
  const wasAuthenticated = INITIAL_WAS_AUTHENTICATED

  const allCalendarIds = useMemo(() => calendars.map((c) => c.id), [calendars])
  const selectedIds = useMemo(() => Array.from(selectedCalendarIds), [selectedCalendarIds])

  const {
    events,
    hasInitialized: eventsInitialized,
    error,
  } = useCachedEvents({
    year,
    allCalendarIds,
    selectedCalendarIds: selectedIds,
    isAuthenticated,
  })

  // Show landing page ONLY when:
  // 1. Auth check is complete, AND
  // 2. User is not authenticated, AND
  // 3. localStorage doesn't have the "was authenticated" hint
  // This prevents the flash for returning users
  const showLandingPage = !authLoading && !isAuthenticated && !wasAuthenticated

  if (showLandingPage) return <LandingPage signIn={signIn} />

  // User is authenticated - show calendar (only show NoCalendarsState after calendars have loaded)
  if (calendarsInitialized && !isLoadingCalendars && selectedIds.length === 0 && !authLoading && isAuthenticated)
    return <NoCalendarsState />

  if (error) return <ErrorState error={error} />

  // Check if we have cached events for this year
  const hasCachedEvents = hasCachedEventsForYear(year)

  // Show loading overlay until we have events to display
  // - First-time user: show until calendars + events load
  // - Returning user with cache: show briefly until cache is loaded into state
  const isClient = typeof window !== 'undefined'
  const hasEventsToShow = events.length > 0
  const isWaitingForCache = hasCachedEvents && !eventsInitialized
  const isFirstTimeLoad = !hasCachedEvents && (authLoading || isLoadingCalendars || !calendarsInitialized || !eventsInitialized)
  // Never render the overlay during SSR. SSR should render the calendar skeleton so we avoid a "blank background" first paint.
  const showLoadingOverlay = isClient && !hasEventsToShow && (isWaitingForCache || isFirstTimeLoad)

  // While loading, show the overlay
  if (showLoadingOverlay) return <LoadingEventsOverlay />

  return (
    <div className='relative'>
      {activeView === 'year' && <YearView year={year} events={events} />}
      {activeView === 'linear' && <LinearYearView year={year} events={events} />}
      {activeView === 'trips' && <TripsView events={events} year={year} />}
    </div>
  )
}
