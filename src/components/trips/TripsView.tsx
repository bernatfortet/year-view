import { useMemo } from 'react'
import { Plane } from 'lucide-react'

import type { CalendarEvent } from '../calendar/types'
import { filterAndEnrichTrips } from './trip-utils'
import { TripCard } from './TripCard'

interface TripsViewProps {
  events: CalendarEvent[]
  year: number
}

export function TripsView(props: TripsViewProps) {
  const { events, year } = props

  const trips = useMemo(() => filterAndEnrichTrips(events), [events])

  if (trips.length === 0) {
    return <EmptyState year={year} />
  }

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-stone-900'>Trips in {year}</h2>
        <p className='text-sm text-stone-500 mt-1'>
          {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
        </p>
      </div>

      <div className='space-y-3'>
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  )
}

function EmptyState(props: { year: number }) {
  const { year } = props

  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-6'>
          <Plane className='w-8 h-8 text-stone-400' />
        </div>

        <h2 className='text-xl font-semibold mb-3'>No Trips Found</h2>

        <p className='text-muted-foreground'>
          No events containing "trip" found for {year}. Create all-day events with "trip" in the title to see them here.
        </p>
      </div>
    </div>
  )
}

