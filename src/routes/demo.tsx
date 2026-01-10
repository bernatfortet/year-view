import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@nanostores/react'

import { YearView } from '../components/calendar/YearView'
import { LinearYearView } from '../components/calendar/LinearYearView'
import { TripsView } from '../components/trips/TripsView'
import { useCalendars } from '../context/CalendarContext'
import { demoEvents } from '../data/demo-data'
import { $year } from '../components/calendar/calendar.store'
import { $activeView } from '../stores/view.store'
import { $excludeTerms } from '../stores/settings.store'

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})

function DemoPage() {
  const year = useStore($year)
  const activeView = useStore($activeView)
  const excludeTerms = useStore($excludeTerms)

  const { selectedCalendarIds } = useCalendars()
  const selectedIds = useMemo(() => Array.from(selectedCalendarIds), [selectedCalendarIds])

  // Filter events by selected calendars and exclude terms
  const filteredEvents = useMemo(() => {
    const selectedSet = new Set(selectedIds)

    const calendarFiltered = demoEvents.filter((event) => selectedSet.has(event.calendarId))

    if (excludeTerms.length === 0) return calendarFiltered

    const result = calendarFiltered.filter((event) => {
      const summaryLower = event.summary.toLowerCase()
      const matchesExcludeTerm = excludeTerms.some((term) => summaryLower.includes(term.toLowerCase()))

      return !matchesExcludeTerm
    })

    return result
  }, [selectedIds, excludeTerms])

  return (
    <div className='relative'>
      {activeView === 'year' && <YearView year={year} events={filteredEvents} />}
      {activeView === 'linear' && <LinearYearView year={year} events={filteredEvents} />}
      {activeView === 'trips' && <TripsView events={filteredEvents} year={year} />}
    </div>
  )
}
