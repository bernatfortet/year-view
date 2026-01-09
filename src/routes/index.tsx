import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@nanostores/react'

import { YearView } from '../components/calendar/YearView'
import { LinearYearView } from '../components/calendar/LinearYearView'
import { TripsView } from '../components/trips/TripsView'
import { LandingPage } from '../components/landing/LandingPage'
import { LoadingState } from '../components/states/LoadingState'
import { ErrorState } from '../components/states/ErrorState'
import { NoCalendarsState } from '../components/states/NoCalendarsState'
import { useAuth } from '../context/AuthContext'
import { useCalendars } from '../context/CalendarContext'
import { useCachedEvents } from '../hooks/use-cached-events'
import { $year } from '../components/calendar/calendar.store'
import { $activeView } from '../stores/view.store'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const year = useStore($year)
  const activeView = useStore($activeView)

  const { isAuthenticated, isLoading: authLoading, signIn } = useAuth()
  const { calendars, selectedCalendarIds, isLoadingCalendars } = useCalendars()

  const allCalendarIds = useMemo(() => calendars.map((c) => c.id), [calendars])
  const selectedIds = useMemo(() => Array.from(selectedCalendarIds), [selectedCalendarIds])

  const { events, error } = useCachedEvents({
    year,
    allCalendarIds,
    selectedCalendarIds: selectedIds,
    isAuthenticated,
  })

  if (authLoading || (isLoadingCalendars && calendars.length === 0)) return <LoadingState />
  if (!isAuthenticated) return <LandingPage signIn={signIn} />
  if (selectedIds.length === 0) return <NoCalendarsState />
  if (error) return <ErrorState error={error} />

  return (
    <div className='relative'>
      {activeView === 'year' && <YearView year={year} events={events} />}
      {activeView === 'linear' && <LinearYearView year={year} events={events} />}
      {activeView === 'trips' && <TripsView events={events} year={year} />}
    </div>
  )
}
