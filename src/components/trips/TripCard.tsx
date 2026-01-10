import { Calendar, Car, CheckCircle2, Mail, Plane, ExternalLink } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Row, Column } from '@/styles'
import { Button } from '@/components/ui/button'

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
  const emailLink = extractGmailLink(trip.description)
  const cleanedDescription = stripGmailLink(trip.description)

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
      <Row className='items-start gap-3'>
        <StatusIcon trip={trip} />

        <Column className='flex-1 min-w-0'>
          <Row className='items-center gap-2'>
            <h3 className='font-semibold text-[16px] text-primary truncate'>{displayName}</h3>
            {trip.tripStatus === 'todo' && <TodoBadge />}
            {trip.tripStatus === 'pending' && <NeedsInfoBadge />}
            {trip.tripStatus === 'has-info' && trip.summary.includes('?') && <TentativeBadge />}
            {emailLink && <ViewEmailLink href={emailLink} />}
            <ExternalLink className='size-3.5 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
          </Row>

          <p className='text-[13px] text-tertiary font-medium'>{dateRange}</p>

          {trip.tripStatus === 'has-info' && cleanedDescription && <FlightInfo description={cleanedDescription} />}
        </Column>

        <TripMinimap startDate={trip.startDate} endDate={trip.endDate} tripStatus={trip.tripStatus} />
      </Row>
    </a>
  )
}

function StatusIcon(props: { trip: Trip }) {
  const { trip } = props

  const iconClasses = 'size-[20px]'
  const isCarTrip = trip.summary.toLowerCase().includes('car')

  if (trip.tripStatus === 'todo') {
    return (
      <div className='rounded-lg bg-amber-100 p-3 text-amber-600'>
        <CheckCircle2 className={iconClasses} />
      </div>
    )
  }

  if (trip.tripStatus === 'has-info') {
    const TripIcon = isCarTrip ? Car : Plane

    return (
      <div className='rounded-lg bg-brand-red/10 p-3 text-brand-red'>
        <TripIcon className={iconClasses} />
      </div>
    )
  }

  return (
    <div className='rounded-lg bg-stone-100 p-3 text-tertiary'>
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

function NeedsInfoBadge() {
  return (
    <span className='inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-tertiary shrink-0'>
      Needs info
    </span>
  )
}

function TentativeBadge() {
  return (
    <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 shrink-0'>
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

/**
 * Extracts a Gmail link from the description if present.
 * Looks for URLs starting with "mail.google.com" or "https://mail.google"
 */
function extractGmailLink(description?: string): string | null {
  if (!description) return null

  // Match URLs in href attributes or plain text
  const hrefMatch = description.match(/href=["']?(https?:\/\/mail\.google\.com[^"'\s<>]*)/i)
  if (hrefMatch) return hrefMatch[1]

  // Match plain URL
  const plainMatch = description.match(/(https?:\/\/mail\.google\.com[^\s<>"']*)/i)
  if (plainMatch) return plainMatch[1]

  return null
}

/**
 * Removes Gmail links from the description (including surrounding <a> tags).
 */
function stripGmailLink(description?: string): string {
  if (!description) return ''

  let cleaned = description

  // Remove <a> tags containing mail.google.com
  cleaned = cleaned.replace(/<a[^>]*href=["']?https?:\/\/mail\.google\.com[^"']*["']?[^>]*>.*?<\/a>/gi, '')

  // Remove plain mail.google.com URLs
  cleaned = cleaned.replace(/https?:\/\/mail\.google\.com[^\s<>"']*/gi, '')

  // Clean up extra whitespace and newlines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim()

  return cleaned
}
