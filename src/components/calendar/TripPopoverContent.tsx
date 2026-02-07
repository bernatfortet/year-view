import { Calendar, Car, CheckCircle2, Mail, Plane, PlaneLanding } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Row, Column } from '@/styles'

import { FlightInfo } from '../trips/FlightInfo'
import { TripMinimap } from '../trips/TripMinimap'
import { extractGmailLink, stripGmailLink } from '../trips/trip-description'
import type { Trip } from '../trips/trip-utils'
import { formatTripDateRange, getTripDisplayName } from '../trips/trip-utils'

interface TripPopoverContentProps {
  trip: Trip
}

export function TripPopoverContent(props: TripPopoverContentProps) {
  const { trip } = props

  const displayName = getTripDisplayName(trip)
  const dateRange = formatTripDateRange(trip)
  const emailLink = extractGmailLink(trip.description)
  const cleanedDescription = stripGmailLink(trip.description)

  return (
    <Column className='w-[370px] max-w-[410px] gap-2 p-3'>
      <Row className='items-start gap-2'>
        <StatusIcon trip={trip} />

        <Column className='flex-1 min-w-0 gap-1'>
          <Row className='items-center gap-1.5'>
            <span className='text-sm font-semibold text-primary truncate'>{displayName}</span>
            <TripStatusBadges trip={trip} />
            {emailLink && <ViewEmailLink href={emailLink} />}
          </Row>

          <span className='text-[11px] text-tertiary font-medium'>{dateRange}</span>
        </Column>

        <TripMinimap startDate={trip.startDate} endDate={trip.endDate} tripStatus={trip.tripStatus} />
      </Row>

      {trip.tripStatus === 'has-info' && cleanedDescription && (
        <FlightInfo description={cleanedDescription} className='mt-2 gap-1' />
      )}
    </Column>
  )
}

function StatusIcon(props: { trip: Trip }) {
  const { trip } = props

  const iconClasses = 'size-3.5'
  const isCarTrip = trip.summary.toLowerCase().includes('car')

  if (trip.tripStatus === 'todo') {
    return (
      <div className='rounded-md bg-amber-100 p-2 text-amber-600'>
        <CheckCircle2 className={iconClasses} />
      </div>
    )
  }

  if (trip.tripStatus === 'has-info') {
    const TripIcon = trip.isVisit ? PlaneLanding : isCarTrip ? Car : Plane

    return (
      <div className='rounded-md bg-brand-red/10 p-2 text-brand-red'>
        <TripIcon className={iconClasses} />
      </div>
    )
  }

  if (trip.isVisit) {
    return (
      <div className='rounded-md bg-blue-100 p-2 text-blue-600'>
        <PlaneLanding className={iconClasses} />
      </div>
    )
  }

  return (
    <div className='rounded-md bg-stone-100 p-2 text-tertiary'>
      <Calendar className={iconClasses} />
    </div>
  )
}

function TripStatusBadges(props: { trip: Trip }) {
  const { trip } = props

  return (
    <>
      {trip.tripStatus === 'todo' && <TodoBadge />}
      {trip.tripStatus === 'pending' && <NeedsInfoBadge />}
      {trip.tripStatus === 'has-info' && trip.summary.includes('?') && <TentativeBadge />}
    </>
  )
}

function TodoBadge() {
  return (
    <span className='inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 shrink-0'>
      Needs planning
    </span>
  )
}

function NeedsInfoBadge() {
  return (
    <span className='inline-flex items-center rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-tertiary shrink-0'>
      Needs info
    </span>
  )
}

function TentativeBadge() {
  return (
    <span className='inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 shrink-0'>
      Tentative
    </span>
  )
}

function ViewEmailLink(props: { href: string }) {
  const { href } = props

  function handleClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    window.open(href, '_blank')
  }

  return (
    <Button variant='ghost' size='xs' onClick={handleClick} className='gap-1 rounded-full'>
      <Mail className='size-3' />
      View Email
    </Button>
  )
}
