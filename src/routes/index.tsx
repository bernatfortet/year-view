import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@nanostores/react'

import { YearView } from '../components/calendar/YearView'
import { useAuth } from '../context/AuthContext'
import { useCalendars } from '../context/CalendarContext'
import { useCachedEvents } from '../hooks/use-cached-events'
import { $year } from '../components/calendar/calendar.store'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const year = useStore($year)

  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { calendars, selectedCalendarIds, isLoadingCalendars } = useCalendars()

  // Get all calendar IDs for fetching
  const allCalendarIds = useMemo(() => calendars.map((c) => c.id), [calendars])

  // Get selected calendar IDs for filtering
  const selectedIds = useMemo(() => Array.from(selectedCalendarIds), [selectedCalendarIds])

  // Use cached events - fetches all calendars, filters client-side (instant toggle!)
  const { events, isLoading, isRefreshing, error } = useCachedEvents({
    year,
    allCalendarIds,
    selectedCalendarIds: selectedIds,
    isAuthenticated,
  })

  // Show loading state while checking auth
  if (authLoading || isLoadingCalendars) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt when not authenticated
  if (!isAuthenticated) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
            <svg className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>

          <h2 className='text-2xl font-bold mb-3'>View Your Year at a Glance</h2>

          <p className='text-muted-foreground mb-6'>
            Sign in with Google to see all your all-day calendar events for the entire year in one view.
          </p>

          <p className='text-sm text-muted-foreground/70'>Click "Sign in with Google" in the sidebar to get started.</p>
        </div>
      </div>
    )
  }

  // Show empty state when no calendars selected
  if (selectedIds.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6'>
            <svg className='w-8 h-8 text-muted-foreground' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>

          <h2 className='text-xl font-semibold mb-3'>No Calendars Selected</h2>

          <p className='text-muted-foreground'>Select one or more calendars from the sidebar to view events.</p>
        </div>
      </div>
    )
  }

  // Show loading overlay only when we have no cached events
  if (isLoading && events.length === 0) {
    return (
      <div className='relative'>
        <YearView year={year} events={[]} />

        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
            <p className='text-muted-foreground'>Loading events for {year}...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6'>
            <svg className='w-8 h-8 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>

          <h2 className='text-xl font-bold mb-3'>Failed to Load Events</h2>

          <p className='text-muted-foreground mb-6'>{error}</p>

          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='relative'>
      <YearView year={year} events={events} />

      {/* Subtle refresh indicator when updating cached data */}
      {isRefreshing && (
        <div className='fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-muted/90 backdrop-blur-sm rounded-full shadow-lg text-sm text-muted-foreground'>
          <div className='w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
          <span>Syncing...</span>
        </div>
      )}
    </div>
  )
}
