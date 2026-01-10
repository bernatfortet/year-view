import { useMemo, useState } from 'react'
import { Plane } from 'lucide-react'

import { Row, Column } from '@/styles'

import type { CalendarEvent } from '../calendar/types'
import { filterAndEnrichTrips, type Trip } from './trip-utils'
import { TripCard } from './TripCard'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

type TripFilter = 'upcoming' | 'past'

interface TripsViewProps {
  events: CalendarEvent[]
  year: number
}

export function TripsView(props: TripsViewProps) {
  const { events, year } = props

  const [filter, setFilter] = useState<TripFilter>('upcoming')

  const allTrips = useMemo(() => filterAndEnrichTrips(events), [events])

  const { upcomingTrips, pastTrips } = useMemo(() => {
    return splitTripsByTime(allTrips)
  }, [allTrips])

  const displayedTrips = filter === 'upcoming' ? upcomingTrips : pastTrips

  if (allTrips.length === 0) {
    return <EmptyState year={year} />
  }

  return (
    <Column className='max-w-2xl mx-auto px-4 py-8'>
      <Row className='items-center justify-between mb-6'>
        <h2 className='text-xl font-bold text-primary'>Trips in {year}</h2>

        <TripFilterTabs filter={filter} onFilterChange={setFilter} upcomingCount={upcomingTrips.length} pastCount={pastTrips.length} />
      </Row>

      {displayedTrips.length === 0 ? (
        <NoTripsForFilter filter={filter} />
      ) : (
        <Column className='space-y-3'>
          {displayedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </Column>
      )}
    </Column>
  )
}

function TripFilterTabs(props: {
  filter: TripFilter
  onFilterChange: (filter: TripFilter) => void
  upcomingCount: number
  pastCount: number
}) {
  const { filter, onFilterChange, upcomingCount, pastCount } = props

  return (
    <Tabs value={filter} onValueChange={(value) => onFilterChange(value as TripFilter)}>
      <TabsList>
        <TabsTrigger value='upcoming'>Upcoming ({upcomingCount})</TabsTrigger>
        <TabsTrigger value='past'>Past ({pastCount})</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

function splitTripsByTime(trips: Trip[]): { upcomingTrips: Trip[]; pastTrips: Trip[] } {
  const upcomingTrips = trips.filter((trip) => !trip.isPast)
  const pastTrips = trips.filter((trip) => trip.isPast)

  return { upcomingTrips, pastTrips }
}

function NoTripsForFilter(props: { filter: TripFilter }) {
  const { filter } = props

  const message = filter === 'upcoming' ? 'No upcoming trips' : 'No past trips'

  return (
    <div className='text-center py-12 text-tertiary'>
      <p>{message}</p>
    </div>
  )
}

function EmptyState(props: { year: number }) {
  const { year } = props

  return (
    <Row className='items-center justify-center min-h-[60vh]'>
      <Column className='max-w-md mx-auto px-4'>
        <Row className='w-16 h-16 bg-stone-100 rounded-2xl items-center justify-center mx-auto mb-6'>
          <Plane className='w-8 h-8 text-tertiary' />
        </Row>

        <h2 className='text-xl font-semibold mb-3 text-center'>No Trips Found</h2>

        <Column className='gap-3 text-sm text-tertiary'>
          <p>Events with "Trip" in the title appear here, organized by upcoming and past.</p>

          <div className='bg-stone-50 rounded-md px-3 py-2'>
            <span className='text-tertiary'>Example:</span> <span className='font-medium text-primary'>Trip to Japan</span>
          </div>

          <p>
            Trips have three states: with "?" shows "Needs planning", with a description shows flight/travel info, without either shows
            "Needs info".
          </p>

          <p className='text-xs'>Add flight details in the event description to see them rendered.</p>
        </Column>
      </Column>
    </Row>
  )
}
