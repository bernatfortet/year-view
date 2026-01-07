import { Calendar, CheckCircle2, Plane, ExternalLink } from 'lucide-react'

import { cn } from '../../lib/utils'
import type { Trip } from './trip-utils'
import { formatTripDateRange, getTripDisplayName } from './trip-utils'
import { TripMinimap } from './TripMinimap'
import { FlightInfo } from './FlightInfo'

interface TripCardProps {
  trip: Trip
}

export function TripCard(props: TripCardProps) {
  const { trip } = props

  const displayName = getTripDisplayName(trip)
  const dateRange = formatTripDateRange(trip)

  return (
    <a
      href={trip.htmlLink ?? '#'}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'group block rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-stone-300',
        trip.isPast && 'opacity-50',
      )}
    >
      <div className='flex items-start gap-3'>
        <StatusIcon trip={trip} />

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-stone-900 truncate'>{displayName}</h3>
            {trip.tripStatus === 'todo' && <TodoBadge />}
            <ExternalLink className='size-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
          </div>

          <p className='text-sm text-stone-500 mt-0.5'>{dateRange}</p>

          {trip.tripStatus === 'has-info' && trip.description && <FlightInfo description={trip.description} />}
        </div>

        <TripMinimap startDate={trip.startDate} endDate={trip.endDate} backgroundColor={trip.backgroundColor} />
      </div>
    </a>
  )
}

function StatusIcon(props: { trip: Trip }) {
  const { trip } = props

  const iconClasses = 'size-5'

  if (trip.tripStatus === 'todo') {
    return (
      <div className='rounded-lg bg-amber-100 p-2 text-amber-600'>
        <CheckCircle2 className={iconClasses} />
      </div>
    )
  }

  if (trip.tripStatus === 'has-info') {
    return (
      <div className='rounded-lg bg-sky-100 p-2 text-sky-600'>
        <Plane className={iconClasses} />
      </div>
    )
  }

  return (
    <div className='rounded-lg bg-stone-100 p-2 text-stone-600'>
      <Calendar className={iconClasses} />
    </div>
  )
}

function TodoBadge() {
  return (
    <span className='inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 shrink-0'>
      Needs planning
    </span>
  )
}
